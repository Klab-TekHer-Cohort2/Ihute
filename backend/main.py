from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
from admin_routes import router as admin_router
from alerts_routes import router as alerts_router
from assistant_routes import router as assistant_router
from auth_routes import router as auth_router
from reports_routes import router as reports_router
from review_routes import router as review_router
from storage import UPLOAD_DIR

Base.metadata.create_all(bind=engine)

app = FastAPI(title="IHUTE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(reports_router)
app.include_router(review_router)
app.include_router(alerts_router)
app.include_router(admin_router)
app.include_router(assistant_router)

# Served under /api so the frontend's /api proxy reaches it (photos: /api/uploads/images/xyz.jpg)
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def root():
    return {"message": "IHUTE backend is running"}


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    version = db.execute(text("SELECT PostGIS_Version()")).scalar()
    return {"postgis": version}

