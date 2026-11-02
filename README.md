# Klavier-Trainer

Web-App zum Klavierlernen mit E-Piano (Web MIDI) und Gesang.

- E-Piano per USB/Bluetooth-MIDI verbinden (Chrome/Edge)
- Notenansicht mit Fingersatz und Liedtext
- Warten-Modus mit Richtig/Falsch-Prüfung, Zuhören-Modus mit Tempo
- 12-Wochen-Trainingsplan (3 × 60 Min pro Woche)

Lokal starten: `npm install && npm run dev`
Deployment: automatisch auf GitHub Pages bei jedem Push auf `main`.

## Deployment auf Strato (w-esel.de/klavier-trainer)
Bei jedem Push lädt GitHub Actions den Build per SFTP in den Ordner `w-esel/klavier-trainer`.
Benötigte Repository-Secrets (Settings → Secrets and variables → Actions):
- `STRATO_SFTP_USER` – SFTP-Benutzername (bei Strato meist der Domainname, z. B. `w-esel.de`)
- `STRATO_SFTP_PASSWORD` – SFTP-Passwort
- optional `STRATO_SFTP_HOST` (Standard: `ssh.strato.de`) und Variable `STRATO_TARGET_DIR`
