# test_edge_cases.py
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai', 'body_analysis'))

from ultralytics import YOLO
from measurement_estimator import MeasurementEstimator
from measurement_converter import MeasurementConverter, get_person_height
from body_shape_detector import BodyShapeDetector
from profile_generator import ProfileGenerator


def run_pipeline_safe(image_path: str, person_height_cm: float = 170.0):
    """
    Production-safe pipeline with full edge case handling.
    Never crashes. Always returns structured JSON.
    """

    # Edge case 1: File does not exist
    if not os.path.exists(image_path):
        return {
            "status": "error",
            "code": "FILE_NOT_FOUND",
            "message": f"Image file not found: {image_path}"
        }

    # Edge case 2: Wrong file type
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    ext = os.path.splitext(image_path)[1].lower()
    if ext not in allowed_extensions:
        return {
            "status": "error",
            "code": "INVALID_FILE_TYPE",
            "message": f"File type {ext} not supported. Use jpg, png, or webp."
        }

    # Edge case 3: File too large (5MB limit)
    file_size_mb = os.path.getsize(image_path) / (1024 * 1024)
    if file_size_mb > 5:
        return {
            "status": "error",
            "code": "FILE_TOO_LARGE",
            "message": f"File size {round(file_size_mb, 1)}MB exceeds 5MB limit."
        }

    try:
        model = YOLO("../../yolo11n-pose.pt")
        results = model(image_path, verbose=False)

        # Edge case 4: No person detected
        if not results or results[0].keypoints is None:
            return {
                "status": "error",
                "code": "NO_PERSON_DETECTED",
                "message": "No person found. Upload a clear full-body photo."
            }

        # Edge case 5: Multiple people — use the one with highest confidence
        if len(results[0].boxes) > 1:
            print(f"  Warning: {len(results[0].boxes)} people detected. Using primary subject.")

        keypoints = results[0].keypoints.xy[0].tolist()

        # Edge case 6: Critical keypoints missing (partial body)
        critical_indices = {
            "Left Shoulder": 5,
            "Right Shoulder": 6,
            "Left Hip": 11,
            "Right Hip": 12,
            "Left Ankle": 15,
            "Right Ankle": 16
        }

        missing = []
        for name, idx in critical_indices.items():
            kp = keypoints[idx]
            if kp[0] == 0 and kp[1] == 0:
                missing.append(name)

        if missing:
            return {
                "status": "error",
                "code": "PARTIAL_BODY",
                "message": f"Could not detect: {', '.join(missing)}. Upload a full-body photo.",
                "missing_keypoints": missing
            }

        # Edge case 7: Low confidence detection (keypoints too close together)
        left_shoulder = keypoints[5]
        right_shoulder = keypoints[6]
        shoulder_width_px = abs(left_shoulder[0] - right_shoulder[0])

        if shoulder_width_px < 20:
            return {
                "status": "error",
                "code": "LOW_QUALITY_DETECTION",
                "message": "Person too small or image quality too low. Use a clearer photo."
            }

        # All checks passed — run full pipeline
        estimator = MeasurementEstimator()
        pixel_measurements = estimator.estimate(keypoints)

        pixel_height = get_person_height(keypoints)
        converter = MeasurementConverter(height_cm=person_height_cm)
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
            waist_width=pixel_measurements["waist_width"]
        )

        generator = ProfileGenerator()
        profile = generator.generate(
            measurements=measurements_cm,
            body_shape=body_shape
        )

        profile["detection_meta"] = {
            "status": "success",
            "warnings": [],
            "image": image_path,
            "pixel_height": round(pixel_height, 1),
            "height_cm_used": person_height_cm
        }

        return profile

    except Exception as e:
        return {
            "status": "error",
            "code": "UNEXPECTED_ERROR",
            "message": str(e)
        }


# ── Test Suite ──────────────────────────────────────────

def run_tests():
    print("\n=== SmartFit AI — Edge Case Test Suite ===\n")
    results = []

    tests = [
        {
            "name": "Test 1: Valid photo",
            "args": {"image_path": "test1.jpg"},
            "expect": "success"
        },
        {
            "name": "Test 2: File not found",
            "args": {"image_path": "ghost.jpg"},
            "expect": "FILE_NOT_FOUND"
        },
        {
            "name": "Test 3: Wrong file type",
            "args": {"image_path": "pipeline.py"},
            "expect": "INVALID_FILE_TYPE"
        },
    ]

    for test in tests:
        print(f"Running: {test['name']}")
        result = run_pipeline_safe(**test["args"])

        status = result.get("status") or result.get("detection_meta", {}).get("status")
        code = result.get("code", status)

        passed = (
            test["expect"] == "success" and status == "success"
        ) or (
            test["expect"] != "success" and code == test["expect"]
        )

        icon = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {icon} — got: {code}\n")
        results.append(passed)

    total = len(results)
    passed_count = sum(results)
    print(f"=== Results: {passed_count}/{total} passed ===\n")


if __name__ == "__main__":
    run_tests()