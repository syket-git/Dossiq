import uuid
from psycopg.types.json import Jsonb
from app.db import connection
from app.config import settings


def history(tenant: str, conversation_id: uuid.UUID):
    with connection() as conn:
        rows = conn.execute(
            """SELECT role,content FROM (
            SELECT id,role,content,created_at FROM chat_messages
            WHERE tenant_id=%s AND conversation_id=%s ORDER BY id DESC LIMIT %s
        ) recent ORDER BY id ASC""",
            (tenant, conversation_id, settings().memory_turns * 2),
        ).fetchall()
    return rows


def save_turn(
    tenant: str,
    conversation_id: uuid.UUID,
    question: str,
    response: str,
    sources: list | None = None,
    status: str | None = None,
):
    with connection() as conn:
        conn.execute(
            """INSERT INTO chat_messages(tenant_id,conversation_id,role,content,sources,status)
                        VALUES (%s,%s,'user',%s,'[]'::jsonb,NULL),(%s,%s,'assistant',%s,%s,%s)""",
            (
                tenant,
                conversation_id,
                question,
                tenant,
                conversation_id,
                response,
                Jsonb(sources or []),
                status,
            ),
        )


def list_messages(tenant: str, conversation_id: uuid.UUID):
    with connection() as conn:
        return conn.execute(
            """SELECT role,content,sources,status,created_at FROM chat_messages
          WHERE tenant_id=%s AND conversation_id=%s ORDER BY id ASC LIMIT 100""",
            (tenant, conversation_id),
        ).fetchall()
