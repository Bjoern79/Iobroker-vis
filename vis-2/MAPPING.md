# Datenpunkt-Zuordnung & Annahmen

> **Hinweis (aktueller Stand):** Das Dashboard ist inzwischen eine
> eigenständige HTML-App (`html-dashboard/app/`), kein vis-2-Projekt mehr —
> die Datenpunkt-Zuordnungen unten gelten aber unverändert weiter. Nur die
> Darstellung hat sich mehrfach geändert (Glas-Karten → Bento-Grid mit
> Energiefluss-Diagramm, Raum-Karussell, Balkendiagramme), nicht die
> gebundenen ioBroker-States.

Alle unten genannten Objekt-IDs stammen entweder direkt aus deinen
hochgeladenen Original-Views (`index`, `viewHeizung`, `viewTemperatur`,
`viewPhotovoltaik`, `view_recovair`, `view_solaranlage`, `navigation`,
`navigation_2`) oder aus deiner Objekt-CSV. Sie sind damit **bestätigt real**,
außer wo unten explizit als Annahme markiert.

## Bitte einmal prüfen (echte, aber nicht 100%ig eindeutige Zuordnungen)

- **Statistik (`#statistik`)**: Für dich lag kein Original-Export dieser Seite vor.
  Ich habe sie aus dem bestätigten Muster
  `statistics.0.temp.sumDelta.<Quelle>.<Zeitraum>` (day/week/month/quarter/year)
  gebaut – `day` und `month` sind an anderer Stelle in deinen Daten bestätigt,
  `week`/`quarter`/`year` folgen der Standard-Konvention des
  `statistics`-Adapters, wurden aber nicht einzeln in deinen Exporten gesehen.
  Prüfe im Objektbaum, ob es diese States tatsächlich gibt; falls nicht, in
  der Karte einfach die entsprechende Spalte löschen/anpassen.
- **Heizung → „Gaszähler“-Karte**: Die Beschriftungen „Verbrauch (Diff)“,
  „Zählerstand“, „Verbrauch (%)“, „Ø-Vergleich“, „Vorjahr“ sind eine
  plausible, aber nicht zweifelsfrei aus der Reihenfolge im Original ableitbare
  Zuordnung zu `TotalGasLasDiff` / `TotalGas` / `TotalGasActual` /
  `TotalGasProz` / `TotalGasLast`. Bitte einmal gegenprüfen (Zuordnung steht
  in `js/app.js` in der Funktion `PAGES.heizung`).
- **Lüftung → „Nachlaufzeit aktiv“**: im Screenshot ein Schalter, gebunden an
  `0_userdata.0.Recovair.DelayTime`. Der Name deutet eher auf einen
  Zahlenwert (Minuten) als auf ein Boolean hin – falls der Schalter in der App
  nicht sauber funktioniert, in `js/app.js` (`PAGES.lueftung`) die Zeile
  `switchRow('Nachlaufzeit aktiv', ...)` durch `sliderRow(...)` ersetzen.
- **Raumklima (Übersicht) / Räume (Temperatur-View)**: In deinem echten Setup
  werden Temperatur und Luftfeuchte pro Raum teils aus unterschiedlichen
  Sensoren gemischt (z. B. DG/OG-Temperatur aus `sonoff.0.HT-*.AM2301`, aber
  Luftfeuchte + Min/Max-Statistik aus dem jeweiligen `shellyhtg3`-Sensor). Das
  wurde 1:1 aus deiner echten Konfiguration übernommen, nicht „korrigiert“ –
  falls das ein Versehen war, in `js/app.js` im `ROOMS`-Array die
  entsprechende oid tauschen.

## Nicht übernommen (aus deiner echten `index`-View, aber außerhalb der 7 Tabs)

- Pool-Sektion (`sonoff.0.Pool Pumpe/Heizung.POWER`, `TT-Pool` Sensoren,
  Beschattungs-Grafana) – nur die reine Beschattungs-Sonnenschutz-Steuerung
  wurde auf der Übersicht belassen, der Rest (Pool/Kamera/Musik/Zeitplan über
  `navigation_2`) nicht neu gebaut.

## Kern-Zuordnungen je View (Kurzfassung)

