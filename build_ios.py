import shutil
from pathlib import Path

from app import app

DIST_DIR = Path("dist")
STATIC_DIR = Path("static")

DIST_DIR.mkdir(exist_ok=True)

with app.test_client() as client:
    response = client.get("/")
    html = response.get_data(as_text=True)

# Zamieniamy ścieżki Flaskowe /static/... na ścieżki działające w aplikacji iOS
html = html.replace('"/static/', '"static/').replace("'/static/", "'static/")

(DIST_DIR / "index.html").write_text(html, encoding="utf-8")

# Kopiujemy cały folder static do dist/static
dist_static = DIST_DIR / "static"

if dist_static.exists():
    shutil.rmtree(dist_static)

shutil.copytree(STATIC_DIR, dist_static)

print("✅ Wygenerowano dist/index.html i skopiowano static")