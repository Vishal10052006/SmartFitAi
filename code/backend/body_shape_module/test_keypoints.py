from ultralytics import YOLO

model = YOLO("../../yolo11n-pose.pt")
results = model("test1.jpg")

for result in results:
    if result.keypoints is not None:
        keypoints = result.keypoints.xy[0].tolist()
        print(f"\nDetected {len(keypoints)} keypoints\n")

        labels = [
            "Nose", "Left Eye", "Right Eye", "Left Ear", "Right Ear",
            "Left Shoulder", "Right Shoulder", "Left Elbow", "Right Elbow",
            "Left Wrist", "Right Wrist", "Left Hip", "Right Hip",
            "Left Knee", "Right Knee", "Left Ankle", "Right Ankle"
        ]

        for i, kp in enumerate(keypoints):
            print(f"  {labels[i]}: x={round(kp[0], 1)}, y={round(kp[1], 1)}")
    else:
        print("No person detected in image")