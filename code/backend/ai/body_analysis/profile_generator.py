class ProfileGenerator:

    def generate(self, measurements, body_shape):

        return {
            "body_profile": {
                "body_shape": body_shape["body_shape"],
                "description": body_shape["description"],
                "confidence": body_shape["confidence"],
                "style_tips": body_shape["style_tips"],
                "ratios": body_shape["ratios"],
                "measurements": measurements
            }
        }