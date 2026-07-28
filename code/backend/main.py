import os
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv

load_dotenv()
from ai.body_analysis.gemini_service import ask_gemini

import shutil
import uuid
from ultralytics import YOLO

from fastapi import FastAPI, UploadFile, File, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai', 'body_analysis'))

from ai.body_analysis.measurement_estimator import MeasurementEstimator
from ai.body_analysis.measurement_converter import MeasurementConverter, get_person_height
from ai.body_analysis.body_shape_detector import BodyShapeDetector
from ai.body_analysis.profile_generator import ProfileGenerator

from auth.supabase_client import get_supabase
from auth.routes import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

pose_model = YOLO("yolo11n-pose.pt")
STYLE_DNA_UPLOAD_DIR = "uploads/style_dna_temp"
os.makedirs(STYLE_DNA_UPLOAD_DIR, exist_ok=True)


async def analyse_image_with_opencv(image_bytes: bytes) -> tuple[int, int, int]:
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(img)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        if len(faces) > 0:
            x, y, w, h = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
            face_crop = img.crop((x, y, x+w, y+h))
            face_small = face_crop.resize((50, 50))
            pixels = list(face_small.getdata())
            r = int(sum(p[0] for p in pixels) / len(pixels))
            g = int(sum(p[1] for p in pixels) / len(pixels))
            b = int(sum(p[2] for p in pixels) / len(pixels))
            print(f"Face detected — RGB: ({r}, {g}, {b})")
            return r, g, b
    except Exception as e:
        print(f"OpenCV error: {e}")

    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        w, h = img.size
        cx, cy = w // 2, h // 2
        region = img.crop((cx-30, cy-30, cx+30, cy+30))
        region_small = region.resize((10, 10))
        pixels = list(region_small.getdata())
        r = int(sum(p[0] for p in pixels) / len(pixels))
        g = int(sum(p[1] for p in pixels) / len(pixels))
        b = int(sum(p[2] for p in pixels) / len(pixels))
        print(f"Fallback center pixel — RGB: ({r}, {g}, {b})")
        return r, g, b
    except:
        return 194, 154, 108


def get_skin_tone(r, g, b):
    brightness = (r + g + b) / 3
    warmth = r - b
    if brightness > 200:
        tone = "Fair"
    elif brightness > 170:
        tone = "Light"
    elif brightness > 140:
        tone = "Medium"
    elif brightness > 110:
        tone = "Tan"
    elif brightness > 80:
        tone = "Deep"
    else:
        tone = "Rich"
    if warmth > 20:
        undertone = "Warm"
    elif warmth < -20:
        undertone = "Cool"
    else:
        undertone = "Neutral"
    return f"{undertone} {tone}"


def get_recommended_colors(skin_tone):
    recommendations = {
        "Warm Fair":    ["#F4A261", "#E76F51", "#2A9D8F", "#264653", "#E9C46A"],
        "Neutral Fair": ["#A8DADC", "#457B9D", "#1D3557", "#E63946", "#F1FAEE"],
        "Cool Fair":    ["#CDB4DB", "#FFC8DD", "#BDE0FE", "#A2D2FF", "#FFAFCC"],
        "Warm Light":   ["#E9C46A", "#F4A261", "#E76F51", "#264653", "#2A9D8F"],
        "Neutral Light":["#606C38", "#DDA15E", "#BC6C25", "#FEFAE0", "#283618"],
        "Cool Light":   ["#48CAE4", "#0096C7", "#0077B6", "#ADE8F4", "#CAF0F8"],
        "Warm Medium":  ["#CB997E", "#DDBEA9", "#A5A58D", "#B7B7A4", "#6B705C"],
        "Neutral Medium":["#8D99AE","#EDF2F4", "#EF233C", "#D90429", "#2B2D42"],
        "Cool Medium":  ["#9B5DE5", "#F15BB5", "#FEE440", "#00BBF9", "#00F5D4"],
        "Warm Tan":     ["#D4A373", "#CCD5AE", "#E9EDC9", "#FEFAE0", "#FAEDCD"],
        "Neutral Tan":  ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],
        "Cool Tan":     ["#7400B8", "#6930C3", "#5E60CE", "#5390D9", "#4EA8DE"],
        "Warm Deep":    ["#E9C46A", "#F4A261", "#E76F51", "#A8DADC", "#457B9D"],
        "Neutral Deep": ["#FFFFFF", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"],
        "Cool Deep":    ["#48CAE4", "#ADE8F4", "#CAF0F8", "#90E0EF", "#0096C7"],
        "Warm Rich":    ["#FFB703", "#FB8500", "#023047", "#219EBC", "#8ECAE6"],
        "Neutral Rich": ["#FFFFFF", "#E9C46A", "#2A9D8F", "#264653", "#F4A261"],
        "Cool Rich":    ["#CDB4DB", "#FFC8DD", "#FFAFCC", "#BDE0FE", "#A2D2FF"],
    }
    return recommendations.get(skin_tone, ["#264653","#2A9D8F","#E9C46A","#F4A261","#E76F51"])


