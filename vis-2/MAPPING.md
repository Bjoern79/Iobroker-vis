# Datenpunkt-Zuordnung & Annahmen

Alle unten genannten Objekt-IDs stammen entweder direkt aus deinen
hochgeladenen Original-Views (`index`, `viewHeizung`, `viewTemperatur`,
`viewPhotovoltaik`, `view_recovair`, `view_solaranlage`, `navigation`,
`navigation_2`) oder aus deiner Objekt-CSV. Sie sind damit **bestätigt real**,
außer wo unten explizit als Annahme markiert.

## Bitte einmal prüfen (echte, aber nicht 100%ig eindeutige Zuordnungen)

- **`viewStatistics`**: Für dich lag kein Original-Export dieser View vor.
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
  `TotalGasProz` / `TotalGasLast`. Bitte einmal im Editor gegenprüfen.
- **Lüftung → „Nachlaufzeit aktiv“**: im Screenshot ein Schalter, gebunden an
  `0_userdata.0.Recovair.DelayTime`. Der Name deutet eher auf einen
  Zahlenwert (Minuten) als auf ein Boolean hin – falls der Schalter im Editor
  nicht sauber funktioniert, hier stattdessen ein Zahlenfeld/Slider verwenden.
- **Raumklima (Übersicht) / Räume (Temperatur-View)**: In deinem echten Setup
  werden Temperatur und Luftfeuchte pro Raum teils aus unterschiedlichen
  Sensoren gemischt (z. B. DG/OG-Temperatur aus `sonoff.0.HT-*.AM2301`, aber
  Luftfeuchte + Min/Max-Statistik aus dem jeweiligen `shellyhtg3`-Sensor). Das
  wurde 1:1 aus deiner echten Konfiguration übernommen, nicht „korrigiert“ –
  falls das ein Versehen war, einfach im Editor die oid tauschen.

## Nicht native Material-Design-Widgets genutzt für Karten/Diagramme

In deiner Beispieldatei `vis2_alle_objekte` sind u. a.
`tplVis-materialdesign-Card`, `-Chart-Bar`, `-Chart-Line-History`, `-List`
vorhanden. Deren vollständiges Datenschema (z. B. wie Diagramm-Serien oder
Listen-Einträge konkret gebunden werden) war in der Beispieldatei nicht mit
echten Werten befüllt, nur mit Standard-Vorgaben. Um keine kaputten Widgets zu
erzeugen, wurden Karten stattdessen als schlichte, gestylte Container gebaut
(`tplHtml` mit Hintergrund/Radius) und die eigentliche Historie weiterhin über
deine echten Grafana-iframes eingebunden. Schalter (`tplVis-materialdesign-
Switch`) und Regler (`tplVis-materialdesign-Vuetify-Slider`) wurden dagegen
verwendet, da hierfür ein vollständiges, echtes Beispiel aus deinen Daten
vorlag.

## Nicht übernommen (aus deiner echten `index`-View, aber außerhalb der 7 Tabs)

- Pool-Sektion (`sonoff.0.Pool Pumpe/Heizung.POWER`, `TT-Pool` Sensoren,
  Beschattungs-Grafana) – nur die reine Beschattungs-Sonnenschutz-Steuerung
  wurde auf der Übersicht belassen, der Rest (Pool/Kamera/Musik/Zeitplan über
  `navigation_2`) nicht neu gebaut.

## Kern-Zuordnungen je View (Kurzfassung)

**Übersicht (`index`)**
- Außentemperatur: `ebus.1.broadcast.messages.outsidetemp.fields.temp2.value`
- Fronius Jetzt: `sonnen.0.status.production` / `sonoff.0.Smartmeter.SENSOR.LK13BE.power` / `sonnen.0.status.consumption`
- Sonnenbatterie: `sonnen.0.status.userSoc`, `fronius.0.inverter.1.DAY_ENERGY`, `0_userdata.0.Total.PowerDay`, `0_userdata.0.SolarGraph.EnergieMaxHeute/Morgen`
- Logarex: `statistics.0.temp.sumDelta.0_userdata.0.Smartmeter.LK13BE.total_out/in.day`, `0_userdata.0.Smartmeter.LK13BE.total_out/in`
- Gas/Wasser: `statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C1/C2.day`, `0_userdata.0.Total.TotalGas/TotalWater`
- Solarthermie: `ebus.1.sc.messages.Coll1Sensor/Storage1Sensor3/Storage2Sensor3.fields.temp.value`
- Raumklima: siehe Hinweis oben (gemischte Sensoren je Raum)
- Lüftung-Schnellzugriff: `sonoff.0.Lueftung.POWER`, `0_userdata.0.Recovair.VentCmd/BoostCmd`
- USV: `nut.0.info.connection`, `nut.0.battery.charge`
- Beschattung: `0_userdata.0.ShutterControl.SunProtect`

**Heizung** – `km200.0.heatingCircuits.hc1.*`, `km200.0.system.*`,
`ebus.1.mc.*` (Mischer), `ebus.1.bai.*` (Kessel), `ebus.1.sc.Storage*`
(Solarspeicher), `0_userdata.0.Total.TotalGas*`, Grafana
`vaillant-heizung`.

**Photovoltaik** – Energiefluss-iframe, Grafana `photovoltaik`,
`sonnen.0.status.acFrequency/acVoltage`, `sonnen.0.latestData.*`,
`sonnen.0.configurations.DE_Software`, `sonnen.0.ios.DO_12/13/14`,
`sonnen.0.info.connection`.

**Lüftung (`viewRecovair`)** – `ebus.0.recov.messages.*` (4 Luftströme,
Feuchte, Volumenstrom, Bypass), `sonoff.0.Lueftung.SENSOR.ENERGY.*`,
Steuerung über `0_userdata.0.Recovair.*`, Klima über
`openweathermap.0.forecast.current.temperature`,
`mqtt.0.ESP09.Keller.Temperature`, `0_userdata.0.absFeuchte.*`.

**Solaranlage** – `ebus.1.sc.messages.*` (Kollektor/Speicher/Pumpe),
Regelparameter `0_userdata.0.Solaranlage.*`, Grafana `vaillant-solaranlage`.

**Temperatur** – 4× `shelly.1.shellyhtg3#...` (Temp/Feuchte/Batterie/
Min-Max/Last-Change), `openweathermap.0`, `0_userdata.0.absFeuchte.*`,
2 Grafana-Panels (`raumtemperatur`, `humidity`).

**Statistik** – `statistics.0.temp.sumDelta.*` je Zeitraum (siehe Hinweis
oben), Gesamt-Zähler `fronius.0.inverter.1.TOTAL_ENERGY` /
`0_userdata.0.Smartmeter.LK13BE.total_in/out` / `TotalGas` / `TotalWater`,
Top-Verbraucher über `statistics.0.save.sumDelta.sonoff.0.<Gerät>.SENSOR.ENERGY.Total.month`.
