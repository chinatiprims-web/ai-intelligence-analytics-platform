from datetime import datetime, timedelta, timezone
import random
from .database import SessionLocal
from .models import User, Event
from .security import hash_password

def seed_demo():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "demo@aianalytics.local").first()
        if not user:
            user = User(email="demo@aianalytics.local", full_name="Demo Analyst",
                        hashed_password=hash_password("DemoPass123!"), role="admin")
            db.add(user); db.commit(); db.refresh(user)
        if db.query(Event).filter(Event.owner_id == user.id).count() == 0:
            sources = ["web-app", "mobile-app", "api-gateway", "iot-sensor"]
            types = ["page_view", "conversion", "api_request", "sensor_reading"]
            now = datetime.now(timezone.utc)
            batch = []
            for i in range(420):
                day = random.randint(0, 29)
                value = random.gauss(42, 12)
                if i % 97 == 0: value *= 4.2
                batch.append(Event(owner_id=user.id, source=random.choice(sources),
                    event_type=random.choice(types), value=round(max(0, value), 2),
                    metadata_json={"sample": True, "sequence": i},
                    created_at=now - timedelta(days=day, hours=random.randint(0, 23))))
            db.add_all(batch); db.commit()
    finally:
        db.close()
