"""Crée un compte admin par défaut: admin@pdfmaster.app / Admin123!"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal, Base, engine
from app.models import User, PlanTier
from app.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()
email = "admin@pdfmaster.app"
if not db.query(User).filter(User.email == email).first():
    db.add(
        User(
            email=email,
            hashed_password=hash_password("Admin123!"),
            full_name="Administrateur",
            plan=PlanTier.BUSINESS,
            is_admin=True,
        )
    )
    db.commit()
    print(f"Admin créé: {email} / Admin123!")
else:
    print("Admin existe déjà")
db.close()
