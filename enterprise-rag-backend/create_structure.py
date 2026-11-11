from pathlib import Path

# Project folders
folders = [
    "app",
    "worker",
    "infra",
    "scripts",
    "docs",
]

# Project files
files = [
    # Root files
    ".env.example",
    # Backend
    "app/__init__.py",
    "app/main.py",
    "app/config.py",
    "app/db.py",
    "app/aws.py",
    "app/vector.py",
    "app/rag.py",
    "app/memory.py",
    "app/guardrails.py",
    "app/graph.py",
    "app/observability.py",
    # Document ingestion
    "worker/__init__.py",
    "worker/ingest.py",
    # Database
    "infra/schema.sql",
    "scripts/init_db.py",
    # Documentation
    "docs/SETUP.md",
]


def create_structure():
    for folder in folders:
        Path(folder).mkdir(parents=True, exist_ok=True)

    for file in files:
        path = Path(file)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.touch(exist_ok=True)

    print("Project folders and files created successfully!")
    print(f"Total folders: {len(folders)}")
    print(f"Total files: {len(files)}")


if __name__ == "__main__":
    create_structure()
