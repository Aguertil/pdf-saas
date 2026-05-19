from fastapi import HTTPException

from app.models import PLAN_LIMITS, PlanTier, User


def check_pdf_quota(user: User) -> None:
    limits = PLAN_LIMITS[user.plan]
    if user.pdfs_used_this_month >= limits["pdfs_per_month"]:
        raise HTTPException(
            status_code=402,
            detail=f"Quota mensuel atteint ({limits['pdfs_per_month']} PDF). Passez à un plan supérieur.",
        )


def check_file_size(size_bytes: int, plan: PlanTier) -> None:
    max_mb = PLAN_LIMITS[plan]["max_size_mb"]
    if size_bytes > max_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"Fichier trop volumineux (max {max_mb} Mo pour le plan {plan.value})",
        )


def check_ocr_quota(user: User, pages: int = 1) -> None:
    limits = PLAN_LIMITS[user.plan]
    if user.ocr_pages_used_this_month + pages > limits["ocr_pages"]:
        raise HTTPException(
            status_code=402,
            detail="Quota OCR mensuel atteint",
        )


def increment_pdf_usage(user: User) -> None:
    user.pdfs_used_this_month += 1


def increment_ocr_usage(user: User, pages: int = 1) -> None:
    user.ocr_pages_used_this_month += pages
