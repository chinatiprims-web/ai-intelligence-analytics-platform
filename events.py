import csv, io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, User
from ..schemas import EventIn, EventOut
from ..dependencies import current_user

router = APIRouter(prefix="/api/events", tags=["events"])

@router.post("", response_model=EventOut, status_code=201)
def create_event(payload: EventIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    event = Event(owner_id=user.id, source=payload.source, event_type=payload.event_type,
                  value=payload.value, metadata_json=payload.metadata)
    db.add(event); db.commit(); db.refresh(event)
    return {"id": event.id, "source": event.source, "event_type": event.event_type,
            "value": event.value, "metadata": event.metadata_json, "created_at": event.created_at}

@router.get("", response_model=list[EventOut])
def list_events(limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db),
                user: User = Depends(current_user)):
    rows = db.query(Event).filter(Event.owner_id == user.id).order_by(Event.created_at.desc()).limit(limit).all()
    return [{"id": e.id, "source": e.source, "event_type": e.event_type, "value": e.value,
             "metadata": e.metadata_json, "created_at": e.created_at} for e in rows]

@router.get("/export")
def export_events(db: Session = Depends(get_db), user: User = Depends(current_user)):
    rows = db.query(Event).filter(Event.owner_id == user.id).order_by(Event.created_at.desc()).all()
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(["id", "source", "event_type", "value", "created_at", "metadata"])
    for e in rows:
        writer.writerow([e.id, e.source, e.event_type, e.value, e.created_at.isoformat(), str(e.metadata_json)])
    return Response(stream.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=analytics-events.csv"})
