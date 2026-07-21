# test_performance.py
import requests
import time

API_URL = "http://127.0.0.1:8001/analyze-body"
IMAGE_PATH = "test1.jpg"
RUNS = 20

print(f"\n=== SmartFit AI — Performance Test ({RUNS} requests) ===\n")

times = []
errors = 0

for i in range(1, RUNS + 1):
    with open(IMAGE_PATH, "rb") as f:
        start = time.time()
        response = requests.post(
            API_URL,
            files={"file": ("test1.jpg", f, "image/jpeg")},
            data={"height_cm": 170}
        )
        elapsed = round((time.time() - start) * 1000, 1)

    if response.status_code == 200:
        times.append(elapsed)
        print(f"  Request {i:02d}: {elapsed}ms ✅")
    else:
        errors += 1
        print(f"  Request {i:02d}: FAILED ❌ — {response.json()}")

print(f"\n=== Results ===")
print(f"  Completed:    {RUNS - errors}/{RUNS}")
print(f"  Errors:       {errors}")
if times:
    print(f"  Avg response: {round(sum(times)/len(times), 1)}ms")
    print(f"  Fastest:      {min(times)}ms")
    print(f"  Slowest:      {max(times)}ms")
print()