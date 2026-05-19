import json
import os
from pathlib import Path
from typing import Any

import fitz

from app.config import get_settings

settings = get_settings()


def ensure_upload_dir() -> Path:
    path = Path(settings.UPLOAD_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def analyze_fonts(file_path: str) -> dict[str, Any]:
    """Extrait polices, tailles et blocs texte par page."""
    doc = fitz.open(file_path)
    pages_meta: list[dict[str, Any]] = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks: list[dict[str, Any]] = []
        font_set: dict[str, dict[str, Any]] = {}

        text_dict = page.get_text("dict")
        for block in text_dict.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    font_name = span.get("font", "unknown")
                    size = round(span.get("size", 12), 2)
                    text = span.get("text", "").strip()
                    if not text:
                        continue
                    key = f"{font_name}|{size}"
                    font_set[key] = {"font": font_name, "size": size}
                    blocks.append(
                        {
                            "text": text,
                            "font": font_name,
                            "size": size,
                            "bbox": span.get("bbox"),
                            "color": span.get("color"),
                        }
                    )

        pages_meta.append(
            {
                "page": page_num,
                "fonts": list(font_set.values()),
                "text_blocks": blocks[:200],
            }
        )

    page_count = len(doc)
    doc.close()
    return {"page_count": page_count, "pages": pages_meta}


def replace_text_preserve_style(
    file_path: str,
    page_index: int,
    old_text: str,
    new_text: str,
    add_watermark: bool = False,
) -> None:
    """Remplace du texte en réutilisant police et taille du span trouvé."""
    doc = fitz.open(file_path)
    if page_index < 0 or page_index >= len(doc):
        doc.close()
        raise ValueError("Page invalide")

    page = doc[page_index]
    instances = page.search_for(old_text)
    if not instances:
        doc.close()
        raise ValueError(f"Texte introuvable: {old_text!r}")

    # Récupérer style du premier span correspondant
    font_name = "helv"
    font_size = 11.0
    color = (0, 0, 0)

    text_dict = page.get_text("dict")
    for block in text_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                if old_text in span.get("text", ""):
                    font_name = span.get("font", font_name)
                    font_size = span.get("size", font_size)
                    c = span.get("color", 0)
                    if isinstance(c, int):
                        color = (
                            ((c >> 16) & 255) / 255,
                            ((c >> 8) & 255) / 255,
                            (c & 255) / 255,
                        )
                    break

    for rect in instances:
        page.add_redact_annot(rect, fill=(1, 1, 1))
    page.apply_redactions()

    for rect in instances:
        page.insert_textbox(
            rect,
            new_text,
            fontname=font_name,
            fontsize=font_size,
            color=color,
            align=fitz.TEXT_ALIGN_LEFT,
        )

    if add_watermark:
        _add_watermark(doc)

    doc.save(file_path, incremental=True, encryption=fitz.PDF_ENCRYPT_KEEP)
    doc.close()


def update_form_field(file_path: str, field_name: str, value: str) -> None:
    doc = fitz.open(file_path)
    found = False
    for page in doc:
        for widget in page.widgets() or []:
            if widget.field_name == field_name:
                widget.field_value = value
                widget.update()
                found = True
    if not found:
        doc.close()
        raise ValueError(f"Champ introuvable: {field_name}")
    doc.save(file_path, incremental=True, encryption=fitz.PDF_ENCRYPT_KEEP)
    doc.close()


def reorder_pages(file_path: str, order: list[int]) -> None:
    doc = fitz.open(file_path)
    if sorted(order) != list(range(len(doc))):
        doc.close()
        raise ValueError("Ordre de pages invalide")
    doc.select(order)
    doc.save(file_path, garbage=4, deflate=True)
    doc.close()


def _add_watermark(doc: fitz.Document) -> None:
    for page in doc:
        rect = page.rect
        page.insert_text(
            (rect.width / 2 - 80, rect.height - 30),
            "PDFMaster — Plan Gratuit",
            fontsize=8,
            color=(0.7, 0.7, 0.7),
            rotate=0,
        )


def export_with_watermark(src: str, dst: str, watermark: bool) -> None:
    doc = fitz.open(src)
    if watermark:
        _add_watermark(doc)
    doc.save(dst)
    doc.close()


def get_page_count(file_path: str) -> int:
    doc = fitz.open(file_path)
    n = len(doc)
    doc.close()
    return n