def get_style_dna_outfits(skin_tone: str, body_shape: str):
    SHAPE_RULES = {
        "Inverted Triangle": {
            "avoid": ["heavy shoulder details", "boat necks", "puff sleeves"],
            "prefer": ["wide-leg trousers", "A-line skirts", "V-necks"],
            "fit_tip": "Balance broad shoulders with volume on the lower half"
        },
        "Triangle": {
            "avoid": ["tapered trousers", "pencil skirts", "tight bottoms"],
            "prefer": ["structured shoulders", "bold tops", "A-line skirts"],
            "fit_tip": "Draw attention upward with statement tops"
        },
        "Hourglass": {
            "avoid": ["boxy silhouettes", "oversized everything"],
            "prefer": ["wrap dresses", "belted waists", "fitted cuts"],
            "fit_tip": "Emphasise your waist — it is your best asset"
        },
        "Rectangle": {
            "avoid": ["shapeless cuts", "straight up-down silhouettes"],
            "prefer": ["peplum tops", "belted outfits", "ruffles"],
            "fit_tip": "Create the illusion of curves with waist definition"
        },
        "Oval": {
            "avoid": ["tight waistbands", "clingy fabrics", "horizontal stripes"],
            "prefer": ["empire waist", "A-line", "monochrome looks"],
            "fit_tip": "Vertical lines and A-line silhouettes are most flattering"
        },
        "Trapezoid": {
            "avoid": ["nothing — you have the most versatile shape"],
            "prefer": ["slim-fit", "tailored cuts", "any silhouette"],
            "fit_tip": "Athletic build suits almost every style — own it"
        }
    }
    base_outfits = OUTFITS.get(skin_tone, [])
    shape_rules = SHAPE_RULES.get(body_shape, {})
    tagged_outfits = []
    for outfit in base_outfits:
        outfit_copy = outfit.copy()
        outfit_copy["body_shape_compatible"] = True
        outfit_copy["why"] = f"{outfit['tip']} · {shape_rules.get('fit_tip', '')}"
        tagged_outfits.append(outfit_copy)
    return {
        "outfits": tagged_outfits,
        "shape_rules": shape_rules
    }


