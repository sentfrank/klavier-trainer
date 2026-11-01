export type Note = { midi: number; beats: number; lyric?: string; finger?: number };
export type Song = { id: string; title: string; level: number; tempo: number; info: string; notes: Note[] };

const N: Record<string, number> = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71, C2: 72 };
const FING: Record<string, number> = { C: 1, D: 2, E: 3, F: 4, G: 5, A: 5, B: 5, C2: 5 };

// "E:1 E:1 F:1 ..." + Silben
function mk(seq: string, lyrics: string, fingers?: Record<string, number>): Note[] {
  const syl = lyrics.split(/\s+/).filter(Boolean);
  return seq.split(/\s+/).filter(Boolean).map((t, i) => {
    const [n, b] = t.split(':');
    return { midi: N[n], beats: Number(b ?? 1), lyric: syl[i], finger: (fingers ?? FING)[n] };
  });
}

export const SONGS: Song[] = [
  {
    id: 'fuenfton', title: 'Fünftonlage C (Übung)', level: 1, tempo: 80,
    info: 'Daumen auf C, jeder Finger eine Taste. Auf und ab, dabei mitsingen.',
    notes: mk('C:1 D:1 E:1 F:1 G:1 F:1 E:1 D:1 C:2', 'do re mi fa sol fa mi re do'),
  },
  {
    id: 'entchen', title: 'Alle meine Entchen', level: 1, tempo: 90,
    info: 'Volkslied, rechte Hand, Fünftonlage C plus A (5. Finger streckt sich).',
    notes: mk(
      'C:1 D:1 E:1 F:1 G:2 G:2 A:1 A:1 A:1 A:1 G:4 A:1 A:1 A:1 A:1 G:4 F:1 F:1 F:1 F:1 E:2 E:2 D:1 D:1 D:1 D:1 C:4',
      'Al- le mei- ne Ent- chen schwim- men auf dem See, schwim- men auf dem See, Köpf- chen in das Was- ser, Schwänz- chen in die Höh.',
      { C: 1, D: 2, E: 3, F: 4, G: 5, A: 5 }),
  },
  {
    id: 'haenschen', title: 'Hänschen klein', level: 1, tempo: 90,
    info: 'Volkslied, rechte Hand in Fünftonlage C.',
    notes: mk(
      'G:1 E:1 E:2 F:1 D:1 D:2 C:1 D:1 E:1 F:1 G:1 G:1 G:2 G:1 E:1 E:2 F:1 D:1 D:2 C:1 E:1 G:1 G:1 C:4',
      'Häns- chen klein ging al- lein in die wei- te Welt hin- ein. Stock und Hut steht ihm gut, ist gar wohl- ge- mut.'),
  },
  {
    id: 'ode', title: 'Ode an die Freude', level: 2, tempo: 80,
    info: 'Beethoven / Schiller, rechte Hand in Fünftonlage C.',
    notes: mk(
      'E:1 E:1 F:1 G:1 G:1 F:1 E:1 D:1 C:1 C:1 D:1 E:1 E:1.5 D:0.5 D:2 E:1 E:1 F:1 G:1 G:1 F:1 E:1 D:1 C:1 C:1 D:1 E:1 D:1.5 C:0.5 C:2',
      'Freu- de, schö- ner Göt- ter- fun- ken, Toch- ter aus E- ly- si- um, wir be- tre- ten feu- er- trun- ken, Himm- li- sche, dein Hei- lig- tum!'),
  },
];
