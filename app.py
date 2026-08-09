from flask import Flask, render_template, redirect, url_for, send_from_directory
from hospitals import (
    LISTA_UJASTEK,
    SZPITALE,
    SZPITALE_INFO,
)

app = Flask(__name__)


# Oryginalna lista startowa Szpitala Ujastek.
# Każdy element musi mieć niezmienne, unikalne ID.



@app.route("/")
def index():
    return render_template(
        "index.html",
        lista_startowa=LISTA_UJASTEK,
        szpitale=SZPITALE,
        szpitale_info=SZPITALE_INFO,

        # Tymczasowo zostawiamy stare zmienne,
        # żeby obecny HTML nadal działał.
        przedmioty=LISTA_UJASTEK,
        razem=len(LISTA_UJASTEK),
        spakowane=0,
        procent=0
    )
@app.route("/service-worker.js")
def service_worker():
    return send_from_directory(
        app.static_folder,
        "service-worker.js",
        mimetype="application/javascript"
    )


# Trasy przejściowe.
# Dzięki nim obecny HTML otworzy się przed dodaniem JavaScriptu.
# Po pełnym przejściu na localStorage usuniemy je.
@app.route("/spakuj/<item_id>", methods=["POST"])
def spakuj_przedmiot(item_id):
    return redirect(url_for("index"))


@app.route("/usun/<item_id>", methods=["POST"])
def usun_przedmiot(item_id):
    return redirect(url_for("index"))


@app.route("/dodaj", methods=["POST"])
def dodaj_przedmiot():
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)