from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.chatbot import router as chatbot_router
from routes.admin import router as admin_router  
from db.database import Base, engine

# Créer les tables automatiquement
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chatbot RAG API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"]) 

@app.get("/")
def root():
    return {"message": "🚀 API en ligne avec création automatique des tables"}
