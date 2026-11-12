"""Each Clerk Organization is one Dossiq workspace; its id is the tenant."""

import logging
import ssl
from dataclasses import dataclass
from functools import lru_cache

import certifi
import jwt
from fastapi import Depends, HTTPException, Request

from app.config import settings

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class Principal:
    subject: str
    tenant: str
    role: str = "member"
    workspace_slug: str = ""
    groups: tuple[str, ...] = ("workspace",)

    @property
    def admin(self) -> bool:
        return self.role == "admin"


DEMO = Principal(subject="demo-operator", tenant="demo-workspace", role="admin")


@lru_cache()
def _jwks() -> jwt.PyJWKClient:
    # Use certifi's CA bundle: some Python installs (e.g. macOS) have no system CAs.
    ctx = ssl.create_default_context(cafile=certifi.where())
    return jwt.PyJWKClient(
        settings().clerk_jwks_url, cache_keys=True, lifespan=3600, ssl_context=ctx
    )


def _token(request: Request) -> str | None:
    header = request.headers.get("authorization", "")
    if header.lower().startswith("bearer "):
        return header[7:].strip() or None
    # Same-origin calls through the Next.js proxy also carry Clerk's session cookie.
    return request.cookies.get("__session")


def _org_claims(claims: dict) -> tuple[str | None, str, str]:
    """Supports Clerk session token v2 ("o" claim) and v1 (org_* claims)."""
    org = claims.get("o")
    if isinstance(org, dict):
        return org.get("id"), str(org.get("rol", "")), str(org.get("slg", ""))
    return (
        claims.get("org_id"),
        str(claims.get("org_role", "")),
        str(claims.get("org_slug", "")),
    )


def principal(request: Request) -> Principal:
    s = settings()
    if s.auth_mode == "demo":
        return DEMO
    if not s.clerk_jwks_url or not s.clerk_issuer:
        raise HTTPException(500, "Auth is not configured. Set CLERK_JWKS_URL and CLERK_ISSUER.")

    token = _token(request)
    if not token:
        raise HTTPException(401, "Sign in required")
    try:
        key = _jwks().get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=s.clerk_issuer,
            leeway=10,
            options={"require": ["exp", "sub", "iss"]},
        )
    except jwt.PyJWTError as exc:
        log.info("Rejected session token: %s", type(exc).__name__)
        raise HTTPException(401, "Session expired or invalid. Sign in again.") from exc

    allowed = {o.strip() for o in s.cors_origins.split(",") if o.strip()}
    azp = claims.get("azp")
    if azp and allowed and azp not in allowed:
        raise HTTPException(401, "Token was issued for a different site")

    org_id, role, slug = _org_claims(claims)
    if not org_id:
        raise HTTPException(403, "No workspace selected. Create or choose a workspace.")
    role = role.removeprefix("org:") or "member"
    return Principal(subject=claims["sub"], tenant=org_id, role=role, workspace_slug=slug)


def require_admin(p: Principal = Depends(principal)) -> Principal:
    if not p.admin:
        raise HTTPException(403, "Admin only")
    return p
