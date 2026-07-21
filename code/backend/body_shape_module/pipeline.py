# pipeline.py

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai', 'body_analysis'))

from ultralytics import YOLO
from pose_detector import PoseDetector
from measurement_estimator import MeasurementEstimator
from measurement_converter import MeasurementConverter, get_person_height
from body_shape_detector import BodyShapeDetector
from profile_generator import ProfileGenerator


def run_pipeline(image_path: str, person_height_cm: float = 170.0):

    print(f"\n--- Running SmartFit AI Body Shape Pipeline ---")
    print(f"Image: {image_path}")
    print(f"Person height: {person_height_cm}cm\n")

    # Step 1: Pose Detection
    print("Step 1: Detecting pose keypoints...")
    model = YOLO("../../yolo11n-pose.pt")
    results = model(image_path)

    if not results or results[0].keypoints is None:
        return {"status": "error", "code": "NO_PERSON_DETECTED", "message": "No person found in image."}

    keypoints = results[0].keypoints.xy[0].tolist()
    print(f"  Keypoints detected: {len(keypoints)}")

    # Step 2: Validate critical keypoints are non-zero
    print("Step 2: Validating keypoints...")
    critical = {
        "Left Shoulder": keypoints[5],
        "Right Shoulder": keypoints[6],
        "Left Hip": keypoints[11],
        "Right Hip": keypoints[12],
        "Left Ankle": keypoints[15],
        "Right Ankle": keypoints[16]
    }

    for name, kp in critical.items():
        if kp[0] == 0 and kp[1] == 0:
            return {
                "status": "error",
                "code": "PARTIAL_BODY",
                "message": f"Could not detect {name}. Please upload a full-body photo."
            }
        print(f"  {name}: x={round(kp[0],1)}, y={round(kp[1],1)} ✓")

    # Step 3: Estimate pixel measurements
    print("\nStep 3: Estimating measurements...")
    estimator = MeasurementEstimator()
    pixel_measurements = estimator.estimate(keypoints)
    print(f"  Shoulder width: {pixel_measurements['shoulder_width']}px")
    print(f"  Hip width:      {pixel_measurements['hip_width']}px")
    print(f"  Waist width:    {pixel_measurements['waist_width']}px")
    print(f"  Torso length:   {pixel_measurements['torso_length']}px")
    print(f"  Leg length:     {pixel_measurements['leg_length']}px")

    # Step 4: Convert pixels to cm
    print("\nStep 4: Converting to real-world cm...")
    pixel_height = get_person_height(keypoints)
    converter = MeasurementConverter(height_cm=person_height_cm)

    measurements_cm = {
        key: converter.pixel_to_cm(val, pixel_height)
        for key, val in pixel_measurements.items()
    }
    print(f"  Shoulder: {measurements_cm['shoulder_width']}cm")
    print(f"  Hip:      {measurements_cm['hip_width']}cm")
    print(f"  Waist:    {measurements_cm['waist_width']}cm")
    print(f"  Torso:    {measurements_cm['torso_length']}cm")
    print(f"  Legs:     {measurements_cm['leg_length']}cm")

    # Step 5: Detect body shape
    print("\nStep 5: Detecting body shape...")
    detector = BodyShapeDetector()
    body_shape = detector.detect(
        shoulder_width=pixel_measurements["shoulder_width"],
        hip_width=pixel_measurements["hip_width"],
        torso_length=pixel_measurements["torso_length"],
        leg_length=pixel_measurements["leg_length"],
        waist_width=pixel_measurements["waist_width"]
    )
    print(f"  Body shape:  {body_shape['body_shape']} (confidence: {body_shape['confidence']}%)")
    print(f"  Description: {body_shape['description']}")
    print(f"  Ratios:      {body_shape['ratios']}")

    # Step 6: Generate profile
    print("\nStep 6: Generating profile...")
    generator = ProfileGenerator()
    profile = generator.generate(
        measurements=measurements_cm,
        body_shape=body_shape
    )

    profile["detection_meta"] = {
        "status": "success",
        "image": image_path,
        "pixel_height": round(pixel_height, 1),
        "height_cm_used": person_height_cm
    }

    print("\n--- Pipeline Complete ---\n")
    return profile


if __name__ == "__main__":
    import json
    result = run_pipeline("test1.jpg", person_height_cm=170)
    print(json.dumps(result, indent=2))