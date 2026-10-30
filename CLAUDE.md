# GutLog

Ernährungs- und Symptomtagebuch als Web-App (PWA). Eine Patientin mit langjährigem Sodbrennen und weiteren Verdauungsbeschwerden (Blähbauch, Blähungen, Durchfall) protokolliert Mahlzeiten, Symptome und Medikamente. Ziel ist herauszufinden, woher die Beschwerden kommen und wie Ernährung, Alltag, Medikamente und Symptome zusammenhängen. Ein Teilziel ist, Pantoprazol abzusetzen. Sandra (medizinische Fachperson) wertet die Wochenberichte aus.

Die UX ist im claude.ai-Projekt „GutLog“ dokumentiert: Desk Research und App-Benchmark, User Flows (Kernaufgaben, Abläufe, Screen-Struktur, Entscheidungen). Neue Funktionen daran ausrichten.

## Wer hier arbeitet
Sandra ist Product Ownerin und lernt gerade, Code zu lesen. Erkläre jede Änderung kurz in einfachen Worten (was, warum, wo im Code). Antworte auf Deutsch.

## Dateien
- `index.html` – die App für die Patientin (läuft auf Android). Alles in einer Datei: HTML, CSS, JavaScript.
- Ausgewertet wird nicht in einer eigenen Seite, sondern mit Claude im claude.ai-Projekt „GutLog“: Sandra lädt dort den Wochenbericht hoch, Claude wertet nach der Anleitung `claude/auswertung-anleitung.md` aus. (Das frühere `auswertung.html` wurde entfernt.)
- `sw.js` – Service Worker für den Offline-Betrieb.
- Online, zwei Stufen (GitHub Pages über die Action `.github/workflows/pages.yml`):
  - Live: https://sandramhnk.github.io/gutlog/, aus Zweig `main`. Das nutzt Fabienne.
  - Test: https://sandramhnk.github.io/gutlog/test/, aus Zweig `test`.

## Arbeitsweise mit Test-Stage
- Neue Funktionen und Bugfixes immer auf dem Zweig `test` (oder einem Zweig davon) bauen und pushen. Nie direkt auf `main`.
- Sandra testet auf dem Handy unter /gutlog/test/. Erst wenn sie zustimmt: Pull Request `test` → `main`, dann ist es live.
- Die Testversion erkennt sich am Pfad `/test/` (Konstante `STAGE`) und speichert unter `glt_d`, `glt_f`, `glt_c` statt `gl_…`. Neue Speicherschlüssel immer mit dem Präfix `K` bauen, nie fest `gl_` schreiben.
- In der Testversion steht oben ein rotbraunes Band „Testversion“.

