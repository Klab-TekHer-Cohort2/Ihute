from fastapi import FastAPI

app = FastAPI(title="IHUTE API")

@app.get("/")
def root():
    return {"message": "IHUTE backend is running"}