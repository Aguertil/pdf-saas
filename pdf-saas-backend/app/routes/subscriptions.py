from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PLAN_LIMITS, PLAN_PRICES_EUR, PlanTier, User
from app.schemas import PlanInfo
from app.security import get_current_user

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.get("/plans", response_model=list[PlanInfo])
def list_plans():
    return [
        PlanInfo(tier=tier, price_eur=PLAN_PRICES_EUR[tier], limits=PLAN_LIMITS[tier])
        for tier in PlanTier
    ]


@router.post("/upgrade/{tier}")
def upgrade_plan(
    tier: PlanTier,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """MVP: changement de plan sans Stripe (intégration Stripe en v1.1)."""
    user.plan = tier
    db.commit()
    return {"ok": True, "plan": tier, "message": "Plan mis à jour (paiement simulé en MVP)"}
