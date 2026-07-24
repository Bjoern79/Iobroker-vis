# ioBroker vis-2 Dashboard

Dieses Verzeichnis enthält ein komplettes vis-2-Projekt (`vis-views.json`), das
den vorhandenen Haus-Dashboard (Übersicht, Heizung, PV, Lüftung, Solar,
Temperatur, Statistik) **komplett neu und eigenständig** aufbaut — auf Basis der
**echten Datenpunkt-IDs** aus den vorhandenen Views (`index`, `viewHeizung`,
`viewTemperatur`, `viewPhotovoltaik`, `view_recovair`, `view_solaranlage`,
`navigation`) und der bereitgestellten Objekt-Liste.

**Design (v2):** bewusst ohne jede Anlehnung an die klassische vis-Optik —
kein Amber-Divider, keine alten `/icons-mfd-svg/`-Icons, kein Redmond-Theme-Look.
Stattdessen: dunkler Verlaufshintergrund, "Glas"-Karten (halbtransparent, weich
abgerundet, dezenter Schatten/Blur), Farb-Chip-Icons statt Icon-Dateien, System-
Schriftart (`-apple-system`/SF Pro), 2–3-spaltige Kennzahlen-Kacheln statt
Listenzeilen, schwebende Pill-Navigation unten. Canvas-Breite **375px**, exakt
auf die logische Auflösung des iPhone X/10 (375×812pt) abgestimmt; Inhalte
scrollen vertikal, die Navigation bleibt als eingebettete Leiste am Ende jeder
Seite (kein Overlay-Fixed, da klassische vis-Views keine echte fixe Position
über Scroll-Inhalt unterstützen — dafür wäre ein CSS-Widget mit `position:fixed`
nötig, das hier bewusst vermieden wurde, um die garantiert funktionierende
`tplContainerView`-Einbindung zu nutzen).

Diese Version läuft **parallel** zu deinem bestehenden Dashboard: euer
Original bleibt unangetastet im klassischen `vis`-Adapter (Instanz `vis.0`);
dieses Projekt ist für eine eigene **vis-2**-Instanz gedacht und überschreibt
nichts von `vis.0`.

## Enthaltene Views

| View-Name          | Inhalt                                              |
|---------------------|------------------------------------------------------|
| `navigation`         | Gemeinsame Bottom-Nav-Leiste (7 Icons)               |
| `index`              | Übersicht (Fronius, Sonnenbatterie, Logarex, Gas, Wasser, Solarthermie, Raumklima, Lüftung-Schnellzugriff, USV, Beschattung) |
| `viewHeizung`        | Heizkreis, Kessel, Wärmeerzeuger (KM200), Solarspeicher, Gaszähler, Grafana-Panel |
| `viewPhotovoltaik`   | Energiefluss, Grafana-PV-Chart, Sonnen-Wechselrichter, Relais-Steuerung |
| `viewRecovair`       | Lüftung: Luftströme, Betrieb, Steuerung (Schalter/Slider), Klima innen/außen |
| `viewSolaranlage`    | Solarthermie: Kollektor, Speicher, Regelung, Grafana-Panel |
| `viewTemperatur`     | Räume (Shelly H&T), Innen/Außen, Steuerung, 2 Grafana-Panels |
| `viewStatistics`     | Strom/Erdgas/Wasser (Heute–Jahr), Top-Verbraucher/Monat |

Alle Views nutzen ein einheitliches "Glas"-Karten-Layout mit Indigo/Cyan-Verlauf
als Akzent, Grün=Erzeugung, Rot=Verbrauch, Blau=Einspeisung/Feuchte, Amber=Gas/
Solarthermie — für bessere Lesbarkeit auf dem Handy und einen klar eigenen Look.

## Import in vis-2

1. ioBroker Admin → Instanz **vis-2** öffnen → Editor starten.
2. Oben in der Werkzeugleiste **Import** (Ordner-Icon mit Pfeil) wählen.
3. `vis-views.json` hochladen. Der Editor legt alle 8 Views neu an
   (bei Namenskonflikten mit bestehenden Views ggf. vorher umbenennen/sichern).
4. Falls dein Editor nur den **Import einer einzelnen View** anbietet:
   Öffne die Datei, kopiere den Block der gewünschten View (z. B. `"index": { ... }`)
   in eine eigene Datei `{ ... }` (ohne den äußeren Namens-Key) und importiere
   ihn über Rechtsklick auf eine View → **Import**.
5. Danach: Navigation prüfen (View `navigation` muss existieren, da sie per
   `contains_view` in jede Seite eingebunden wird), Icons/Grafana-Links prüfen.

## Voraussetzungen (Adapter/Widget-Sets)

- Adapter: `vis-2`, `jqui`-Widgets, **vis-materialdesign** (für Schalter/Slider/
  Kreis-Diagramm – im vis-2-Editor unter „Widgets“ hinzufügen, falls nicht
  vorhanden)
- Datenquellen (bereits bei dir vorhanden): `fronius.0`, `sonnen.0`, `ebus.0`
  (Recovair), `ebus.1` (Heizung/Solar), `km200.0`, `sonoff.0`, `shelly.1`,
  `statistics.0`, `openweathermap.0`, `mqtt.0`, `nut.0`, `0_userdata.0`
- Icons: keine externen Dateien nötig — alle Nav-/Karten-Icons sind als
  Inline-SVG-Data-URI (Emoji auf Farbverlauf-Chip) direkt in der JSON codiert.
- Grafana unter `192.168.178.133:3000` und Energiefluss-Tool unter
  `192.168.178.133:8082` (URLs 1:1 aus deinen echten Views übernommen)

## Was NICHT migriert wurde (bewusst außerhalb des Umfangs)

Deine echte `index`-View enthielt zusätzlich eine eingebettete zweite
Navigationsleiste (`navigation_2`) mit Pool/Kamera/Musik/Zeitplan-Bereich.
Da diese 4 Ziele nicht zu den 7 Screenshot-Tabs gehören, wurden sie nicht als
eigene Views neu gebaut. Die auf der Übersicht sichtbaren Pool-Schalter etc.
wurden nicht übernommen, um den Umfang auf die besprochenen 7 Bereiche zu
begrenzen. Sag Bescheid, falls Pool/Kamera/Schedule ebenfalls modernisiert
werden sollen.

Details zu Datenpunkt-Zuordnung und Annahmen: siehe `MAPPING.md`.
