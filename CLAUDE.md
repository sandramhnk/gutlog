# GutLog

Ernährungs- und Symptomtagebuch als Web-App (PWA). Eine Patientin mit langjährigem Sodbrennen und weiteren Verdauungsbeschwerden (Blähbauch, Blähungen, Durchfall) protokolliert Mahlzeiten, Symptome und Medikamente. Ziel ist herauszufinden, woher die Beschwerden kommen und wie Ernährung, Alltag, Medikamente und Symptome zusammenhängen. Ein Teilziel ist, Pantoprazol abzusetzen. Sandra (medizinische Fachperson) wertet die Wochenberichte aus.

Die UX ist im claude.ai-Projekt „GutLog“ dokumentiert: Desk Research und App-Benchmark, User Flows (Kernaufgaben, Abläufe, Screen-Struktur, Entscheidungen). Neue Funktionen daran ausrichten.

## Wer hier arbeitet
Sandra ist Product Ownerin und lernt gerade, Code zu lesen. Erkläre jede Änderung kurz in einfachen Worten (was, warum, wo im Code). Antworte auf Deutsch.

## Dateien
- `index.html` – die App für die Patientin (läuft auf Android). Alles in einer Datei: HTML, CSS, JavaScript.
- `auswertung.html` – Auswertungs-Tool für Sandra. Lädt einen geteilten Bericht (Datei oder eingefügter Text) und zeigt Zahlen, Diagramme und eine regelbasierte Zusammenfassung.
- Online, zwei Stufen (GitHub Pages über die Action `.github/workflows/pages.yml`):
  - Live: https://sandramhnk.github.io/gutlog/ und …/gutlog/auswertung.html, aus Zweig `main`. Das nutzt Fabienne.
  - Test: https://sandramhnk.github.io/gutlog/test/ und …/gutlog/test/auswertung.html, aus Zweig `test`.

## Arbeitsweise mit Test-Stage
- Neue Funktionen und Bugfixes immer auf dem Zweig `test` (oder einem Zweig davon) bauen und pushen. Nie direkt auf `main`.
- Sandra testet auf dem Handy unter /gutlog/test/. Erst wenn sie zustimmt: Pull Request `test` → `main`, dann ist es live.
- Die Testversion erkennt sich am Pfad `/test/` (Konstante `STAGE`) und speichert unter `glt_d`, `glt_f`, `glt_c` statt `gl_…`. Neue Speicherschlüssel immer mit dem Präfix `K` bauen, nie fest `gl_` schreiben.
- In der Testversion steht oben ein rotbraunes Band „Testversion“.

## Wie die App funktioniert
- Version 2.0 wird ab Etappe 0 neu gebaut (Umsetzungsplan „GutLog 2.0 – Umsetzungsplan“ im claude.ai-Projekt). Design-Vorlage: Design System „GutLog“ und Canvas „GutLog Screens“.
- `index.html` ist in nummerierte Abschnitte gegliedert: Design-Tokens (CSS-Variablen aus dem Design System), Grundlagen, Bausteine; im Script STAGE, Speicher, Datum, Helfer, Navigation, je Screen ein Abschnitt, Icon/Manifest/Offline, Start.
- Farben, Schriften, Abstände nur über die CSS-Variablen in `:root` verwenden, keine festen Farbwerte im restlichen CSS.
- Navigation über die Adresse: `#heute`, `#verlauf`, `#bericht`, `#einstellungen` (Funktion `showScreen`).
- Daten liegen nur lokal im Browser (localStorage), immer mit Präfix `K`: `K+'d'` Tage, `K+'f'` Gerichte-Gedächtnis, `K+'c'` Einstellungen. `K` ist `gl_` (Live) oder `glt_` (Test). Zugriff nur über `STORE`, `getDay`, `saveDay`.
- Datenmodell v2: `{v:2, days:{'JJJJ-MM-TT':{meals:[], meds:[], events:[], close:null}}}`. Felder je Eintrag stehen im Umsetzungsplan („Neues Datenmodell“). Daten im alten Format werden beim Start nach `K+'d_v1'` verschoben.
- Datumsschlüssel sind `JJJJ-MM-TT` in Ortszeit (Funktion `dk`). Nicht `toISOString()` verwenden, das ist UTC. Was bis 4:00 Uhr nachts passiert, zählt zum Vortag (`dayKeyFor`).
- Wochenbericht (ab Etappe 5): `.txt`-Datei, oben lesbarer Text, unten nach der Zeile `=== GUTLOG-DATEN` die Daten als JSON. `auswertung.html` liest genau dieses Format. Format nur ändern, wenn beide Dateien angepasst werden.
- Icon und Manifest werden per Canvas im Code erzeugt (`drawIcon`, `pwaBoot`). In der Testversion trägt das Icon ein Schild „TEST“. Offline-Betrieb über `sw.js` (zuerst Netz, sonst Speicher; Live und Test getrennt).

## Bewusste Entscheidungen
- Kein Backend und keine Datenbank vorerst (Supabase wurde ausprobiert und wieder entfernt). Datenaustausch per Teilen.
- Keine direkte Claude-API im Tool: Ein API-Schlüssel wäre in einer öffentlichen Seite auslesbar. KI-Auswertung erfolgt im claude.ai-Projekt „GutLog“ nach der Anleitung `auswertung-anleitung.md`.
- Keine echten Patientendaten im Repository. Das Repository ist öffentlich.

## Offene Punkte
- Teilen auf echtem Android- und iOS-Gerät testen (Datei kommt in WhatsApp an?).
- Erinnerungen auf Android: Web-Apps können Benachrichtigungen nicht zuverlässig senden, wenn sie geschlossen sind. Lösung klären oder Grenzen dokumentieren.

## Vor jedem Push
- JavaScript auf Syntaxfehler prüfen und den Ablauf einmal im Browser in Handy-Größe durchspielen: Eintrag anlegen → Bericht teilen → in `auswertung.html` laden (die Teile, die in der aktuellen Etappe schon existieren).
- Commit-Nachrichten auf Deutsch, kurz beschreiben was und warum.
