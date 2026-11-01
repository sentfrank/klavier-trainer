export type Session = { id: string; title: string; blocks: { min: number; text: string; songId?: string }[] };
export type Week = { n: number; month: number; title: string; goal: string; sessions?: Session[] };

export const WEEKS: Week[] = [
  { n: 1, month: 1, title: 'Orientierung & Fünftonlage C', goal: 'Ode an die Freude im Warten-Modus mit ≥ 90 % Treffern',
    sessions: [
      { id: 'w1s1', title: 'Einheit 1 – Die Tastatur', blocks: [
        { min: 10, text: 'Aufwärmen: Finger nummerieren (Daumen = 1). Alle C auf dem E-Piano finden – C liegt links vor den zwei schwarzen Tasten.' },
        { min: 10, text: 'Theorie: Notennamen C bis G, Notenlinien im Violinschlüssel. Fünftonlage hören und mitsingen.', songId: 'fuenfton' },
        { min: 30, text: 'Stück: Fünftonlage im Warten-Modus, dann Alle meine Entchen.', songId: 'entchen' },
        { min: 10, text: 'Singen: Entchen mitspielen und laut mitsingen. Tempo ruhig auf 70 % stellen.', songId: 'entchen' },
      ]},
      { id: 'w1s2', title: 'Einheit 2 – Erste Lieder', blocks: [
        { min: 10, text: 'Aufwärmen: Fünftonlage C auf und ab, gleichmäßig, 3×.', songId: 'fuenfton' },
        { min: 10, text: 'Theorie: Viertel, Halbe, Ganze – mitklatschen und zählen.' },
        { min: 30, text: 'Stück: Hänschen klein – erst Zuhören, dann Warten-Modus.', songId: 'haenschen' },
        { min: 10, text: 'Singen: Hänschen klein spielen und singen.', songId: 'haenschen' },
      ]},
      { id: 'w1s3', title: 'Einheit 3 – Ode an die Freude', blocks: [
        { min: 10, text: 'Aufwärmen: Fünftonlage + Entchen zur Wiederholung.', songId: 'entchen' },
        { min: 10, text: 'Theorie: Punktierte Viertel (Takt 4 der Ode).' },
        { min: 30, text: 'Stück: Ode an die Freude, erst Zeile 1, dann komplett.', songId: 'ode' },
        { min: 10, text: 'Singen: Ode spielen und den Schiller-Text singen.', songId: 'ode' },
      ]},
    ]},
  { n: 2, month: 1, title: 'Violinschlüssel sicher lesen', goal: 'Neue Lieder vom Blatt in C-Lage' },
  { n: 3, month: 1, title: 'Linke Hand: C, F, G als ganze Noten', goal: 'Akkordwechsel C–F–G ohne Pause' },
  { n: 4, month: 1, title: 'Melodie + Grundakkord', goal: 'Ode mit linker Hand C/G begleiten' },
  { n: 5, month: 2, title: 'Bassschlüssel', goal: 'Basstöne C bis G lesen' },
  { n: 6, month: 2, title: 'Hände zusammen', goal: 'Einfache Stücke beidhändig im Warten-Modus' },
  { n: 7, month: 2, title: 'Am, Dm, Em & Umkehrungen', goal: 'Sechs Akkorde flüssig greifen' },
  { n: 8, month: 2, title: 'Begleitmuster & Amazing Grace', goal: 'Gebrochene Akkorde zum eigenen Gesang' },
  { n: 9, month: 3, title: 'Pop-Pattern I–V–vi–IV', goal: 'Vier-Akkord-Folge im Rhythmus' },
  { n: 10, month: 3, title: 'Lead Sheets spielen', goal: 'Melodie + Akkordsymbole selbst kombinieren' },
  { n: 11, month: 3, title: 'Transponieren & Für Elise (Anfang)', goal: 'Lied in eigene Gesangslage legen' },
  { n: 12, month: 3, title: 'Abschluss-Stück', goal: 'Ein Lied komplett spielen und singen' },
];
