# image_test.py

import cv2

img = cv2.imread("uploads/front.jpg")

print("Loaded:", img is not None)

if img is not None:
    print("Shape:", img.shape)