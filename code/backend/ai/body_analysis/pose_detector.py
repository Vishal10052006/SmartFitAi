from ultralytics import YOLO


class PoseDetector:

    def __init__(self):
        self.model = YOLO("yolo11n-pose.pt")

    def detect(self, image_path):
        results = self.model(image_path)
        return results