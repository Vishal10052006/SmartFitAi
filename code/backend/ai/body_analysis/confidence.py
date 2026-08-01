import cv2
import numpy as np


class ConfidenceEngine:
    """
    Computes a unified trust score for a Style DNA result by combining
    image quality, face detection reliability, pose detection quality,
    and body shape classification confidence.
    """

    WEIGHTS = {
        "image_quality": 0.25,
        "face_detection": 0.20,
        "pose_detection": 0.25,
        "body_shape": 0.30,
    }

    LABELS = [
        (85, "High Accuracy"),
        (65, "Good — Minor Uncertainty"),
        (45, "Fair — Consider Retaking Photo"),
        (0, "Low — Please Retake With Better Lighting"),
    ]

    def score_image_quality(self, image_bgr) -> float:
        """Blur (Laplacian variance) + resolution floor, normalized to 0-100."""
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Empirically: >150 var = sharp, <50 = noticeably blurry
        blur_score = min(100, (laplacian_var / 150) * 100)

        h, w = gray.shape
        min_dim = min(h, w)
        # Below 400px shortest side = low quality for this use case
        resolution_score = min(100, (min_dim / 600) * 100)

        return round((blur_score * 0.6) + (resolution_score * 0.4), 1)

    def score_face_detection(self, face_found: bool) -> float:
        return 90.0 if face_found else 40.0  # fallback used = degraded trust

    def score_pose_detection(self, keypoints, critical_indices) -> float:
        """
        YOLO keypoints.xy gives coordinates but not always confidence
        per-point unless you're using keypoints.conf. If conf is
        available, average it over critical joints; else fall back
        to a presence-based heuristic.
        """
        if keypoints is None:
            return 0.0

        present = 0
        total = len(critical_indices)
        for idx in critical_indices.values():
            kp = keypoints[idx]
            if not (kp[0] == 0 and kp[1] == 0):
                present += 1

        return round((present / total) * 100, 1)

    def score_pose_detection_with_conf(self, keypoints_conf, critical_indices) -> float:
        """Use if results[0].keypoints.conf is available (recommended upgrade)."""
        if keypoints_conf is None:
            return 0.0
        scores = [float(keypoints_conf[idx]) for idx in critical_indices.values()]
        return round((sum(scores) / len(scores)) * 100, 1)

    def compute(
        self,
        image_quality_score: float,
        face_detection_score: float,
        pose_detection_score: float,
        body_shape_score: float,
    ) -> dict:
        overall = (
            image_quality_score * self.WEIGHTS["image_quality"] +
            face_detection_score * self.WEIGHTS["face_detection"] +
            pose_detection_score * self.WEIGHTS["pose_detection"] +
            body_shape_score * self.WEIGHTS["body_shape"]
        )
        overall = round(overall)

        label = next(lbl for threshold, lbl in self.LABELS if overall >= threshold)

        return {
            "overall_confidence": overall,
            "label": label,
            "breakdown": {
                "image_quality": image_quality_score,
                "face_detection": face_detection_score,
                "pose_detection": pose_detection_score,
                "body_shape": body_shape_score,
            }
        }