## Wie die App funktioniert
- Version 2.0 wird ab Etappe 0 neu gebaut (Umsetzungsplan „GutLog 2.0 – Umsetzungsplan“ im claude.ai-Projekt). Design-Vorlage: Design System „GutLog“ und Canvas „GutLog Screens“.
- `index.html` ist in nummerierte Abschnitte gegliedert: Design-Tokens (CSS-Variablen aus dem Design System), Grundlagen, Bausteine; im Script STAGE, Speicher, Datum, Helfer, Navigation, je Screen ein Abschnitt, Icon/Manifest/Offline, Start.
- Farben, Schriften, Abstände nur über die CSS-Variablen in `:root` verwenden, keine festen Farbwerte im restlichen CSS.
- Navigation über die Adresse: `#heute`, `#verlauf`, `#bericht`, `#einstellungen` (Funktion `showScreen`). `#abschluss` ist der Tagesabschluss, ein Unterbereich von Heute ohne eigenen Navigationspunkt; er gilt für den Tag, der auf Heute gerade angezeigt wird (`viewKey`).
- Daten liegen nur lokal im Browser (localStorage), immer mit Präfix `K`: `K+'d'` Tage, `K+'f'` Gerichte-Gedächtnis, `K+'c'` Einstellungen. `K` ist `gl_` (Live) oder `glt_` (Test). Zugriff nur über `STORE`, `getDay`, `saveDay`.
- Datenmodell v2: `{v:2, days:{'JJJJ-MM-TT':{meals:[], meds:[], events:[], close:null}}}`. Felder je Eintrag stehen im Umsetzungsplan („Neues Datenmodell“). Daten im alten Format werden beim Start nach `K+'d_v1'` verschoben.
- Pantoprazol wird nur eingetragen, wenn es genommen wurde. Ein Tipp auf den Haken trägt die Dosis aus den Einstellungen ein (`pantoDose`, Standard 40 mg, wählbar 10/20/40); im Eintrag wird keine Dosis gewählt. Als „anderes Medikament“ lässt sich Pantoprazol nicht eintragen. `status`: `eingenommen` | `reduziert`, reduziert = weniger als die volle Dosis 40 mg (`PANTO_FULL`), z. B. beim Absetzen. Kein Eintrag an einem Tag, an dem sonst etwas erfasst wurde, heißt: nicht genommen. Tage ganz ohne Einträge zählen in der Auswertung nicht.
- Mahlzeit: nur der Titel ist Pflicht, Zutaten freiwillig. Das Gerichte-Gedächtnis (`K+'f'`, Schlüssel = Titel in Kleinbuchstaben) liefert Titel-Vorschläge und die Zutaten vom letzten Mal. Zutaten werden an bekannte Schreibweisen angeglichen, damit die Auswertung sie zählen kann.
- Tagesabschluss `day.close`: `sodbrennen`, `blaehbauch`, `blaehungen`, `stress` (0–3), `bewegung` (1–3), `stuhl` (`{count, kind}`), `null` = nicht beantwortet, dazu `addedAt` und `savedAt`. Jeder Tipp speichert sofort; sind alle sechs Angaben wieder leer, wird `close` zu `null` (Tag zählt dann nicht als Tag mit Einträgen, `hasData`). Ereignisse `day.events`: `type`, `other` (bei „Anderes“), `level` (1–3), `time`, `note`. Durchfall ist kein eigenes Feld, die Auswertung leitet ihn aus dem Stuhlgang ab (WHO: mindestens 3× breiig oder flüssig).
- Verlauf: Woche Montag bis Sonntag als Balken aus dem Tagesabschluss, Pantoprazol-Punkt nur an Tagen mit Einträgen. Fabienne sieht keine Zusammenhänge; „Oft davor“ und „Gut vertragen“ gehören in die Auswertung mit Claude. Die frühere Berechnung (`relations`, `dayItems`) wurde entfernt und steht in der Git-Geschichte. `symptomOn` bleibt: eine Beschwerde gilt ab Stufe 2 (Mittel) im Tagesabschluss oder bei einem Ereignis ab Mittel; bei Stuhlgang zählt der Durchfall-Tag. Danach zählt auch „Tage mit Sodbrennen“ im Bericht.
- Datumsschlüssel sind `JJJJ-MM-TT` in Ortszeit (Funktion `dk`). Nicht `toISOString()` verwenden, das ist UTC. Was bis 4:00 Uhr nachts passiert, zählt zum Vortag (`dayKeyFor`); solche Zeiten werden ans Ende des Tages sortiert (`byTime`) und im Bericht mit „(nachts)“ markiert. Bleibt die App über Nacht offen, springt sie beim Zurückkommen auf den neuen Tag (`checkDayChange`).
- Wochenbericht Format 2.0 (`buildReport`, `shareReport`): `.txt`-Datei, oben lesbarer Text, unten nach der Zeile `=== GUTLOG-DATEN` die Daten als JSON `{app, version:'2.0', stage, range:{from,to}, contextFrom, exportedAt, settings:{pantoDose}, days}`. Woche = Montag bis Sonntag; der Sonntag davor wird als Vortag-Kontext mitgeschickt. Teilen als Datei, sonst als Text, sonst Zwischenablage. Die Anleitung `auswertung-anleitung.md` im Projekt beschreibt genau dieses Format. Format nur ändern, wenn die Anleitung gleichzeitig angepasst wird.
- Die Auswertungs-Anleitung verwendet dieselben Regeln wie die App (Beschwerde ab Stufe 2, Durchfall nach WHO, kein Pantoprazol-Eintrag = nicht genommen) und prüft mögliche Auslöser am selben Tag und am Vortag. Andere Medikamente zählen nicht als Auslöser (werden meist wegen Beschwerden genommen). Ändern sich Regeln in der App, die Anleitung mit anpassen.
- Einstellungen (`renderEinstellungen`, gespeichert in `K+'c'`): Erinnerungen (Abend und Sonntags-Bericht), Pantoprazol-Dosis, Gerichte verwalten (umbenennen gilt auch für alle bisherigen Einträge, gleicher Name legt zusammen; löschen nimmt nur aus den Vorschlägen), alle Daten löschen (Tage und Gerichte, Einstellungen bleiben).
- Erinnerungen (`REMINDERS`): `abend` jeden Abend an den Tagesabschluss (nur wenn er noch offen ist, öffnet `#abschluss`; Einstellungen `reminder`, `reminderTime`, `reminderLast`) und `bericht` sonntags an den Wochenbericht (nur wenn der Bericht dieser Woche noch nicht geteilt wurde, öffnet `#bericht`; `reportReminder`, `reportReminderTime`, `reportReminderLast`). Erfolgreich geteilte Wochen stehen in `reportSentWeeks` (`markReportSent`). Wecker in der App (`scheduleReminder`, `checkReminder`), Benachrichtigung über den Service Worker. Ausschalten setzt die Uhrzeit auf die Standardzeit zurück. Kommt nur, wenn die App kurz vorher noch lief; ohne Server (Push) geht es nicht zuverlässig. In der App ehrlich erklärt, Wecker im Handy empfohlen.
- Robustheit: Beim Laden wird jeder Tag vervollständigt (`fixDay`), unbekannte Werte zeigen sich über `lab()` statt abzustürzen, kaputter Speicher wird nach `K+'d_broken'` gesichert. Doppeltipp-Schutz: Pantoprazol-Haken und Tipps direkt nach dem Schließen eines Sheets (`tapBlockUntil`).
- Testversion: In den Einstellungen legt „Testdaten einspielen“ zwei Wochen Beispieldaten an (`makeTestData`, bricht in Live sofort ab).
- Icon und Manifest werden per Canvas im Code erzeugt (`drawIcon`, `pwaBoot`). In der Testversion trägt das Icon ein Schild „TEST“. Offline-Betrieb über `sw.js` (zuerst Netz, sonst Speicher; Live und Test getrennt).

## Bewusste Entscheidungen
- Kein Backend und keine Datenbank vorerst (Supabase wurde ausprobiert und wieder entfernt). Datenaustausch per Teilen.
- Keine direkte Claude-API im Tool: Ein API-Schlüssel wäre in einer öffentlichen Seite auslesbar. KI-Auswertung erfolgt im claude.ai-Projekt „GutLog“ nach der Anleitung `auswertung-anleitung.md`.
- Keine echten Patientendaten im Repository. Das Repository ist öffentlich.

## Offene Punkte
- Teilen auf echtem Android- und iOS-Gerät testen (kommt die .txt-Datei in WhatsApp an und lässt sie sich im claude.ai-Projekt hochladen?).
- Erinnerung auf echtem Android-Gerät ausprobieren (Benachrichtigung erlauben, „Jetzt ausprobieren“, abends mit kurz vorher geöffneter App).

## Vor jedem Push
- JavaScript auf Syntaxfehler prüfen und den Ablauf einmal im Browser in Handy-Größe durchspielen: Eintrag anlegen → Bericht erstellen → Text und JSON-Teil prüfen (die Teile, die in der aktuellen Etappe schon existieren).
- Commit-Nachrichten auf Deutsch, kurz beschreiben was und warum.
