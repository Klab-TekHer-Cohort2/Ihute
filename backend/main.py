from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import get_db

app = FastAPI(title="IHUTE API")

@app.get("/")
def root():
    return {"message": "IHUTE backend is running"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    version = db.execute(text("SELECT PostGIS_Version()")).scalar()
    return {"postgis": version}