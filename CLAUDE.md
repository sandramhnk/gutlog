# GutLog

Ernährungs- und Symptomtagebuch als Web-App (PWA). Eine Patientin mit langjährigem Sodbrennen und weiteren Verdauungsbeschwerden (Blähbauch, Blähungen, Durchfall) protokolliert Mahlzeiten, Symptome und Medikamente. Ziel ist herauszufinden, woher die Beschwerden kommen und wie Ernährung, Alltag, Medikamente und Symptome zusammenhängen. Ein Teilziel ist, Pantoprazol abzusetzen. Sandra (medizinische Fachperson) wertet die Wochenberichte aus.

Die UX ist im claude.ai-Projekt „GutLog“ dokumentiert: Desk Research und App-Benchmark, User Flows (Kernaufgaben, Abläufe, Screen-Struktur, Entscheidungen). Neue Funktionen daran ausrichten.

## Wer hier arbeitet
Sandra ist Product Ownerin und lernt gerade, Code zu lesen. Erkläre jede Änderung kurz in einfachen Worten (was, warum, wo im Code). Antworte auf Deutsch.

## Dateien
- `index.html` – die App für die Patientin (läuft auf Android). Alles in einer Datei: HTML, CSS, JavaScript.
- `auswertung.html` – Auswertungs-Tool für Sandra. Lädt einen geteilten Bericht (Datei oder eingefügter Text) und zeigt Zahlen, Diagramme und eine regelbasierte Zusammenfassung.
- Online: https://sandramhnk.github.io/gutlog/ und https://sandramhnk.github.io/gutlog/auswertung.html (GitHub Pages, veröffentlicht automatisch nach jedem Push auf `main`).

## Wie die App funktioniert
- Daten liegen nur lokal im Browser (localStorage). Schlüssel: `gl_d` Einträge, `gl_n` Notizen, `gl_c` Einstellungen.
- Ein Eintrag hat `id`, `time`, `type` (`meal` | `symptom` | `medication`) und je nach Typ weitere Felder. Medikamente haben `status`: `eingenommen` | `reduziert` | `ausgelassen`.
- Datumsschlüssel sind `JJJJ-MM-TT` in Ortszeit (Funktion `dk`). Nicht `toISOString()` verwenden, das ist UTC.
- Wochenbericht: Tab „Bericht“ → `shareReport()` nutzt die Teilen-Funktion des Handys (Web Share API). Gesendet wird eine `.txt`-Datei: oben lesbarer Text, unten nach der Zeile `=== GUTLOG-DATEN` die Daten als JSON. `auswertung.html` liest genau dieses Format. Format nur ändern, wenn beide Dateien angepasst werden.
- Icon und Manifest werden per Canvas im Code erzeugt (`pwaBoot`).

## Bewusste Entscheidungen
- Kein Backend und keine Datenbank vorerst (Supabase wurde ausprobiert und wieder entfernt). Datenaustausch per Teilen.
- Keine direkte Claude-API im Tool: Ein API-Schlüssel wäre in einer öffentlichen Seite auslesbar. KI-Auswertung erfolgt im claude.ai-Projekt „GutLog“ nach der Anleitung `auswertung-anleitung.md`.
- Keine echten Patientendaten im Repository. Das Repository ist öffentlich.

## Offene Punkte
- Teilen auf echtem Android- und iOS-Gerät testen (Datei kommt in WhatsApp an?).
- Erinnerungen auf Android: Web-Apps können Benachrichtigungen nicht zuverlässig senden, wenn sie geschlossen sind. Lösung klären oder Grenzen dokumentieren.
- Ungenutztes CSS aus der Supabase-Zeit (`.sync-dot`, `.cfg-*`) aufräumen.

## Vor jedem Push
- JavaScript auf Syntaxfehler prüfen und den Ablauf einmal im Browser durchspielen: Eintrag anlegen → Bericht teilen → in `auswertung.html` laden.
- Commit-Nachrichten auf Deutsch, kurz beschreiben was und warum.
