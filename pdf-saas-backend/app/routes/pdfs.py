import json
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PLAN_LIMITS, Document, User
from app.schemas import DocumentOut, FieldEditRequest, PageReorderRequest, TextEditRequest
from app.security import get_current_user
from app.services import huggingface_service, pdf_service, quota_service

router = APIRouter(prefix="/api/pdfs", tags=["pdfs"])


def _doc_to_out(doc: Document) -> DocumentOut:
    meta = json.loads(doc.font_metadata) if doc.font_metadata else None
    return DocumentOut(
        id=doc.id,
        original_filename=doc.original_filename,
        page_count=doc.page_count,
        font_metadata=meta,
        created_at=doc.created_at,
    )


@router.post("/upload", response_model=DocumentOut)
async def upload_pdf(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quota_service.check_pdf_quota(user)
    content = await file.read()
    quota_service.check_file_size(len(content), user.plan)

    upload_dir = pdf_service.ensure_upload_dir()
    ext = Path(file.filename or "doc.pdf").suffix or ".pdf"
    stored_name = f"{user.id}_{uuid.uuid4().hex}{ext}"
    file_path = upload_dir / stored_name

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        meta = pdf_service.analyze_fonts(str(file_path))
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"PDF invalide: {e}")

    doc = Document(
        owner_id=user.id,
        filename=stored_name,
        original_filename=file.filename or "document.pdf",
        file_path=str(file_path),
        page_count=meta["page_count"],
        font_metadata=json.dumps(meta, ensure_ascii=False),
    )
    db.add(doc)
    quota_service.increment_pdf_usage(user)
    db.commit()
    db.refresh(doc)
    return _doc_to_out(doc)


@router.get("/", response_model=list[DocumentOut])
def list_pdfs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.owner_id == user.id).order_by(Document.created_at.desc()).all()
    return [_doc_to_out(d) for d in docs]


@router.get("/{doc_id}", response_model=DocumentOut)
def get_pdf(doc_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = _get_owned_doc(doc_id, user, db)
    return _doc_to_out(doc)


@router.get("/{doc_id}/download")
def download_pdf(doc_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = _get_owned_doc(doc_id, user, db)
    limits = PLAN_LIMITS[user.plan]
    if limits["watermark"]:
        export_path = Path(doc.file_path).parent / f"export_{doc.id}.pdf"
        pdf_service.export_with_watermark(doc.file_path, str(export_path), watermark=True)
        return FileResponse(str(export_path), filename=doc.original_filename, media_type="application/pdf")
    return FileResponse(doc.file_path, filename=doc.original_filename, media_type="application/pdf")


@router.get("/{doc_id}/file")
def serve_pdf_file(doc_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = _get_owned_doc(doc_id, user, db)
    return FileResponse(doc.file_path, media_type="application/pdf")


@router.post("/{doc_id}/edit-text")
def edit_text(
    doc_id: int,
    body: TextEditRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = _get_owned_doc(doc_id, user, db)
    try:
        pdf_service.replace_text_preserve_style(
            doc.file_path,
            body.page,
            body.old_text,
            body.new_text,
            add_watermark=False,
            bbox=body.bbox,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    meta = pdf_service.analyze_fonts(doc.file_path)
    doc.font_metadata = json.dumps(meta, ensure_ascii=False)
    db.commit()
    return {"ok": True, "message": "Texte modifié avec préservation du style"}


@router.post("/{doc_id}/edit-field")
def edit_field(
    doc_id: int,
    body: FieldEditRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = _get_owned_doc(doc_id, user, db)
    try:
        pdf_service.update_form_field(doc.file_path, body.field_name, body.value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


@router.post("/{doc_id}/reorder-pages")
def reorder_pages(
    doc_id: int,
    body: PageReorderRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = _get_owned_doc(doc_id, user, db)
    try:
        pdf_service.reorder_pages(doc.file_path, body.order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    doc.page_count = pdf_service.get_page_count(doc.file_path)
    db.commit()
    return {"ok": True, "page_count": doc.page_count}


@router.post("/{doc_id}/ocr/{page_index}")
async def ocr_page(
    doc_id: int,
    page_index: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = _get_owned_doc(doc_id, user, db)
    quota_service.check_ocr_quota(user, 1)
    result = await huggingface_service.ocr_page_from_pdf(doc.file_path, page_index)
    quota_service.increment_ocr_usage(user, 1)
    db.commit()
    return result


@router.delete("/{doc_id}")
def delete_pdf(doc_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = _get_owned_doc(doc_id, user, db)
    Path(doc.file_path).unlink(missing_ok=True)
    db.delete(doc)
    db.commit()
    return {"ok": True}


def _get_owned_doc(doc_id: int, user: User, db: Session) -> Document:
    doc = db.query(Document).filter(Document.id == doc_id, Document.owner_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document introuvable")
    return doc
