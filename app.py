from flask import Flask, render_template, redirect, url_for, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Konfiguracja bazy danych SQLite przez SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rodzina.db'
app.config['TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# MODEL: Tak baza danych zapamięta nasze rzeczy do spakowania
class Przedmiot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nazwa = db.Column(db.String(100), nullable=False)
    kategoria = db.Column(db.String(50), nullable=False)  # Dokumenty, Dla Mamy, Dla Maluszka
    spakowane = db.Column(db.Boolean, default=False)      # True (Tak) / False (Nie)


# WIDOK GŁÓWNY: Pobieramy wszystkie rzeczy z bazy i wysyłamy na stronę
@app.route('/')
def index():
    # Pobieramy absolutnie wszystkie przedmioty jednym poleceniem!
    przedmioty = Przedmiot.query.all()
    return render_template('index.html', przedmioty=przedmioty)


# AKCJA: Zmiana statusu spakowania (kliknięcie kółka/ptaszka)
@app.route('/spakuj/<int:item_id>')
def spakuj_przedmiot(item_id):
    # Szukamy przedmiotu o konkretnym ID w bazie
    przedmiot = Przedmiot.query.get_or_404(item_id)
    # Zmieniamy status na przeciwny (jeśli był True, będzie False i na odwrót)
    przedmiot.spakowane = not przedmiot.spakowane
    db.session.commit()
    return redirect(url_for('index'))


# AKCJA: Dodawanie nowego elementu przez użytkownika
@app.route('/dodaj', methods=['POST'])
def dodaj_przedmiot():
    nazwa = request.form.get('nazwa')
    kategoria = request.form.get('kategoria')

    if nazwa and kategoria:
        # Tworzymy nowy obiekt na bazie naszego Modelu
        nowy_przedmiot = Przedmiot(nazwa=nazwa, kategoria=kategoria, spakowane=False)
        db.session.add(nowy_przedmiot)
        db.session.commit()

    return redirect(url_for('index'))


if __name__ == '__main__':
    with app.app_context():
        # SQLAlchemy samo stworzy tabelę na podstawie klasy Przedmiot
        db.create_all()

        # Jeśli baza jest pusta, wgrywamy oficjalną listę ze Szpitala Ujastek
        if not Przedmiot.query.first():
            lista_ujastek = [
                # KATEGORIA: DOKUMENTY
                Przedmiot(nazwa="Dowód osobisty", kategoria="Dokumenty"),
                Przedmiot(nazwa="Karta Przebiegu Ciąży", kategoria="Dokumenty"),
                Przedmiot(nazwa="Oryginał wyniku grupy krwi (z przeciwciałami)", kategoria="Dokumenty"),
                Przedmiot(nazwa="Wynik badania GBS (paciorkowiec)", kategoria="Dokumenty"),
                Przedmiot(nazwa="Ostatnie wyniki morfologii i moczu", kategoria="Dokumenty"),
                Przedmiot(nazwa="Wyniki USG z całego okresu ciąży", kategoria="Dokumenty"),
                Przedmiot(nazwa="Inne istotne konsultacje medyczne (np. okulista, kardiolog)", kategoria="Dokumenty"),

                # KATEGORIA: DLA MAMY
                Przedmiot(nazwa="3 koszule nocne (wygodne do karmienia)", kategoria="Dla Mamy"),
                Przedmiot(nazwa="Szlafrok i kapcie", kategoria="Dla Mamy"),
                Przedmiot(nazwa="Klapki pod prysznic", kategoria="Dla Mamy"),
                Przedmiot(nazwa="2 biustonosze do karmienia piersią", kategoria="Dla Mamy"),
                Przedmiot(nazwa="Jednorazowe lub siateczkowe majtki poporodowe", kategoria="Dla Mamy"),
                Przedmiot(nazwa="Wysokochłonne podkłady poporodowe (duże podpaski)", kategoria="Dla Mamy"),
                Przedmiot(nazwa="Przybory toaletowe (mydło, szampon, szczoteczka itp.)", kategoria="Dla Mamy"),
                Przedmiot(nazwa="Ręczniki (w tym jeden ciemny)", kategoria="Dla Mamy"),
                Przedmiot(nazwa="Woda niegazowana (najlepiej z dziubkiem!)", kategoria="Dla Mamy"),
                Przedmiot(nazwa="Maść z lanoliną na brodawki", kategoria="Dla Mamy"),

                # KATEGORIA: DLA MALUSZKA
                Przedmiot(nazwa="Paczka pieluszek jednorazowych (rozmiar 1 / Newborn)", kategoria="Dla Maluszka"),
                Przedmiot(nazwa="Chusteczki nawilżane dla niemowląt", kategoria="Dla Maluszka"),
                Przedmiot(nazwa="Pieluchy tetrowe lub bambusowe (ok. 3-5 sztuk)", kategoria="Dla Maluszka"),
                Przedmiot(nazwa="Kocyk lub rożek niemowlęcy", kategoria="Dla Maluszka"),
                Przedmiot(nazwa="Ubranka na wyjście ze szpitala (dopasowane do pogody)", kategoria="Dla Maluszka"),
                Przedmiot(nazwa="Krem ochronny do pupy (przeciw odparzeniom)", kategoria="Dla Maluszka")
            ]

            db.session.bulk_save_objects(lista_ujastek)
            db.session.commit()
            print("Pomyślnie załadowano oficjalną listę Szpitala Ujastek!")

    app.run(debug=True)