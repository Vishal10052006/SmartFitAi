from fastapi import APIRouter, UploadFile, File
import shutil
import os

from ai.body_analysis.pose_detector import PoseDetector
from ai.body_analysis.measurement_estimator import MeasurementEstimator
from ai.body_analysis.body_shape_detector import BodyShapeDetector

router = APIRouter()

pose_detector = PoseDetector()
measurement_estimator = MeasurementEstimator()
body_shape_detector = BodyShapeDetector()


@router.post("/body-analysis")
async def analyze_body(
    front_image: UploadFile = File(...)
):

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    image_path = os.path.join(
        upload_dir,
        front_image.filename
    )

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(
            front_image.file,
            buffer
        )

    results = pose_detector.detect(
        image_path
    )

    if (
        len(results) == 0
        or results[0].keypoints is None
    ):
        return {
            "success": False,
            "message": "No body detected"
        }

    keypoints = results[0].keypoints.xy[0]

    measurements = (
        measurement_estimator.estimate(
            keypoints
        )
    )

    body_shape = (
        body_shape_detector.detect(
            measurements["shoulder_width"],
            measurements["hip_width"],
            measurements["torso_length"],
            measurements["leg_length"]
        )
    )

    return {
        "success": True,
        "body_shape": body_shape,
        "measurements": measurements
    }