import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PlanTier(str, enum.Enum):
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    BUSINESS = "business"


PLAN_LIMITS = {
    PlanTier.FREE: {"pdfs_per_month": 5, "max_size_mb": 10, "ocr_pages": 3, "watermark": True},
    PlanTier.STARTER: {"pdfs_per_month": 50, "max_size_mb": 25, "ocr_pages": 50, "watermark": False},
    PlanTier.PRO: {"pdfs_per_month": 200, "max_size_mb": 50, "ocr_pages": 9999, "watermark": False},
    PlanTier.BUSINESS: {"pdfs_per_month": 999999, "max_size_mb": 100, "ocr_pages": 9999, "watermark": False},
}

PLAN_PRICES_EUR = {
    PlanTier.FREE: 0,
    PlanTier.STARTER: 9,
    PlanTier.PRO: 19,
    PlanTier.BUSINESS: 30,
}


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    plan: Mapped[PlanTier] = mapped_column(Enum(PlanTier), default=PlanTier.FREE)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    pdfs_used_this_month: Mapped[int] = mapped_column(Integer, default=0)
    ocr_pages_used_this_month: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    documents: Mapped[list["Document"]] = relationship(back_populates="owner")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    filename: Mapped[str] = mapped_column(String(512))
    original_filename: Mapped[str] = mapped_column(String(512))
    file_path: Mapped[str] = mapped_column(String(1024))
    page_count: Mapped[int] = mapped_column(Integer, default=0)
    font_metadata: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    owner: Mapped["User"] = relationship(back_populates="documents")
