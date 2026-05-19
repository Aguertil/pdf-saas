from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field

from app.models import PlanTier


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None
    plan: PlanTier
    is_admin: bool
    pdfs_used_this_month: int
    ocr_pages_used_this_month: int

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PlanInfo(BaseModel):
    tier: PlanTier
    price_eur: int
    limits: dict[str, Any]


class DocumentOut(BaseModel):
    id: int
    original_filename: str
    page_count: int
    font_metadata: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TextEditRequest(BaseModel):
    page: int = Field(ge=0)
    old_text: str
    new_text: str


class FieldEditRequest(BaseModel):
    field_name: str
    value: str


class PageReorderRequest(BaseModel):
    order: list[int]


class AdminUserOut(BaseModel):
    id: int
    email: str
    full_name: str | None
    plan: PlanTier
    is_active: bool
    pdfs_used_this_month: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminStats(BaseModel):
    total_users: int
    users_by_plan: dict[str, int]
    total_documents: int
    active_users_30d: int
