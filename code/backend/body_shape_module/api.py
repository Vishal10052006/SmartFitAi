# api.py
import os
import shutil
import sys
import uuid
from pathlib import Path

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai', 'body_analysis'))

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO

from measurement_estimator import MeasurementEstimator
from measurement_converter import MeasurementConverter, get_person_height
from body_shape_detector import BodyShapeDetector
from profile_generator import ProfileGenerator

app = FastAPI(title="SmartFit AI — Body Shape API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://smart-fit-ai-six.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIX: resolve model path relative to THIS FILE, not the process cwd.
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / ".." / ".." / "yolo11n-pose.pt"
model = YOLO(str(MODEL_PATH))

UPLOAD_DIR = BASE_DIR / "temp_uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

CRITICAL_KEYPOINTS = {
    "Left Shoulder": 5, "Right Shoulder": 6,
    "Left Hip": 11, "Right Hip": 12,
    "Left Ankle": 15, "Right Ankle": 16,
}


@app.get("/health")
def health():
    return {"status": "ok", "service": "SmartFit AI Body Shape API"}


@app.post("/analyze-body")
async def analyze_body(
    file: UploadFile = File(...),
    height_cm: float = Form(default=170.0),
    gender: str | None = Form(default=None),   # FIX: optional — was blocking every unauthenticated/legacy caller
    age: int | None = Form(default=None),       # FIX: optional
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return JSONResponse(status_code=400, content={
            "status": "error",
            "code": "INVALID_FILE_TYPE",
            "message": f"File type {ext or '(none)'} not supported. Use jpg, png, or webp.",
        })

    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_path = UPLOAD_DIR / temp_filename

    try:
        # FIX: enforce size cap while streaming, not after the whole file is on disk.
        size = 0
        with open(temp_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_SIZE_BYTES:
                    buffer.close()
                    os.remove(temp_path)
                    return JSONResponse(status_code=400, content={
                        "status": "error",
                        "code": "FILE_TOO_LARGE",
                        "message": f"File exceeds {MAX_FILE_SIZE_MB}MB limit.",
                    })
                buffer.write(chunk)

        results = model(str(temp_path), verbose=False)

        if not results or results[0].keypoints is None:
            return JSONResponse(status_code=422, content={
                "status": "error",
                "code": "NO_PERSON_DETECTED",
                "message": "No person found. Upload a clear full-body photo.",
            })

        keypoints = results[0].keypoints.xy[0].tolist()

        missing = [
            name for name, idx in CRITICAL_KEYPOINTS.items()
            if keypoints[idx][0] == 0 and keypoints[idx][1] == 0
        ]
        if missing:
            return JSONResponse(status_code=422, content={
                "status": "error",
                "code": "PARTIAL_BODY",
                "message": f"Could not detect: {', '.join(missing)}.",
                "missing_keypoints": missing,
            })

        shoulder_width_px = abs(keypoints[5][0] - keypoints[6][0])
        if shoulder_width_px < 20:
            return JSONResponse(status_code=422, content={
                "status": "error",
                "code": "LOW_QUALITY_DETECTION",
                "message": "Image quality too low. Use a clearer full-body photo.",
            })

        estimator = MeasurementEstimator()
        pixel_measurements = estimator.estimate(keypoints)

        pixel_height = get_person_height(keypoints)
        converter = MeasurementConverter(height_cm=height_cm)
        measurements_cm = {
            key: converter.pixel_to_cm(val, pixel_height)
            for key, val in pixel_measurements.items()
        }

        detector = BodyShapeDetector()
        body_shape = detector.detect(
            shoulder_width=pixel_measurements["shoulder_width"],
            hip_width=pixel_measurements["hip_width"],
            torso_length=pixel_measurements["torso_length"],
            leg_length=pixel_measurements["leg_length"],
            waist_width=pixel_measurements["waist_width"],
        )

        generator = ProfileGenerator()
        profile = generator.generate(measurements=measurements_cm, body_shape=body_shape)

        profile["detection_meta"] = {
            "status": "success",
            "warnings": [],
            "height_cm_used": height_cm,
            "gender": gender,
            "age": age,
        }

        return JSONResponse(status_code=200, content=profile)

    except Exception as e:
        # NOTE: fine for MVP; before real launch, log e server-side and
        # return a generic message instead of str(e) to avoid leaking internals.
        return JSONResponse(status_code=500, content={
            "status": "error",
            "code": "UNEXPECTED_ERROR",
            "message": str(e),
        })

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)