**Übersicht (`#uebersicht`)**
- Außentemperatur: `ebus.1.broadcast.messages.outsidetemp.fields.temp2.value`
- Fronius Jetzt: `sonnen.0.status.production` / `sonoff.0.Smartmeter.SENSOR.LK13BE.power` / `sonnen.0.status.consumption`
- Sonnenbatterie: `sonnen.0.status.userSoc`, `fronius.0.inverter.1.DAY_ENERGY`, `0_userdata.0.Total.PowerDay`, `0_userdata.0.SolarGraph.EnergieMaxHeute/Morgen`
- Logarex: `statistics.0.temp.sumDelta.0_userdata.0.Smartmeter.LK13BE.total_out/in.day`, `0_userdata.0.Smartmeter.LK13BE.total_out/in`
- Gas/Wasser: `statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C1/C2.day`, `0_userdata.0.Total.TotalGas/TotalWater` — „Wasser heute" zeigt den Rohwert (bereits in Liter) ganzzahlig mit Einheit „L“, nicht in m³.
- Solarthermie: `ebus.1.sc.messages.Coll1Sensor/Storage1Sensor3/Storage2Sensor3.fields.temp.value`
- Raumklima: siehe Hinweis oben (gemischte Sensoren je Raum)
- Lüftung-Schnellzugriff: `sonoff.0.Lueftung.POWER`, `0_userdata.0.Recovair.VentCmd/BoostCmd`
- USV: `nut.0.info.connection`, `nut.0.battery.charge`
- Beschattung: `0_userdata.0.ShutterControl.SunProtect`

**Heizung** – `ebus.1.mc.*` (Mischer-Vorlauf), `ebus.1.bai.*`
(Kessel-Vorlauf), `ebus.1.sc.Storage*` (Solarspeicher),
`0_userdata.0.Total.TotalGas*`, Grafana `vaillant-heizung`. Die
`km200.0.heatingCircuits.hc1.*`/`km200.0.system.*`-Karte
(„Wärmeerzeuger“) sowie Wasserdruck/Abgastemperatur wurden auf Wunsch
entfernt; Gaszähler-Werte werden jetzt ohne Nachkommastellen angezeigt.

**Photovoltaik** – Energiefluss-iframe, Grafana `photovoltaik`,
`sonnen.0.status.acFrequency/acVoltage`, `sonnen.0.latestData.*`,
`sonnen.0.configurations.DE_Software`, `sonnen.0.ios.DO_12/13/14`,
`sonnen.0.info.connection`, sowie die neue Karte **„Batterieladen ·
Preisoptimierung“** — übernommen aus deinem alten `viewEnergy`-Widget
(„SonnenLaden“): `0_userdata.0.SonnenLaden.ladeAktiv` (bool),
`.statusText`, `.aktuellerPreis`, `.spreadAktuell`, `.naechstesFenster`,
`.statusBegruendung` sowie die drei vorgerenderten HTML-Blob-States
`.ladefensterHtml`, `.ladeHistorieHtml`, `.entscheidungsLogHtml` (werden
1:1 als HTML aus ioBroker übernommen, siehe `data-oid-html` in `app.js`).

**Lüftung (`#lueftung`)** – `ebus.0.recov.messages.*` (4 Luftströme im
neuen Luftstrom-Diagramm: Frischluft/Fortluft links, Zuluft/Abluft
rechts, Wärmetauscher-Icon in der Mitte nur dekorativ), Feuchte,
Volumenstrom, `sonoff.0.Lueftung.SENSOR.ENERGY.*`, Steuerung über
`0_userdata.0.Recovair.*`. Die alte „Klima“-Karte mit
`mqtt.0.ESP09.Keller.Temperature` wurde entfernt (Datenpunkt existiert
laut dir nicht mehr).

**Solaranlage** – neues Fließbild Kollektor → Pumpe → Speicher oben/unten
(gleiches Muster wie der Energiefluss auf der Übersicht) plus
`ebus.1.sc.messages.*`, Regelparameter `0_userdata.0.Solaranlage.*`,
Grafana `vaillant-solaranlage`.

**Temperatur** – 4× `shelly.1.shellyhtg3#...` (Temp/Feuchte/Batterie/
Min-Max/Last-Change), `openweathermap.0`, 2 Grafana-Panels
(`raumtemperatur`, `humidity`). Die Karte „Außen/Innen · abs. Feuchte“
(`0_userdata.0.absFeuchte.*`) wurde auf Wunsch entfernt.

**Grafana-Einbettung (Heizung/PV/Solaranlage/Temperatur)** – alle
Grafana-iframes laufen jetzt über `grafanaFrame()` in `app.js`: feste
Basic-Auth-Zugangsdaten (`admin`/`Batman1!`) direkt in der URL plus
`&kiosk`, damit kein Login-Prompt und kein Grafana-Menü mehr angezeigt
wird — siehe Sicherheitshinweis dazu in `html-dashboard/app/README.md`.

**Statistik** – `statistics.0.temp.sumDelta.*` je Zeitraum (siehe Hinweis
oben), Gesamt-Zähler `fronius.0.inverter.1.TOTAL_ENERGY` /
`0_userdata.0.Smartmeter.LK13BE.total_in/out` / `TotalGas` / `TotalWater`,
Top-Verbraucher über `statistics.0.save.sumDelta.sonoff.0.<Gerät>.SENSOR.ENERGY.Total.month`.
