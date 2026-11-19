from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
from auth_routes import router as auth_router
from reports_routes import router as reports_router
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

# Served under /api so the frontend's /api proxy reaches it (photos: /api/uploads/images/xyz.jpg)
app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def root():
    return {"message": "IHUTE backend is running"}


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    version = db.execute(text("SELECT PostGIS_Version()")).scalar()
    return {"postgis": version}
