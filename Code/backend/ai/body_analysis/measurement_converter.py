class MeasurementConverter:

    def __init__(self, height_cm):
        self.height_cm = height_cm

    def pixel_to_cm(
        self,
        pixel_value,
        pixel_height
    ):

        scale = (
            self.height_cm /
            pixel_height
        )

        return round(
            float(pixel_value * scale),
            2
        )


def get_person_height(keypoints):

    head_y = keypoints[0][1]

    left_ankle = keypoints[15][1]
    right_ankle = keypoints[16][1]

    ankle_y = max(
        left_ankle,
        right_ankle
    )

    return float(ankle_y - head_y)