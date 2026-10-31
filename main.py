import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import auth, events, analytics
from .seed import seed_demo

app = FastAPI(title="AI Intelligence Analytics Platform", version="1.0.0",
              description="Multi-tenant event analytics and anomaly monitoring API")
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router); app.include_router(events.router); app.include_router(analytics.router)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    seed_demo()

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-analytics-api"}

@app.websocket("/ws/live")
async def live_metrics(websocket: WebSocket):
    await websocket.accept()
    try:
        counter = 0
        while True:
            counter += 1
            await websocket.send_json({"type": "heartbeat", "sequence": counter,
                                       "active": True})
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        return
