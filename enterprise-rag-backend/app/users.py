import json
import logging
import ssl
import time
import urllib.request

import certifi

from app.config import settings

log = logging.getLogger(__name__)
_CACHE: dict[str, tuple[float, str]] = {}
_TTL = 600


def display_name(user_id: str) -> str:
    hit = _CACHE.get(user_id)
    if hit and time.monotonic() - hit[0] < _TTL:
        return hit[1]
    name = user_id
    key = settings().clerk_secret_key
    if key and user_id.startswith("user_"):
        try:
            req = urllib.request.Request(
                f"https://api.clerk.com/v1/users/{user_id}",
                headers={"Authorization": f"Bearer {key}", "User-Agent": "dossiq-api/1.0"},
            )
            ctx = ssl.create_default_context(cafile=certifi.where())
            with urllib.request.urlopen(req, context=ctx, timeout=5) as r:
                u = json.loads(r.read())
            full = " ".join(x for x in (u.get("first_name"), u.get("last_name")) if x)
            primary = next(
                (e["email_address"] for e in u.get("email_addresses", [])
                 if e.get("id") == u.get("primary_email_address_id")),
                None,
            )
            name = full or primary or user_id
        except Exception as exc:
            log.warning("Clerk user lookup failed: %s", type(exc).__name__)
            return name  # do not cache failures
    _CACHE[user_id] = (time.monotonic(), name)
    return name
