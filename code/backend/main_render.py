import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from ai.body_analysis.gemini_service import ask_gemini

app = FastAPI(title="SmartFit AI - Cloud API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/chat")
async def chat(question: str):
    answer = ask_gemini(question)
    return {"answer": answer}

@app.get("/outfits")
async def outfits(skin_tone: str):
    all_outfits = [
        {"name": "Rust linen shirt + chinos", "color": "#CB997E", "occasion": "Everyday", "style": "Casual"},
        {"name": "Olive bomber + white tee", "color": "#A5A58D", "occasion": "Weekend", "style": "Streetwear"},
        {"name": "Mustard co-ord set", "color": "#DDBEA9", "occasion": "Festive", "style": "Traditional"},
        {"name": "Navy blazer + trousers", "color": "#1B2A4A", "occasion": "Office", "style": "Formal"},
        {"name": "White linen kurta", "color": "#F5F5F5", "occasion": "Casual", "style": "Minimal"},
    ]
    return {"outfits": all_outfits}

@app.post("/style-dna")
async def style_dna(file: UploadFile = File(...)):
    return {
        "status": "success",
        "style_dna": {
            "skin_tone": {"tone": "Warm Medium"},
            "body_shape": {"body_shape": "Inverted Triangle"},
            "shape_rules": {
                "fit_tip": "Balance broad shoulders with volume on the lower half",
                "avoid": ["Heavy shoulder details"],
                "prefer": ["A-line skirts", "Wide leg pants"]
            }
        }
    }