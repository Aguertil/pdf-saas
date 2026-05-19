from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document, PlanTier, User
from app.schemas import AdminStats, AdminUserOut
from app.security import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStats)
def admin_stats(
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_documents = db.query(func.count(Document.id)).scalar() or 0
    users_by_plan = {t.value: 0 for t in PlanTier}
    for tier, count in db.query(User.plan, func.count(User.id)).group_by(User.plan).all():
        users_by_plan[tier.value] = count
    since = datetime.utcnow() - timedelta(days=30)
    active = db.query(func.count(User.id)).filter(User.created_at >= since).scalar() or 0
    return AdminStats(
        total_users=total_users,
        users_by_plan=users_by_plan,
        total_documents=total_documents,
        active_users_30d=active,
    )


@router.get("/users", response_model=list[AdminUserOut])
def list_users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/plan")
def set_user_plan(
    user_id: int,
    tier: PlanTier,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.plan = tier
    db.commit()
    return {"ok": True, "user_id": user_id, "plan": tier}


@router.patch("/users/{user_id}/toggle-active")
def toggle_user(
    user_id: int,
    _: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.is_active = not user.is_active
    db.commit()
    return {"ok": True, "is_active": user.is_active}
