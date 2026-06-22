import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

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
    try:
        response = model.generate_content(question)
        return {"answer": response.text}
    except Exception as e:
        return {"answer": str(e)}

@app.get("/outfits")
async def outfits(skin_tone: str):
    # Outfit data — no heavy dependencies needed
    all_outfits = [
        {"name": "Rust linen shirt + chinos", "color": "#CB997E", "occasion": "Everyday", "style": "Casual"},
        {"name": "Olive bomber + white tee", "color": "#A5A58D", "occasion": "Weekend", "style": "Streetwear"},
        {"name": "Mustard co-ord set", "color": "#DDBEA9", "occasion": "Festive", "style": "Traditional"},
        {"name": "Navy blazer + trousers", "color": "#1B2A4A", "occasion": "Office", "style": "Formal"},
        {"name": "White linen kurta", "color": "#F5F5F5", "occasion": "Casual", "style": "Minimal"},
    ]
    return {"outfits": all_outfits}