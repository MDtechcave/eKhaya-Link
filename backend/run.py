import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth 
from app.routes import properties

app = FastAPI(
    title="eKhaya Link Verification API", 
    description="Anti-Scam Property Vetting Engine for Khayelitsha"
)

app.include_router(auth.router)
app.include_router(properties.router)

# Open access specifically for your local Next.js frontend server
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, etc.
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "eKhaya Link Security Core",
        "message": "Anti-scam verification database online."
    }

if __name__ == "__main__":
    # Boots up the local development server on port 8000
    uvicorn.run("run:app", host="127.0.0.1", port=8000, reload=True)
