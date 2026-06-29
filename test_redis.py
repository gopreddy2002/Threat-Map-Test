import redis
import time

import os

url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
print("Connecting to Redis...")
start = time.time()
try:
    r = redis.Redis.from_url(url, socket_timeout=5)
    r.ping()
    print("Success")
except Exception as e:
    print(f"Error: {e}")
print(f"Time taken: {time.time() - start:.2f}s")
