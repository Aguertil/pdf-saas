"""
OCR via Hugging Face Inference API (gratuit avec token HF).
Sans token: extraction texte native PyMuPDF (gratuit, local).
"""
import logging
from typing import Any

import fitz
import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

HF_OCR_MODEL = "microsoft/trocr-base-printed"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_OCR_MODEL}"


async def ocr_page_from_pdf(file_path: str, page_index: int) -> dict[str, Any]:
    doc = fitz.open(file_path)
    if page_index < 0 or page_index >= len(doc):
        doc.close()
        raise ValueError("Page invalide")

    page = doc[page_index]
    native_text = page.get_text().strip()
    doc.close()

    if not settings.HF_TOKEN:
        return {
            "source": "pymupdf",
            "text": native_text,
            "message": "HF_TOKEN non configuré — extraction native utilisée",
        }

    doc = fitz.open(file_path)
    page = doc[page_index]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    img_bytes = pix.tobytes("png")
    doc.close()

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                HF_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.HF_TOKEN}",
                    "Content-Type": "image/png",
                },
                content=img_bytes,
            )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and data:
                text = data[0].get("generated_text", native_text)
            elif isinstance(data, dict):
                text = data.get("generated_text", native_text)
            else:
                text = str(data)
            return {"source": "huggingface", "model": HF_OCR_MODEL, "text": text}
        logger.warning("HF OCR %s: %s", response.status_code, response.text[:300])
    except Exception as e:
        logger.exception("HF OCR failed: %s", e)

    return {"source": "pymupdf_fallback", "text": native_text}
