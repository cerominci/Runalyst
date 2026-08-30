import random
import string
from datetime import datetime, timedelta, timezone
from threading import Lock

_store: dict[str, dict] = {}
_lock = Lock()

OTP_TTL_MINUTES = 10
OTP_LENGTH = 6
OTP_MAX_ATTEMPTS = 5


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=OTP_LENGTH))


def save_otp(email: str) -> str:
    code = generate_otp()
    with _lock:
        _store[email] = {
            "code": code,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES),
            "attempts": 0,
        }
    return code


def verify_otp(email: str, code: str) -> bool:
    with _lock:
        entry = _store.get(email)
        if not entry:
            return False
        if datetime.now(timezone.utc) > entry["expires_at"]:
            del _store[email]
            return False
        if entry["code"] != code:
            entry["attempts"] += 1
            # Cap guessing attempts per issued code, independent of IP-based
            # rate limiting (which a distributed attacker could spread across).
            if entry["attempts"] >= OTP_MAX_ATTEMPTS:
                del _store[email]
            return False
        del _store[email]
        return True