OUTFITS = {
    "Warm Fair": [
        {"name": "Peach linen shirt", "style": "Casual", "occasion": "Everyday", "color": "#F4A261", "tip": "Warm peach mirrors your natural glow"},
        {"name": "Rust co-ord set", "style": "Trendy", "occasion": "Brunch", "color": "#E76F51", "tip": "Rust tones make fair warm skin pop"},
        {"name": "Teal kurta", "style": "Ethnic", "occasion": "Festive", "color": "#2A9D8F", "tip": "Teal creates a striking warm contrast"},
        {"name": "Cream linen blazer", "style": "Smart casual", "occasion": "Office", "color": "#E9C46A", "tip": "Golden neutrals are your best friend"},
        {"name": "Charcoal slim trousers", "style": "Classic", "occasion": "Formal", "color": "#264653", "tip": "Deep anchors balance your lightness"},
    ],
    "Neutral Fair": [
        {"name": "Powder blue Oxford", "style": "Smart casual", "occasion": "Office", "color": "#A8DADC", "tip": "Soft blues balance fair neutral skin"},
        {"name": "Navy blazer + white trousers", "style": "Classic", "occasion": "Formal", "color": "#457B9D", "tip": "Navy is universally flattering"},
        {"name": "Slate grey turtleneck", "style": "Minimal", "occasion": "Everyday", "color": "#1D3557", "tip": "Cool neutrals add sophistication"},
        {"name": "Crimson polo", "style": "Smart casual", "occasion": "Weekend", "color": "#E63946", "tip": "Bold reds energise a fair neutral tone"},
        {"name": "Off-white linen set", "style": "Relaxed", "occasion": "Casual", "color": "#F1FAEE", "tip": "Clean whites keep you effortless"},
    ],
    "Cool Fair": [
        {"name": "Lavender linen set", "style": "Relaxed", "occasion": "Weekend", "color": "#CDB4DB", "tip": "Cool pastels enhance your undertone"},
        {"name": "Blush pink midi", "style": "Feminine", "occasion": "Brunch", "color": "#FFC8DD", "tip": "Blush softly complements cool fair skin"},
        {"name": "Baby blue co-ord", "style": "Fresh", "occasion": "Casual", "color": "#BDE0FE", "tip": "Cool blues are your signature"},
        {"name": "Soft lilac kurta", "style": "Ethnic", "occasion": "Festive", "color": "#FFAFCC", "tip": "Warm-cool pinks suit you perfectly"},
        {"name": "Ice grey blazer", "style": "Classic", "occasion": "Formal", "color": "#A2D2FF", "tip": "Steel tones look polished on you"},
    ],
    "Warm Light": [
        {"name": "Golden yellow kurta", "style": "Ethnic", "occasion": "Festive", "color": "#E9C46A", "tip": "Warm yellows make your skin radiate"},
        {"name": "Terracotta co-ord set", "style": "Trendy", "occasion": "Brunch", "color": "#F4A261", "tip": "Terracotta is your signature tone"},
        {"name": "Rust linen shirt + chinos", "style": "Casual", "occasion": "Everyday", "color": "#E76F51", "tip": "Earthy reds are made for warm light skin"},
        {"name": "Forest green polo", "style": "Smart casual", "occasion": "Office", "color": "#264653", "tip": "Deep greens give you a grounded look"},
        {"name": "Teal bomber jacket", "style": "Streetwear", "occasion": "Weekend", "color": "#2A9D8F", "tip": "Jewel tones elevate warm light tones"},
    ],
    "Neutral Light": [
        {"name": "Olive chinos + white tee", "style": "Casual", "occasion": "Everyday", "color": "#606C38", "tip": "Earthy olives are your natural match"},
        {"name": "Camel blazer", "style": "Smart casual", "occasion": "Office", "color": "#DDA15E", "tip": "Warm neutrals feel effortlessly put together"},
        {"name": "Chocolate brown kurta", "style": "Ethnic", "occasion": "Festive", "color": "#BC6C25", "tip": "Rich browns deepen your natural warmth"},
        {"name": "Cream linen set", "style": "Relaxed", "occasion": "Weekend", "color": "#FEFAE0", "tip": "Warm whites give you a sun-kissed look"},
        {"name": "Dark olive jacket", "style": "Streetwear", "occasion": "Casual", "color": "#283618", "tip": "Deep earth tones anchor you beautifully"},
    ],
    "Cool Light": [
        {"name": "Sky blue linen shirt", "style": "Casual", "occasion": "Everyday", "color": "#48CAE4", "tip": "Bright blues amplify cool light skin"},
        {"name": "Ocean blue co-ord", "style": "Trendy", "occasion": "Brunch", "color": "#0096C7", "tip": "Ocean tones are made for you"},
        {"name": "Midnight blue blazer", "style": "Classic", "occasion": "Formal", "color": "#0077B6", "tip": "Deep navy sharpens cool light tones"},
        {"name": "Ice blue kurta", "style": "Ethnic", "occasion": "Festive", "color": "#ADE8F4", "tip": "Soft teals highlight your undertone"},
        {"name": "Pale aqua polo", "style": "Smart casual", "occasion": "Office", "color": "#CAF0F8", "tip": "Cool aquas keep you fresh and clean"},
    ],
    "Warm Medium": [
        {"name": "Rust linen shirt + chinos", "style": "Casual", "occasion": "Everyday", "color": "#CB997E", "tip": "Warm neutrals make your skin glow"},
        {"name": "Olive bomber + white tee", "style": "Streetwear", "occasion": "Weekend", "color": "#A5A58D", "tip": "Olive is your power neutral"},
        {"name": "Mustard kurta", "style": "Ethnic", "occasion": "Festive", "color": "#DDBEA9", "tip": "Warm yellows enhance your undertone"},
        {"name": "Brown leather jacket + black jeans", "style": "Smart casual", "occasion": "Evening", "color": "#6B705C", "tip": "Deep earth tones ground your whole look"},
        {"name": "Terracotta co-ord set", "style": "Trendy", "occasion": "Brunch", "color": "#B7B7A4", "tip": "Terracotta is your signature colour"},
    ],
    "Neutral Medium": [
        {"name": "Slate grey shirt", "style": "Smart casual", "occasion": "Office", "color": "#8D99AE", "tip": "Cool greys complement neutral medium skin"},
        {"name": "Crisp white co-ord", "style": "Classic", "occasion": "Everyday", "color": "#EDF2F4", "tip": "White gives you a clean, sharp look"},
        {"name": "Bold red polo", "style": "Casual", "occasion": "Weekend", "color": "#EF233C", "tip": "Reds energise your neutral tone beautifully"},
        {"name": "Deep maroon kurta", "style": "Ethnic", "occasion": "Festive", "color": "#D90429", "tip": "Deep reds are powerful on medium skin"},
        {"name": "Charcoal blazer", "style": "Formal", "occasion": "Office", "color": "#2B2D42", "tip": "Charcoal is a medium skin superpower"},
    ],
    "Cool Medium": [
        {"name": "Royal purple shirt", "style": "Smart casual", "occasion": "Office", "color": "#9B5DE5", "tip": "Purples are electric on cool medium skin"},
        {"name": "Hot pink co-ord", "style": "Trendy", "occasion": "Brunch", "color": "#F15BB5", "tip": "Vibrant pinks make cool skin pop"},
        {"name": "Bright yellow kurta", "style": "Ethnic", "occasion": "Festive", "color": "#FEE440", "tip": "Bright yellows contrast beautifully"},
        {"name": "Electric blue bomber", "style": "Streetwear", "occasion": "Weekend", "color": "#00BBF9", "tip": "Bold blues are your statement colour"},
        {"name": "Mint green polo", "style": "Casual", "occasion": "Everyday", "color": "#00F5D4", "tip": "Cool greens amplify your undertone"},
    ],
    "Warm Tan": [
        {"name": "Camel linen shirt", "style": "Casual", "occasion": "Everyday", "color": "#D4A373", "tip": "Warm camel enhances your natural richness"},
        {"name": "Sage green co-ord", "style": "Relaxed", "occasion": "Weekend", "color": "#CCD5AE", "tip": "Muted greens harmonise with warm tan skin"},
        {"name": "Warm white kurta", "style": "Ethnic", "occasion": "Festive", "color": "#FEFAE0", "tip": "Warm whites give a sun-kissed effect"},
        {"name": "Gold-toned blazer", "style": "Smart casual", "occasion": "Office", "color": "#FAEDCD", "tip": "Gold undertones are your natural palette"},
        {"name": "Light olive jacket", "style": "Streetwear", "occasion": "Casual", "color": "#E9EDC9", "tip": "Earthy lights look effortless on you"},
    ],
    "Neutral Tan": [
        {"name": "Olive chinos + white tee", "style": "Casual", "occasion": "Everyday", "color": "#606C38", "tip": "Olive is your go-to neutral"},
        {"name": "Forest green kurta", "style": "Ethnic", "occasion": "Festive", "color": "#283618", "tip": "Deep greens are rich and grounding"},
        {"name": "Cream linen blazer", "style": "Smart casual", "occasion": "Office", "color": "#FEFAE0", "tip": "Clean neutrals let your skin do the talking"},
        {"name": "Camel coat + black tee", "style": "Classic", "occasion": "Evening", "color": "#DDA15E", "tip": "Warm camel tones are timeless on tan skin"},
        {"name": "Chocolate brown jacket", "style": "Streetwear", "occasion": "Weekend", "color": "#BC6C25", "tip": "Rich browns are deeply flattering on you"},
    ],
    "Cool Tan": [
        {"name": "Violet linen shirt", "style": "Smart casual", "occasion": "Office", "color": "#7400B8", "tip": "Deep purples make cool tan skin electric"},
        {"name": "Indigo co-ord set", "style": "Trendy", "occasion": "Brunch", "color": "#6930C3", "tip": "Indigo tones are stunning on you"},
        {"name": "Periwinkle kurta", "style": "Ethnic", "occasion": "Festive", "color": "#5E60CE", "tip": "Blue-purples highlight your cool undertone"},
        {"name": "Cobalt blue polo", "style": "Casual", "occasion": "Everyday", "color": "#5390D9", "tip": "Bold blues complement cool tan beautifully"},
        {"name": "Steel blue blazer", "style": "Classic", "occasion": "Formal", "color": "#4EA8DE", "tip": "Steel blues are your power colour"},
    ],
    "Warm Deep": [
        {"name": "Golden yellow kurta", "style": "Ethnic", "occasion": "Festive", "color": "#E9C46A", "tip": "Gold tones make deep warm skin radiate"},
        {"name": "Rust linen shirt", "style": "Casual", "occasion": "Everyday", "color": "#F4A261", "tip": "Warm oranges are deeply complementary"},
        {"name": "Terracotta co-ord", "style": "Trendy", "occasion": "Brunch", "color": "#E76F51", "tip": "Earthy reds are made for warm deep skin"},
        {"name": "Sky blue bomber", "style": "Streetwear", "occasion": "Weekend", "color": "#A8DADC", "tip": "Cool contrast pops beautifully on you"},
        {"name": "Ocean blue blazer", "style": "Classic", "occasion": "Formal", "color": "#457B9D", "tip": "Blue contrast is your statement move"},
    ],
    "Neutral Deep": [
        {"name": "Crisp white kurta", "style": "Ethnic", "occasion": "Festive", "color": "#FFFFFF", "tip": "White is the ultimate contrast on deep skin"},
        {"name": "Off-white linen shirt", "style": "Casual", "occasion": "Everyday", "color": "#F1FAEE", "tip": "Warm whites give a powerful clean look"},
        {"name": "Sky blue Oxford", "style": "Smart casual", "occasion": "Office", "color": "#A8DADC", "tip": "Soft blues contrast deep skin strikingly"},
        {"name": "Navy blazer", "style": "Classic", "occasion": "Formal", "color": "#457B9D", "tip": "Navy is regal on neutral deep skin"},
        {"name": "Slate co-ord", "style": "Relaxed", "occasion": "Weekend", "color": "#1D3557", "tip": "Deep teals add sophisticated depth"},
    ],
    "Cool Deep": [
        {"name": "Ice blue linen shirt", "style": "Casual", "occasion": "Everyday", "color": "#48CAE4", "tip": "Cool blues are electric on deep skin"},
        {"name": "Aqua co-ord set", "style": "Trendy", "occasion": "Brunch", "color": "#ADE8F4", "tip": "Aquas create a bold cool contrast"},
        {"name": "Pale cyan kurta", "style": "Ethnic", "occasion": "Festive", "color": "#CAF0F8", "tip": "Cool teals bring out your deep tone"},
        {"name": "Sky blue blazer", "style": "Classic", "occasion": "Formal", "color": "#90E0EF", "tip": "Light cool tones are your statement"},
        {"name": "Ocean polo", "style": "Smart casual", "occasion": "Office", "color": "#0096C7", "tip": "Rich ocean blue is your power colour"},
    ],
    "Warm Rich": [
        {"name": "Amber kurta", "style": "Ethnic", "occasion": "Festive", "color": "#FFB703", "tip": "Gold and amber are your royalty palette"},
        {"name": "Burnt orange co-ord", "style": "Trendy", "occasion": "Brunch", "color": "#FB8500", "tip": "Warm oranges make rich skin luminous"},
        {"name": "Midnight blue blazer", "style": "Classic", "occasion": "Formal", "color": "#023047", "tip": "Deep navy creates a powerful contrast"},
        {"name": "Teal linen shirt", "style": "Smart casual", "occasion": "Office", "color": "#219EBC", "tip": "Jewel teals are deeply flattering"},
        {"name": "Sky blue polo", "style": "Casual", "occasion": "Everyday", "color": "#8ECAE6", "tip": "Light blues pop beautifully on rich skin"},
    ],
    "Neutral Rich": [
        {"name": "Crisp white kurta", "style": "Ethnic", "occasion": "Festive", "color": "#FFFFFF", "tip": "White is your most powerful colour"},
        {"name": "Golden yellow shirt", "style": "Casual", "occasion": "Everyday", "color": "#E9C46A", "tip": "Warm yellows are stunning on rich skin"},
        {"name": "Teal blazer", "style": "Smart casual", "occasion": "Office", "color": "#2A9D8F", "tip": "Teal adds depth and elegance"},
        {"name": "Charcoal co-ord", "style": "Relaxed", "occasion": "Weekend", "color": "#264653", "tip": "Deep neutrals are effortlessly sharp"},
        {"name": "Rust linen set", "style": "Trendy", "occasion": "Brunch", "color": "#F4A261", "tip": "Earthy warmth complements rich skin"},
    ],
    "Cool Rich": [
        {"name": "Lavender kurta", "style": "Ethnic", "occasion": "Festive", "color": "#CDB4DB", "tip": "Cool pastels contrast rich skin beautifully"},
        {"name": "Blush pink co-ord", "style": "Trendy", "occasion": "Brunch", "color": "#FFC8DD", "tip": "Soft pinks create a striking contrast"},
        {"name": "Rose pink shirt", "style": "Smart casual", "occasion": "Office", "color": "#FFAFCC", "tip": "Cool pinks are powerful on rich skin"},
        {"name": "Baby blue linen set", "style": "Casual", "occasion": "Everyday", "color": "#BDE0FE", "tip": "Cool blues illuminate your tone"},
        {"name": "Periwinkle blazer", "style": "Classic", "occasion": "Formal", "color": "#A2D2FF", "tip": "Blue-lilac tones are your signature"},
    ],
}


