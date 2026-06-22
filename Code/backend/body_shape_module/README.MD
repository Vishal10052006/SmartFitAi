# SmartFit AI — Body Shape Detection Module

Standalone AI module that detects body shape from a full-body photo using YOLO pose estimation.

## What It Does

Takes a full-body photo → returns body shape classification, measurements, confidence score, and style tips.

## Detected Body Shapes

Hourglass, Inverted Triangle, Trapezoid, Rectangle, Triangle, Oval

## API

### Health Check
GET /health
Returns: { "status": "ok" }

### Analyze Body
POST /analyze-body
Form fields:
  - file: image file (jpg, png, webp — max 5MB)
  - height_cm: float (default 170.0)

Returns:
{
  "body_profile": {
    "body_shape": "Inverted Triangle",
    "description": "...",
    "confidence": 98,
    "style_tips": [...],
    "ratios": { ... },
    "measurements": {
      "shoulder_width": 40.79,
      "hip_width": 24.13,
      "waist_width": 32.31,
      "torso_length": 114.14,
      "leg_length": 47.75
    }
  },
  "detection_meta": {
    "status": "success",
    "warnings": []
  }
}

## Error Codes

| Code | Meaning |
|---|---|
| FILE_NOT_FOUND | Image file does not exist |
| INVALID_FILE_TYPE | Not a jpg/png/webp file |
| FILE_TOO_LARGE | Exceeds 5MB limit |
| NO_PERSON_DETECTED | No person found in image |
| PARTIAL_BODY | Full body not visible |
| LOW_QUALITY_DETECTION | Image too small or blurry |
| UNEXPECTED_ERROR | Unhandled exception |

## Start The Server

```powershell
cd body_shape_module
uvicorn api:app --reload --port 8001
```

## Files

| File | Purpose |
|---|---|
| api.py | FastAPI endpoint |
| pipeline.py | Full pipeline runner |
| test_edge_cases.py | Edge case test suite |
| test_performance.py | Load test |
| README.md | This file |

## Integration

This module is integration-ready. Wire into main app:
- Endpoint: POST http://localhost:8001/analyze-body
- Call after skin tone analysis (Week 3 flow)
- Combine body_profile + skin tone palette into Style DNA card 