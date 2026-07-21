class BodyShapeDetector:

    SHAPES = {
        "Hourglass": {
            "description": "Balanced shoulders and hips with a defined waist",
            "style_tips": [
                "Emphasize your waist with belted outfits",
                "Wrap dresses and fitted clothing work exceptionally well",
                "Most silhouettes suit you — you have the most versatile shape"
            ]
        },
        "Inverted Triangle": {
            "description": "Broad shoulders with narrower hips",
            "style_tips": [
                "Balance your frame with wide-leg or flared trousers",
                "A-line and full skirts add volume to your lower half",
                "Avoid heavy shoulder detailing like pads or wide lapels"
            ]
        },
        "Triangle": {
            "description": "Narrower shoulders with wider hips",
            "style_tips": [
                "Draw attention upward with bold tops and statement necklines",
                "Structured shoulders and bright colours on top balance your frame",
                "Dark, simple bottoms minimise the hip area if desired"
            ]
        },
        "Rectangle": {
            "description": "Shoulders and hips roughly equal with less defined waist",
            "style_tips": [
                "Create the illusion of curves with peplum tops and belted waists",
                "Layering adds dimension — try jackets and cardigans",
                "Ruffles and texture add visual interest to your silhouette"
            ]
        },
        "Oval": {
            "description": "Fuller midsection, shoulders and hips narrower than waist",
            "style_tips": [
                "Empire waist and A-line silhouettes are most flattering",
                "Vertical patterns and monochrome outfits create a streamlined look",
                "Avoid tight waistbands and clingy fabrics around the midsection"
            ]
        },
        "Trapezoid": {
            "description": "Shoulders slightly wider than hips — athletic and balanced build",
            "style_tips": [
                "You suit almost any style — athletic build is very versatile",
                "Slim-fit clothing shows your physique well",
                "Tapered trousers and fitted shirts are your go-to"
            ]
        }
    }

    def detect(
        self,
        shoulder_width,
        hip_width,
        torso_length,
        leg_length,
        waist_width=None
    ):
        shoulder_hip_ratio = shoulder_width / hip_width
        torso_leg_ratio = torso_length / leg_length

        waist_shoulder_ratio = (
            waist_width / shoulder_width
        ) if waist_width else None

        waist_hip_ratio = (
            waist_width / hip_width
        ) if waist_width else None

        body_shape = self._classify(
            shoulder_hip_ratio,
            waist_shoulder_ratio,
            waist_hip_ratio
        )

        confidence = self._calculate_confidence(
            shoulder_hip_ratio,
            waist_shoulder_ratio,
            waist_hip_ratio
        )

        shape_data = self.SHAPES[body_shape]

        return {
            "body_shape": body_shape,
            "description": shape_data["description"],
            "style_tips": shape_data["style_tips"],
            "confidence": confidence,
            "ratios": {
                "shoulder_hip_ratio": round(shoulder_hip_ratio, 2),
                "torso_leg_ratio": round(torso_leg_ratio, 2),
                "waist_shoulder_ratio": round(waist_shoulder_ratio, 2) if waist_shoulder_ratio else None,
                "waist_hip_ratio": round(waist_hip_ratio, 2) if waist_hip_ratio else None
            }
        }

    def _classify(
        self,
        shoulder_hip_ratio,
        waist_shoulder_ratio,
        waist_hip_ratio
    ):
        # Hourglass: balanced shoulders/hips + defined waist
        if waist_shoulder_ratio and waist_hip_ratio:
            if (
                0.90 <= shoulder_hip_ratio <= 1.10 and
                waist_shoulder_ratio < 0.75 and
                waist_hip_ratio < 0.75
            ):
                return "Hourglass"

            # Oval: waist wider than both shoulders and hips
            if (
                waist_shoulder_ratio > 0.90 and
                waist_hip_ratio > 0.90
            ):
                return "Oval"

        # Inverted Triangle: shoulders significantly wider than hips
        if shoulder_hip_ratio > 1.20:
            return "Inverted Triangle"

        # Trapezoid: shoulders moderately wider, athletic
        if 1.05 < shoulder_hip_ratio <= 1.20:
            return "Trapezoid"

        # Triangle: hips wider than shoulders
        if shoulder_hip_ratio < 0.90:
            return "Triangle"

        # Rectangle: balanced, no waist definition
        return "Rectangle"

    def _calculate_confidence(
        self,
        shoulder_hip_ratio,
        waist_shoulder_ratio,
        waist_hip_ratio
    ):
        score = 100

        # Penalise proximity to classification boundaries
        boundaries = [0.90, 1.05, 1.20]
        for boundary in boundaries:
            distance = abs(shoulder_hip_ratio - boundary)
            if distance < 0.05:
                score -= 15
            elif distance < 0.10:
                score -= 5

        # Bonus for waist data — more signal = more confidence
        if waist_shoulder_ratio and waist_hip_ratio:
            score += 10

        # Clamp between 50 and 98
        return max(50, min(score, 98))