# Haus-Dashboard

**Aktueller Stand:** Das Dashboard ist eine eigenständige HTML/CSS/JS-App —
kein ioBroker-`vis`/`vis-2` mehr nötig. Sie liegt in
[`html-dashboard/app/`](html-dashboard/app/) und läuft komplett unabhängig
von deiner klassischen `vis.0`-Instanz (die bleibt unangetastet parallel
bestehen).

## Was ist enthalten

- **`html-dashboard/app/`** — die App selbst: `index.html` + `css/app.css` +
  `js/app.js`, PWA-fähig (installierbar auf dem iPhone-Homescreen), holt
  Live-Daten per `simple-api` (`http://192.168.178.133:8087`), Schalter/
  Regler schreiben zurück. Details, Deployment-Anleitung und bekannte
  Einschränkungen: siehe [`html-dashboard/app/README.md`](html-dashboard/app/README.md).
- **`html-dashboard/app-dashboard.zip`** — derselbe Ordner gepackt, zum
  bequemen Hochladen in einem Rutsch.
- **`MAPPING.md`** — Zuordnung aller verwendeten ioBroker-Datenpunkt-IDs je
  Bereich (Übersicht, Heizung, PV, Lüftung, Solar, Klima, Statistik) + eine
  Liste der Stellen, die einmal gegengeprüft werden sollten. Diese Zuordnung
  gilt unverändert für die App — nur die Darstellung hat sich mehrfach
  geändert, nicht die gebundenen States.

## Kurzfassung Deployment

1. `html-dashboard/app-dashboard.zip` entpacken.
2. Den kompletten `app/`-Ordner (mit `css/`, `js/`, `icons/`) auf einen
   Webserver hochladen, z. B. über ioBroker Admin → Dateien → Instanz
   `vis-2-beta.0`, Ordnerstruktur beibehalten.
3. Im Browser öffnen (z. B. `http://192.168.178.133:8082/vis-2-beta.0/app/index.html`).
4. Auf dem iPhone: Safari → Teilen → **Zum Home-Bildschirm**.

## Verlauf (zur Einordnung, falls alte Dateien/Links noch kursieren)

Die erste Version dieses Dashboards war tatsächlich ein `vis-2`-Projekt
(`vis-views.json`, importierbar über den vis-2-Editor). Nachdem sich zeigte,
dass die HTML/iframe-Variante genauso gut live Daten lesen und schreiben
kann, wurde komplett auf eine eigenständige HTML-App umgestellt — moderner,
kein vis-Editor-Umweg mehr nötig, volle Gestaltungsfreiheit. Die alten
`vis-2`-Projektdateien wurden aus dem Repo entfernt, da sie durch die App
vollständig ersetzt sind.
