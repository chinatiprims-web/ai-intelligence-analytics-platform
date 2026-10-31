from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import Event

def dashboard_summary(db: Session, owner_id: int):
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=30)
    previous = now - timedelta(days=60)
    q = db.query(Event).filter(Event.owner_id == owner_id, Event.created_at >= start)
    total = q.count()
    sources = q.with_entities(Event.source).distinct().count()
    value = q.with_entities(func.coalesce(func.sum(Event.value), 0)).scalar() or 0
    old_total = db.query(Event).filter(
        Event.owner_id == owner_id, Event.created_at >= previous, Event.created_at < start
    ).count()
    delta = ((total - old_total) / old_total * 100) if old_total else (100.0 if total else 0.0)
    rows = q.order_by(Event.created_at.desc()).limit(500).all()
    values = [r.value for r in rows]
    mean = sum(values) / len(values) if values else 0
    variance = sum((v - mean) ** 2 for v in values) / len(values) if values else 0
    std = variance ** 0.5
    anomalies = sum(1 for v in values if std > 0 and abs(v - mean) > 2.5 * std)
    return {"total_events": total, "active_sources": sources, "total_value": round(float(value), 2),
            "anomaly_count": anomalies, "events_delta": round(delta, 1)}

def timeseries(db: Session, owner_id: int, days: int = 14):
    start = datetime.now(timezone.utc) - timedelta(days=days)
    rows = db.query(Event).filter(Event.owner_id == owner_id, Event.created_at >= start).all()
    buckets = {}
    for event in rows:
        key = event.created_at.strftime("%Y-%m-%d")
        item = buckets.setdefault(key, {"date": key, "events": 0, "value": 0.0})
        item["events"] += 1
        item["value"] += event.value
    return sorted(buckets.values(), key=lambda x: x["date"])

def source_breakdown(db: Session, owner_id: int):
    rows = db.query(Event.source, func.count(Event.id).label("count")).filter(
        Event.owner_id == owner_id
    ).group_by(Event.source).order_by(func.count(Event.id).desc()).all()
    return [{"source": source, "count": count} for source, count in rows]
