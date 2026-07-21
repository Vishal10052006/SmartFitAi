from ai.body_analysis.pose_detector import PoseDetector
from ai.body_analysis.measurement_estimator import MeasurementEstimator
from ai.body_analysis.body_shape_detector import BodyShapeDetector
from ai.body_analysis.measurement_converter import (
    MeasurementConverter,
    get_person_height
)

detector = PoseDetector()
estimator = MeasurementEstimator()
shape_detector = BodyShapeDetector()

results = detector.detect("uploads/front.jpg")

keypoints = results[0].keypoints.xy[0]

measurements = estimator.estimate(keypoints)

pixel_height = get_person_height(keypoints)

converter = MeasurementConverter(
    height_cm=175
)

shoulder_cm = converter.pixel_to_cm(
    measurements["shoulder_width"],
    pixel_height
)

hip_cm = converter.pixel_to_cm(
    measurements["hip_width"],
    pixel_height
)

torso_cm = converter.pixel_to_cm(
    measurements["torso_length"],
    pixel_height
)

leg_cm = converter.pixel_to_cm(
    measurements["leg_length"],
    pixel_height
)

print("\nConverted Measurements")

print("Shoulder:", shoulder_cm, "cm")
print("Hip:", hip_cm, "cm")
print("Torso:", torso_cm, "cm")
print("Leg:", leg_cm, "cm")

shape = shape_detector.detect(
    measurements["shoulder_width"],
    measurements["hip_width"],
    measurements["torso_length"],
    measurements["leg_length"]
)

print("\nMeasurements")
print(measurements)

print("\nBody Shape")
print(shape)