import time
from collections import defaultdict, deque

from fastapi import HTTPException

REQUESTS_PER_MINUTE = 20
_request_times = defaultdict(deque)


def enforce_user_rate_limit(user_id: str, action: str = "Request") -> None:
    now = time.monotonic()
    requests = _request_times[f"{action}:{user_id}"]
    while requests and now - requests[0] >= 60:
        requests.popleft()
    if len(requests) >= REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail=f"{action} limit reached. Please try again shortly.",
        )
    requests.append(now)
