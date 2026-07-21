import math


class MeasurementEstimator:

    @staticmethod
    def distance(p1, p2):
        return math.sqrt(
            (p1[0] - p2[0]) ** 2 +
            (p1[1] - p2[1]) ** 2
        )

    def estimate(self, keypoints):

        left_shoulder = keypoints[5]
        right_shoulder = keypoints[6]
        left_hip = keypoints[11]
        right_hip = keypoints[12]
        left_ankle = keypoints[15]
        right_ankle = keypoints[16]

        shoulder_width = self.distance(
            left_shoulder, right_shoulder
        )

        hip_width = self.distance(
            left_hip, right_hip
        )

        torso_length = (
            self.distance(left_shoulder, left_hip) +
            self.distance(right_shoulder, right_hip)
        ) / 2

        leg_length = (
            self.distance(left_hip, left_ankle) +
            self.distance(right_hip, right_ankle)
        ) / 2

        # Waist estimation: midpoint between shoulder and hip
        # on each side, then measure distance between them
        left_waist = [
            (left_shoulder[0] + left_hip[0]) / 2,
            (left_shoulder[1] + left_hip[1]) / 2
        ]
        right_waist = [
            (right_shoulder[0] + right_hip[0]) / 2,
            (right_shoulder[1] + right_hip[1]) / 2
        ]

        waist_width = self.distance(left_waist, right_waist)

        return {
            "shoulder_width": round(shoulder_width, 2),
            "hip_width": round(hip_width, 2),
            "waist_width": round(waist_width, 2),
            "torso_length": round(torso_length, 2),
            "leg_length": round(leg_length, 2)
        }