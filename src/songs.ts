import { store } from './store';
export type Note = { rh: number[]; lh: number[]; beats: number; lyric?: string; finger?: number; chord?: string };
export type Cat = 'lied' | 'uebung' | 'blatt';
export type Song = {
  id: string; title: string; level: number; tempo: number; info: string; cat: Cat;
  notes: Note[]; bpb?: number; pickup?: number; lead?: boolean; gen?: () => Note[];
};

const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 };
function pitch(s: string) {
  const m = /^([A-H])(#|b)?(\d)$/.exec(s);
  if (!m) throw new Error('Note? ' + s);
  return (+m[3] + 1) * 12 + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const keys = (s: string) => (s ? s.split('+').map(pitch) : []);
const FR: Record<number, number> = { 60: 1, 62: 2, 64: 3, 65: 4, 67: 5, 69: 5 };
const FL: Record<number, number> = { 48: 5, 50: 4, 52: 3, 53: 2, 55: 1, 57: 1 };

/** Token: [{Akkord}]RH[/LH]:Schläge – z. B. "{C}E4/C3:2", "/C3+E3+G3:4", "G4" */
function mk(seq: string, lyrics = '', o: { left?: boolean; fingers?: boolean } = {}): Note[] {
  const syl = lyrics.split(/\s+/).filter(Boolean);
  return seq.split(/\s+/).filter(t => t && t !== '|').map((tok, i) => {
    let t = tok, chord: string | undefined;
    const cm = /^\{([^}]+)\}(.*)$/.exec(t); if (cm) { chord = cm[1]; t = cm[2]; }
    const [k, b] = t.split(':');
    let rh: number[], lh: number[];
    if (k.includes('/')) { const [r, l] = k.split('/'); rh = keys(r); lh = keys(l); }
    else if (o.left) { rh = []; lh = keys(k); } else { rh = keys(k); lh = []; }
    const ly = syl[i] && syl[i] !== '_' ? syl[i] : undefined;
    let finger: number | undefined;
    if (o.fingers && rh.length + lh.length === 1) finger = rh.length ? FR[rh[0]] : FL[lh[0]];
    return { rh, lh, beats: Number(b ?? 1), lyric: ly, finger, chord };
  });
}
const rhOnly = (n: Note[]) => n.map(x => ({ ...x, lh: [], finger: x.rh.length === 1 ? FR[x.rh[0]] : undefined }));

// Akkord-Griffe (nahe Lage, wenig Handbewegung)
const CH: Record<string, { rh: string; lh: string; fifth: string; tri: string }> = {
  C: { rh: 'C4+E4+G4', lh: 'C3', fifth: 'G2', tri: 'C3+E3+G3' },
  G: { rh: 'B3+D4+G4', lh: 'G2', fifth: 'D3', tri: 'B2+D3+G3' },
  Am: { rh: 'C4+E4+A4', lh: 'A2', fifth: 'E3', tri: 'C3+E3+A3' },
  F: { rh: 'C4+F4+A4', lh: 'F2', fifth: 'C3', tri: 'C3+F3+A3' },
  Em: { rh: 'B3+E4+G4', lh: 'E2', fifth: 'B2', tri: 'B2+E3+G3' },
  Dm: { rh: 'D4+F4+A4', lh: 'D3', fifth: 'A2', tri: 'D3+F3+A3' },
};
const prog = (chords: string, pat: (c: (typeof CH)[string], name: string) => string) =>
  chords.split(' ').map(c => pat(CH[c], c)).join(' ');
const POP = 'C G Am F C G Am F C';

// Melodien
const ODE_LH = '{C}E4/C3 E4 F4 G4 {G}G4/G3 F4 E4 D4 {C}C4/C3 C4 D4 E4 {G}E4/G3:1.5 D4:0.5 D4:2 {C}E4/C3 E4 F4 G4 {G}G4/G3 F4 E4 D4 {C}C4/C3 C4 D4 E4 {G}D4/G3:1.5 C4:0.5 {C}C4/C3:2';
const ODE_TXT = 'Freu- de, schö- ner Göt- ter- fun- ken, Toch- ter aus E- ly- si- um, wir be- tre- ten feu- er- trun- ken, Himm- li- sche, dein Hei- lig- tum!';
const TW1 = '{C}C4/C3 C4 G4 G4 {F}A4/F3 A4 {C}G4/C3:2', TW2 = '{F}F4/F3 F4 {C}E4/C3 E4 {G}D4/G3 D4 {C}C4/C3:2', TW3 = '{C}G4/C3 G4 {F}F4/F3 F4 {C}E4/C3 E4 {G}D4/G3:2';
const TW_LH = [TW1, TW2, TW3, TW3, TW1, TW2].join(' ');
const TW_TXT = 'Twin- kle, twin- kle, lit- tle star, how I won- der what you are! Up a- bove the world so high, like a dia- mond in the sky. Twin- kle, twin- kle, lit- tle star, how I won- der what you are!';
const SAINTS_LH = '{C}C4/C3 E4 F4 G4:4 C4/C3 E4 F4 G4:4 C4/C3 E4 F4 G4:2 E4:2 C4/C3:2 E4:2 {G}D4/G3:4 {C}E4/C3 E4 D4 C4:3 C4 E4/C3:2 G4:2 G4 {F}F4/F3:2 F4 {C}E4/C3 F4 G4:2 E4:2 C4/C3:2 {G}D4/G3:2 {C}C4/C3:4';
const SAINTS_TXT = 'Oh when the saints go march- ing in, oh when the saints go march- ing in, oh how I want to be in that num- ber, when the saints go march- ing in.';
const toLead = (s: string) => s.replace(/\/C3/g, '/C3+E3+G3').replace(/\/F3/g, '/C3+F3+A3').replace(/\/G3/g, '/B2+D3+G3');
const AMAZING = 'G3 {C}C4/C3:2 E4:0.5 C4:0.5 E4/C3:2 D4 {F}C4/F3:2 A3 {C}G3/C3:2 G3 C4/C3:2 E4:0.5 C4:0.5 E4/C3:2 D4 {G}G4/G3:2 E4 {C}G4/C3:2 E4:0.5 G4:0.5 E4/C3:2 D4 {F}C4/F3:2 A3 {C}G3/C3:2 G3 C4/C3:2 E4:0.5 C4:0.5 {G}E4/G3:2 D4 {C}C4/C3:3';
const AMAZING_TXT = 'A- maz- ing _ grace, how sweet the sound that saved a _ wretch like me. I once was _ lost, but now am found, was blind, but _ now I see.';
const ELISE = 'E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 {Am}A4/A2:1.5 C4:0.5 E4:0.5 A4:0.5 {E}B4/E2:1.5 E4:0.5 G#4:0.5 B4:0.5 {Am}C5/A2:1.5 E4:0.5 E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 {Am}A4/A2:1.5 C4:0.5 E4:0.5 A4:0.5 {E}B4/E2:1.5 E4:0.5 C5:0.5 B4:0.5 {Am}A4/A2:3';
const ENTCHEN = mk('C4 D4 E4 F4 G4:2 G4:2 A4 A4 A4 A4 G4:4 A4 A4 A4 A4 G4:4 F4 F4 F4 F4 E4:2 E4:2 D4 D4 D4 D4 C4:4',
  'Al- le mei- ne Ent- chen schwim- men auf dem See, schwim- men auf dem See, Köpf- chen in das Was- ser, Schwänz- chen in die Höh.', { fingers: true });

// Blattspiel-Generator (Piano-Marvel-Prinzip: immer neue, unbekannte Noten)
const DRILL_LEN = [10, 12, 16, 20, 24];
function drill(rhPool: string, lhPool: string) {
  const R = keys(rhPool), L = keys(lhPool);
  return () => {
    const n = DRILL_LEN[(store.get().level ?? 1) - 1] ?? 12;
    const out: Note[] = []; let ir = Math.floor(R.length / 2), il = Math.floor(L.length / 2);
    for (let k = 0; k < n; k++) {
      const useL = !R.length || (L.length > 0 && Math.random() < 0.5);
      const step = () => Math.floor(Math.random() * 5) - 2;
      if (useL) { il = Math.max(0, Math.min(L.length - 1, il + step())); out.push({ rh: [], lh: [L[il]], beats: k === n - 1 ? 2 : 1 }); }
      else { ir = Math.max(0, Math.min(R.length - 1, ir + step())); out.push({ rh: [R[ir]], lh: [], beats: k === n - 1 ? 2 : 1 }); }
    }
    return out;
  };
}

export const SONGS: Song[] = [
  // Lieder
  { id: 'entchen', cat: 'lied', title: 'Alle meine Entchen', level: 1, tempo: 90, info: 'Volkslied, rechte Hand in C-Lage. Für das A streckt sich der 5. Finger.', notes: ENTCHEN },
  { id: 'haenschen', cat: 'lied', title: 'Hänschen klein', level: 1, tempo: 90, info: 'Volkslied, rechte Hand in C-Lage.',
    notes: mk('G4 E4 E4:2 F4 D4 D4:2 C4 D4 E4 F4 G4 G4 G4:2 G4 E4 E4:2 F4 D4 D4:2 C4 E4 G4 G4 C4:4',
      'Häns- chen klein ging al- lein in die wei- te Welt hin- ein. Stock und Hut steht ihm gut, ist gar wohl- ge- mut.', { fingers: true }) },
  { id: 'ode', cat: 'lied', title: 'Ode an die Freude', level: 1, tempo: 80, info: 'Beethoven / Schiller, rechte Hand in C-Lage.', notes: rhOnly(mk(ODE_LH, ODE_TXT)) },
  { id: 'twinkle', cat: 'lied', title: 'Twinkle, Twinkle, Little Star', level: 1, tempo: 90, info: 'Englisches Kinderlied. Neu: das A – der 5. Finger streckt sich nach rechts.', notes: rhOnly(mk(TW_LH, TW_TXT)) },
  { id: 'saints', cat: 'lied', title: 'When the Saints Go Marching In', level: 2, tempo: 100, info: 'Spiritual, rechte Hand. Achte auf die langen Noten – innerlich weiterzählen!', notes: rhOnly(mk(SAINTS_LH, SAINTS_TXT)) },
  { id: 'ode-lh', cat: 'lied', title: 'Ode an die Freude – beidhändig', level: 2, tempo: 70, info: 'Linke Hand spielt den Grundton C oder G zu Beginn jedes Takts (C = Finger 5, G = Daumen).', notes: mk(ODE_LH, ODE_TXT) },
  { id: 'twinkle-lh', cat: 'lied', title: 'Twinkle – beidhändig', level: 2, tempo: 80, info: 'Linke Hand: Grundtöne C, F, G (Finger 5, 2, 1).', notes: mk(TW_LH, TW_TXT) },
  { id: 'saints-lh', cat: 'lied', title: 'When the Saints – beidhändig', level: 3, tempo: 90, info: 'Linke Hand mit Grundtönen C, F, G.', notes: mk(SAINTS_LH, SAINTS_TXT) },
  { id: 'amazing', cat: 'lied', title: 'Amazing Grace', level: 3, tempo: 80, bpb: 3, pickup: 1, info: '3/4-Takt mit Auftakt. Rechte Hand beginnt mit dem Daumen auf G3 (unter dem mittleren C).', notes: rhOnly(mk(AMAZING, AMAZING_TXT)) },
  { id: 'amazing-lh', cat: 'lied', title: 'Amazing Grace – beidhändig', level: 3, tempo: 75, bpb: 3, pickup: 1, info: 'Linke Hand: Grundtöne C, F, G. Ideal zum Begleiten mit Gesang: nur links spielen, Melodie singen.', notes: mk(AMAZING, AMAZING_TXT) },
  { id: 'twinkle-lead', cat: 'lied', title: 'Twinkle – Lead Sheet', level: 3, tempo: 80, lead: true, info: 'Nur Melodie + Akkordsymbole. Die linke Hand greift die Akkorde selbst: C = C-E-G, F = C-F-A, G = H-D-G.', notes: mk(toLead(TW_LH), TW_TXT) },
  { id: 'saints-lead', cat: 'lied', title: 'When the Saints – Lead Sheet', level: 4, tempo: 90, lead: true, info: 'Melodie + Akkordsymbole, linke Hand als Dreiklang.', notes: mk(toLead(SAINTS_LH), SAINTS_TXT) },
  { id: 'elise', cat: 'lied', title: 'Für Elise (Anfang, vereinfacht)', level: 4, tempo: 60, bpb: 3, pickup: 1, info: 'Beethoven, a-Moll. Neu: Kreuz-Töne D♯ und G♯ (schwarze Tasten). Linke Hand nur Basstöne A und E.', notes: mk(ELISE) },

  // Übungen
  { id: 'fuenfton', cat: 'uebung', title: 'Fünftonlage C – rechts', level: 1, tempo: 80, info: 'Daumen auf dem mittleren C, jeder Finger eine Taste. Auf und ab, dabei mitsingen.', notes: mk('C4 D4 E4 F4 G4 F4 E4 D4 C4:2', 'do re mi fa sol fa mi re do', { fingers: true }) },
  { id: 'lh-uebung', cat: 'uebung', title: 'Fünftonlage C – links', level: 1, tempo: 80, info: 'Kleiner Finger (5) auf C3, Daumen auf G3.', notes: mk('C3 D3 E3 F3 G3 F3 E3 D3 C3:2', 'do re mi fa sol fa mi re do', { left: true, fingers: true }) },
  { id: 'parallel', cat: 'uebung', title: 'Hände zusammen – parallel', level: 2, tempo: 70, info: 'Beide Hände spielen dieselben Töne im Oktavabstand. Fingersatz spiegelt sich: rechts Daumen, links kleiner Finger.', notes: mk('C4/C3 D4/D3 E4/E3 F4/F3 G4/G3 F4/F3 E4/E3 D4/D3 C4/C3:2') },
  { id: 'lh-akkorde', cat: 'uebung', title: 'Akkorde C – F – G (links)', level: 2, tempo: 70, info: 'Drei Töne gleichzeitig. C = C-E-G (5-3-1), F = C-F-A (5-2-1), G = H-D-G (5-3-1). Die Hand bleibt fast liegen!', notes: mk(prog('C F G C C F G C', c => `/${c.tri}:4`)).map((n, i) => ({ ...n, chord: 'C F G C C F G C'.split(' ')[i] })) },
  { id: 'lh-melodie', cat: 'uebung', title: 'Alle meine Entchen – linke Hand', level: 2, tempo: 80, info: 'Die Melodie im Bassschlüssel, eine Oktave tiefer. Finger 5 auf C3.', notes: ENTCHEN.map(n => ({ ...n, lh: n.rh.map(m => m - 12), rh: [], finger: FL[n.rh[0] - 12] })) },
  { id: 'akkorde-moll', cat: 'uebung', title: 'Moll-Akkorde Am, Dm, Em', level: 3, tempo: 70, info: 'Am = C-E-A, Dm = D-F-A, Em = H-E-G. Hör den Unterschied: Moll klingt weicher, nachdenklicher.', notes: mk(prog('C Am Dm G C Em F G C', (c, n) => `{${n}}/${c.tri}:4`)) },
  { id: 'gebrochen', cat: 'uebung', title: 'Gebrochene Akkorde (links)', level: 3, tempo: 80, info: 'Die Akkordtöne nacheinander: unten – Mitte – oben – Mitte. Klingt fließend, ideal zum Singen.', notes: mk(prog('C F G C C F G C', (c, n) => { const [a, b, d] = c.tri.split('+'); return `{${n}}/${a} /${b} /${d} /${b}`; })) },
  { id: 'kanon', cat: 'uebung', title: 'Kanon-Akkordfolge (Pachelbel)', level: 3, tempo: 60, info: 'C – G – Am – Em – F – C – F – G: rechts Dreiklänge, links Grundtöne. Diese Folge steckt in unzähligen Popsongs.', notes: mk(prog('C G Am Em F C F G C', (c, n) => `{${n}}${c.rh}/${c.lh}:4`)) },
  { id: 'pop-1', cat: 'uebung', title: 'Pop-Pattern I–V–vi–IV', level: 3, tempo: 70, info: 'C – G – Am – F: die berühmteste Akkordfolge der Popmusik. Rechts Dreiklang, links Grundton, ganze Noten.', notes: mk(prog(POP, (c, n) => `{${n}}${c.rh}/${c.lh}:4`)) },
  { id: 'pop-2', cat: 'uebung', title: 'Pop-Pattern – Viertel-Rhythmus', level: 4, tempo: 80, info: 'Rechte Hand schlägt den Akkord auf jedem Schlag an, links nur auf Schlag 1. Gleichmäßig wie ein Uhrwerk.', notes: mk(prog(POP, (c, n) => `{${n}}${c.rh}/${c.lh} ${c.rh} ${c.rh} ${c.rh}`)) },
  { id: 'pop-ballade', cat: 'uebung', title: 'Ballade: Bass – Akkord', level: 4, tempo: 80, info: 'Links Grundton, rechts Akkord, links Quinte, rechts Akkord. Das klassische Begleitmuster für Lieder.', notes: mk(prog(POP, (c, n) => `{${n}}/${c.lh} ${c.rh} /${c.fifth} ${c.rh}`)) },

  // Aufbau-Stufen (Level 2–5)
  { id: 'achtel', cat: 'uebung', title: 'Achtelnoten – Fünftonlage', level: 3, tempo: 70, info: 'Zwei Töne pro Schlag. Zähle „1 und 2 und …“.', notes: mk('C4:0.5 D4:0.5 E4:0.5 F4:0.5 G4:0.5 F4:0.5 E4:0.5 D4:0.5 C4/C3:0.5 D4/D3:0.5 E4/E3:0.5 F4/F3:0.5 G4/G3:0.5 F4/F3:0.5 E4/E3:0.5 D4/D3:0.5 C4/C3:2', '', { fingers: true }) },
  { id: 'pop-synkope', cat: 'uebung', title: 'Pop-Pattern – Synkope (3+3+2)', level: 4, tempo: 80, info: 'Der typische Pop-Groove: Akkord auf 1, auf „2 und“ und auf 4. Klingt sofort nach Radio.', notes: mk(prog(POP, (c, n) => `{${n}}${c.rh}/${c.lh}:1.5 ${c.rh}:1.5 ${c.rh}:1`)) },
  { id: 'g-dur', cat: 'uebung', title: 'G-Dur: Fünftonlage & Akkorde', level: 3, tempo: 70, info: 'Neue Lage: rechter Daumen auf G4. Akkorde links: G = H-D-G, C = C-E-G, D = A-D-F♯ (F♯ = schwarze Taste).',
    notes: mk('G4/G3 A4 B4 C5 D5 C5 B4 A4 G4:2 {G}G4/B2+D3+G3:4 {C}G4/C3+E3+G3:4 {D}F#4/A2+D3+F#3:4 {G}G4/B2+D3+G3:4') },
  { id: 'arpeggio', cat: 'uebung', title: 'Arpeggio-Begleitung (links)', level: 4, tempo: 70, info: 'Grundton – Quinte – Oktave – Quinte in Achteln. Die linke Hand öffnet sich weit; Handgelenk locker kreisen lassen.',
    notes: mk(['C:C3 G3 C4 G3', 'G:G2 D3 G3 D3', 'Am:A2 E3 A3 E3', 'F:F2 C3 F3 C3'].concat(['C:C3 G3 C4 G3', 'G:G2 D3 G3 D3', 'Am:A2 E3 A3 E3', 'F:F2 C3 F3 C3']).map(x => { const [c, t] = x.split(':'); const k = t.split(' '); return `{${c}}/${k[0]}:0.5 /${k[1]}:0.5 /${k[2]}:0.5 /${k[1]}:0.5 /${k[0]}:0.5 /${k[1]}:0.5 /${k[2]}:0.5 /${k[1]}:0.5`; }).join(' ') + ' {C}/C3+G3+C4:4') },

  // Blattspiel
  { id: 'blatt-c5', cat: 'blatt', title: 'Blattspiel: C bis G (rechts)', level: 1, tempo: 70, info: 'Jedes Mal neue Noten. Erst lesen, dann spielen – nicht auf die Tasten schauen!', notes: [], gen: drill('C4+D4+E4+F4+G4', '') },
  { id: 'blatt-oktave', cat: 'blatt', title: 'Blattspiel: C4 bis C5 (rechts)', level: 2, tempo: 70, info: 'Ganze Oktave im Violinschlüssel.', notes: [], gen: drill('C4+D4+E4+F4+G4+A4+B4+C5', '') },
  { id: 'blatt-bass', cat: 'blatt', title: 'Blattspiel: Bassschlüssel', level: 2, tempo: 70, info: 'C3 bis G3 im Bassschlüssel, linke Hand.', notes: [], gen: drill('', 'C3+D3+E3+F3+G3') },
  { id: 'blatt-beide', cat: 'blatt', title: 'Blattspiel: beide Schlüssel', level: 3, tempo: 70, info: 'Noten springen zwischen Violin- und Bassschlüssel.', notes: [], gen: drill('C4+D4+E4+F4+G4', 'C3+D3+E3+F3+G3') },
];
export const songById = (id: string) => SONGS.find(s => s.id === id);
