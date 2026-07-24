# Haus-Dashboard (reine HTML/CSS/JS-App, kein vis-2 mehr nötig)

Eine einzige Web-App mit Client-seitigem Routing für alle 7 Bereiche
(Übersicht, Heizung, PV, Lüftung, Solar, Klima, Statistik), fest sitzender
Tab-Bar unten (reines CSS, kein vis-Widget), und Live-Daten über den
`simple-api`-Adapter (`http://192.168.178.133:8087`). Als PWA installierbar
(Icon auf dem iPhone-Homescreen, läuft im Vollbild ohne Safari-UI).

## Deployment

1. Den kompletten Ordner `app/` (mit dem Unterordner `icons/`) **als Ganzes**
   auf einen Webserver hochladen — z. B. wieder über ioBroker Admin →
   Dateien → Instanz `vis-2-beta.0`, Ordnerstruktur dabei beibehalten.
   **Wichtig:** `app.css`/`app.js` liegen bewusst direkt neben `index.html`
   (keine `css/`/`js`-Unterordner) — manche vis-Adapter reservieren diese
   Pfadnamen selbst für ihre eigenen Dateien, was sonst zu Kollisionen führt
   (Symptom: der Server liefert für `js/app.js` den Inhalt von `index.html`
   zurück statt der echten Datei → Seite bleibt schwarz, weil das Skript nie
   ausgeführt wird).
2. Danach ist die App erreichbar unter z. B.
   `http://192.168.178.133:8082/vis-2-beta.0/app/index.html`.
3. Auf dem iPhone in Safari öffnen → Teilen-Button → **Zum Home-Bildschirm** →
   die App startet danach als eigenes Icon, ohne Adressleiste.

## Struktur

- `index.html` — App-Shell (lädt CSS/JS, bindet Manifest + Service Worker ein)
- `app.css` — komplettes Design (Karten, Kacheln, Schalter, Slider, Nav)
- `app.js` — Seiten-Inhalte (7× Kartenlisten mit echten Objekt-IDs),
  Client-Routing über `location.hash` (`#uebersicht`, `#heizung`, `#pv`,
  `#lueftung`, `#solar`, `#klima`, `#statistik`), Live-Polling alle 4s über
  `simple-api`, Schreibzugriff für Schalter/Regler über `/set/<id>?value=`.
- `manifest.json` + `icons/` — PWA-Icon/Metadaten
- `sw.js` — Service Worker: `app.css`/`app.js`/`index.html` immer frisch vom
  Server (network-first), nur `manifest.json`/Icons sind cache-first.
  Datenabfragen an `simple-api` (anderer Host/Port) werden nie gecacht.

## Bekannte Einschränkungen

- **Polling statt Push**: Werte aktualisieren sich alle 4 Sekunden, nicht
  sofort. Für ein Haus-Dashboard i. d. R. ausreichend.
- **Enum-/Listenwerte** (z. B. Heizkreis-Status, Betriebsart) zeigen den
  rohen Wert aus ioBroker, nicht die im Objekt hinterlegte Klartext-
  Übersetzung (die holt sich `simple-api`s Plain-Value-Endpunkt nicht mit).
  Sag Bescheid, falls du die passenden Klartexte kennst, dann ergänze ich
  eine Mapping-Tabelle in `app.js`.
- CORS: Falls der Browser Anfragen an `simple-api` blockiert, muss dort
  in den Adapter-Einstellungen "Access-Control-Allow-Origin" (`*` oder die
  Origin der App) aktiviert sein.
