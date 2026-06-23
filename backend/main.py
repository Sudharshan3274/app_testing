from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import interview, resume, compiler

app = FastAPI(title="Interviu AI API")

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No local DB startup needed anymore since we use Firebase

# Include Routers
# Auth is handled natively on the frontend via Firebase
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(compiler.router, prefix="/api/compiler", tags=["Compiler"])
app.include_router(resume.router)

@app.get("/")
def root():
    return {"message": "Welcome to Interviu AI Backend"}