@app.get("/")
def home():
    return {"message": "SmartFit AI Backend is running!"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyse")
async def analyse(file: UploadFile = File(...)):
    image_bytes = await file.read()
    r, g, b = await analyse_image_with_opencv(image_bytes)
    skin_tone = get_skin_tone(r, g, b)
    recommended = get_recommended_colors(skin_tone)
    return {
        "skin_tone": skin_tone,
        "recommended_colors": recommended,
        "debug_rgb": {"r": r, "g": g, "b": b}
    }


@app.get("/outfits")
def get_outfits(skin_tone: str = Query(...)):
    outfits = OUTFITS.get(skin_tone, [])
    if not outfits:
        return {"error": f"No outfits found for tone: {skin_tone}"}
    return {
        "skin_tone": skin_tone,
        "count": len(outfits),
        "outfits": outfits
    }


@app.post("/style-dna")
async def style_dna(
    file: UploadFile = File(...),
    height_cm: float = 170.0
):
    allowed = ['.jpg', '.jpeg', '.png', '.webp']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        return JSONResponse(status_code=400, content={
            "status": "error",
            "code": "INVALID_FILE_TYPE",
            "message": f"File type {ext} not supported. Use jpg, png, or webp."
        })

    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(STYLE_DNA_UPLOAD_DIR, temp_filename)

    try:
        image_bytes = await file.read()

        size_mb = len(image_bytes) / (1024 * 1024)
        if size_mb > 5:
            return JSONResponse(status_code=400, content={
                "status": "error",
                "code": "FILE_TOO_LARGE",
                "message": f"File {round(size_mb, 1)}MB exceeds 5MB limit."
            })

        with open(temp_path, "wb") as f:
            f.write(image_bytes)

        r, g, b = await analyse_image_with_opencv(image_bytes)
        skin_tone = get_skin_tone(r, g, b)
        colour_palette = get_recommended_colors(skin_tone)

        body_shape_result = None
        body_shape_error = None

        try:
            results = pose_model(temp_path, verbose=False)

            if results and results[0].keypoints is not None:
                keypoints = results[0].keypoints.xy[0].tolist()

                critical = {
                    "Left Shoulder": 5, "Right Shoulder": 6,
                    "Left Hip": 11, "Right Hip": 12,
                    "Left Ankle": 15, "Right Ankle": 16
                }
                missing = [
                    name for name, idx in critical.items()
                    if keypoints[idx][0] == 0 and keypoints[idx][1] == 0
                ]

                if not missing:
                    estimator = MeasurementEstimator()
                    pixel_measurements = estimator.estimate(keypoints)

                    pixel_height = get_person_height(keypoints)
                    converter = MeasurementConverter(height_cm=height_cm)
                    measurements_cm = {
                        key: converter.pixel_to_cm(val, pixel_height)
                        for key, val in pixel_measurements.items()
                    }

                    detector = BodyShapeDetector()
                    body_shape_data = detector.detect(
                        shoulder_width=pixel_measurements["shoulder_width"],
                        hip_width=pixel_measurements["hip_width"],
                        torso_length=pixel_measurements["torso_length"],
                        leg_length=pixel_measurements["leg_length"],
                        waist_width=pixel_measurements["waist_width"]
                    )

                    body_shape_result = {
                        "body_shape": body_shape_data["body_shape"],
                        "description": body_shape_data["description"],
                        "confidence": body_shape_data["confidence"],
                        "style_tips": body_shape_data["style_tips"],
                        "ratios": body_shape_data["ratios"],
                        "measurements_cm": measurements_cm
                    }
                else:
                    body_shape_error = f"Partial body. Missing: {', '.join(missing)}"
            else:
                body_shape_error = "No person detected for body shape"

        except Exception as e:
            body_shape_error = str(e)

        body_shape_name = (
            body_shape_result["body_shape"]
            if body_shape_result else "Unknown"
        )

        outfit_data = get_style_dna_outfits(skin_tone, body_shape_name)

        return JSONResponse(status_code=200, content={
            "status": "success",
            "style_dna": {
                "skin_tone": {
                    "tone": skin_tone,
                    "rgb": {"r": r, "g": g, "b": b},
                    "colour_palette": colour_palette
                },
                "body_shape": body_shape_result,
                "body_shape_error": body_shape_error,
                "outfit_recommendations": outfit_data["outfits"],
                "shape_rules": outfit_data["shape_rules"]
            }
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "code": "UNEXPECTED_ERROR",
            "message": str(e)
        })

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/chat")
def chat(question: str):

    answer = ask_gemini(question)

    return {
        "answer": answer
    }