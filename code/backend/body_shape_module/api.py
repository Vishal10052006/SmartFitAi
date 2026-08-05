# api.py
import sys
import os
import shutil
import uuid

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai', 'body_analysis'))

from fastapi import FastAPI, UploadFile, File, Form
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

model = YOLO("../../yolo11n-pose.pt")

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
MAX_FILE_SIZE_MB = 5


@app.get("/health")
def health():
    return {"status": "ok", "service": "SmartFit AI Body Shape API"}


@app.post("/analyze-body")
async def analyze_body(
    file: UploadFile = File(...),
    height_cm: float = Form(default=170.0),
    gender: str = Form(...),
    age: int = Form(...)
):
    print("Gender", gender)
    print("Age", age)
    print("Height (cm)", height_cm)

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return JSONResponse(status_code=400, content={
            "status": "error",
            "code": "INVALID_FILE_TYPE",
            "message": f"File type {ext} not supported. Use jpg, png, or webp."
        })

    # Save uploaded file temporarily
    temp_filename = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Validate file size
        file_size_mb = os.path.getsize(temp_path) / (1024 * 1024)
        if file_size_mb > MAX_FILE_SIZE_MB:
            return JSONResponse(status_code=400, content={
                "status": "error",
                "code": "FILE_TOO_LARGE",
                "message": f"File {round(file_size_mb, 1)}MB exceeds 5MB limit."
            })

        # Run YOLO
        results = model(temp_path, verbose=False)
        print("YOLO Results:")
        print(results)

        if not results or results[0].keypoints is None:
            return JSONResponse(status_code=422, content={
                "status": "error",
                "code": "NO_PERSON_DETECTED",
                "message": "No person found. Upload a clear full-body photo."
            })

        keypoints = results[0].keypoints.xy[0].tolist()

        # Validate critical keypoints
        critical_indices = {
            "Left Shoulder": 5, "Right Shoulder": 6,
            "Left Hip": 11, "Right Hip": 12,
            "Left Ankle": 15, "Right Ankle": 16
        }

        missing = [
            name for name, idx in critical_indices.items()
            if keypoints[idx][0] == 0 and keypoints[idx][1] == 0
        ]

        if missing:
            return JSONResponse(status_code=422, content={
                "status": "error",
                "code": "PARTIAL_BODY",
                "message": f"Could not detect: {', '.join(missing)}.",
                "missing_keypoints": missing
            })

        # Low quality check
        shoulder_width_px = abs(keypoints[5][0] - keypoints[6][0])
        if shoulder_width_px < 20:
            return JSONResponse(status_code=422, content={
                "status": "error",
                "code": "LOW_QUALITY_DETECTION",
                "message": "Image quality too low. Use a clearer full-body photo."
            })

        # Run full pipeline
        estimator = MeasurementEstimator()
        pixel_measurements = estimator.estimate(keypoints)

        pixel_height = get_person_height(keypoints)
        converter = MeasurementConverter(height_cm=height_cm)
        measurements_cm = {
            key: converter.pixel_to_cm(val, pixel_height)
            for key, val in pixel_measurements.items()
        }
        print("Measurements:", measurements_cm)

        detector = BodyShapeDetector()
        body_shape = detector.detect(
            shoulder_width=pixel_measurements["shoulder_width"],
            hip_width=pixel_measurements["hip_width"],
            torso_length=pixel_measurements["torso_length"],
            leg_length=pixel_measurements["leg_length"],
            waist_width=pixel_measurements["waist_width"]
        )
        print("Detected Body Shape:", body_shape)
        generator = ProfileGenerator()
        profile = generator.generate(
            measurements=measurements_cm,
            body_shape=body_shape
        )

        profile["detection_meta"] = {
            "status": "success",
            "warnings": [],
            "height_cm_used": height_cm
        }

        return JSONResponse(status_code=200, content=profile)

    except Exception as e:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "code": "UNEXPECTED_ERROR",
            "message": str(e)
        })

    finally:
        # Always clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)