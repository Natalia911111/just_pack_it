from pathlib import Path

from app import app

DIST_DIR = Path("dist")
DIST_DIR.mkdir(exist_ok=True)

with app.test_client() as client:
    response = client.get("/")
    html = response.get_data(as_text=True)

(DIST_DIR / "index.html").write_text(html, encoding="utf-8")

print("✅ Wygenerowano dist/index.html")