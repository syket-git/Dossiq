import uuid
from psycopg.types.json import Jsonb
from app.db import connection
from app.config import settings


def history(tenant: str, user_sub: str, conversation_id: uuid.UUID):
    with connection() as conn:
        rows = conn.execute(
            """SELECT role,content FROM (
            SELECT id,role,content,created_at FROM chat_messages
            WHERE tenant_id=%s AND user_sub=%s AND conversation_id=%s ORDER BY id DESC LIMIT %s
        ) recent ORDER BY id ASC""",
            (tenant, user_sub, conversation_id, settings().memory_turns * 2),
        ).fetchall()
    return rows


def save_turn(
    tenant: str,
    user_sub: str,
    conversation_id: uuid.UUID,
    question: str,
    response: str,
    sources: list | None = None,
    status: str | None = None,
):
    with connection() as conn:
        conn.execute(
            """INSERT INTO chat_messages(tenant_id,user_sub,conversation_id,role,content,sources,status)
                        VALUES (%s,%s,%s,'user',%s,'[]'::jsonb,NULL),(%s,%s,%s,'assistant',%s,%s,%s)""",
            (
                tenant,
                user_sub,
                conversation_id,
                question,
                tenant,
                user_sub,
                conversation_id,
                response,
                Jsonb(sources or []),
                status,
            ),
        )


def save_assistant(
    tenant: str,
    user_sub: str,
    conversation_id: uuid.UUID,
    content: str,
    sources: list | None = None,
    status: str | None = None,
):
    """Add one assistant message, e.g. the answer sent after an approval."""
    with connection() as conn:
        conn.execute(
            """INSERT INTO chat_messages(tenant_id,user_sub,conversation_id,role,content,sources,status)
                        VALUES (%s,%s,%s,'assistant',%s,%s,%s)""",
            (tenant, user_sub, conversation_id, content, Jsonb(sources or []), status),
        )


def list_messages(tenant: str, user_sub: str, conversation_id: uuid.UUID):
    with connection() as conn:
        return conn.execute(
            """SELECT role,content,sources,status,created_at FROM chat_messages
          WHERE tenant_id=%s AND user_sub=%s AND conversation_id=%s ORDER BY id ASC LIMIT 100""",
            (tenant, user_sub, conversation_id),
        ).fetchall()
