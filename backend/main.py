from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="IHUTE API")


@app.get("/")
def root():
    return {"message": "IHUTE backend is running"}


@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    version = db.execute(text("SELECT PostGIS_Version()")).scalar()
    return {"postgis": version}