import type { Mode, Hand } from './components/Practice';
import { songById } from './songs';
export type Kind = 'Aufwärmen' | 'Lernen' | 'Üben' | 'Singen';
export type Block = { kind: Kind; min: number; text: string; song?: string; mode?: Mode; hand?: Hand; tempo?: number; transpose?: number; hints?: boolean };
export type Session = { id: string; title: string; blocks: Block[] };
export type Week = { n: number; month: number; title: string; goal: string; sessions: Session[] };

type O = Omit<Block, 'kind' | 'min' | 'text' | 'song'>;
const A = (text: string, song?: string, o: O = {}): Block => ({ kind: 'Aufwärmen', min: 10, text, song, ...o });
const L = (text: string, song?: string, o: O = {}): Block => ({ kind: 'Lernen', min: 10, text, song, ...o });
const U = (text: string, song?: string, o: O = {}): Block => ({ kind: 'Üben', min: 30, text, song, ...o });
const S = (text: string, song?: string, o: O = {}): Block => ({ kind: 'Singen', min: 10, text, song, ...o });
const W = (n: number, month: number, title: string, goal: string, s: [string, Block[]][]): Week =>
  ({ n, month, title, goal, sessions: s.map(([t, b], k) => ({ id: `w${n}s${k + 1}`, title: `Einheit ${k + 1} – ${t}`, blocks: b })) });

const STAGES: Week[] = [
  W(1, 1, 'Orientierung & Fünftonlage C', 'Ode an die Freude im Warten-Modus mit ≥ 90 %', [
    ['Die Tastatur', [
      A('Finger nummerieren (Daumen = 1). Alle C auf dem E-Piano finden – C liegt links vor den zwei schwarzen Tasten.'),
      L('Notennamen C bis G und ihre Plätze im Violinschlüssel. Erst zuhören, dann im Warten-Modus spielen.', 'fuenfton'),
      U('Alle meine Entchen: erst „Zuhören“, dann Warten-Modus. Ziel: ⭐⭐', 'entchen'),
      S('Entchen spielen und laut mitsingen.', 'entchen', { tempo: 80 })]],
    ['Erste Lieder', [
      A('Fünftonlage auf und ab, gleichmäßig, 3×.', 'fuenfton'),
      L('Viertel, Halbe, Ganze: Halbe Noten sind hohl mit Hals, ganze Noten hohl ohne Hals. Klatsche Hänschen klein und zähle laut mit.'),
      U('Hänschen klein – erst hören, dann Warten-Modus.', 'haenschen'),
      S('Hänschen klein spielen und singen.', 'haenschen')]],
    ['Ode an die Freude', [
      A('Entchen zur Wiederholung.', 'entchen'),
      L('Punktierte Viertel: der Punkt verlängert um die Hälfte (Takt 4 der Ode: „E – D D“).'),
      U('Ode an die Freude: erst Zeile 1, dann komplett. Wochenziel ≥ 90 %.', 'ode'),
      S('Ode spielen und den Schiller-Text singen.', 'ode')]],
  ]),
  W(2, 1, 'Noten lesen & Rhythmus', 'Blattspiel C-Oktave ≥ 80 %, Twinkle im Mitspielen-Modus ⭐⭐', [
    ['Linien und Zwischenräume', [
      A('Blattspiel-Training C bis G: lies die Note, sprich den Namen, spiele sie.', 'blatt-c5'),
      L('Violinschlüssel-Linien von unten: E – G – H – D – F („Es Geht Hurtig Durch Fleiß“). Zwischenräume: F – A – C – E. Das mittlere C hat eine eigene Hilfslinie.'),
      U('Twinkle Twinkle: neu ist das A – dein 5. Finger streckt sich vom G zum A. Erst Zuhören, dann Warten-Modus.', 'twinkle'),
      S('Twinkle spielen und singen. Wenn es hakt: Tempo auf 70 %.', 'twinkle', { tempo: 70 })]],
    ['Im Takt bleiben', [
      A('Entchen jetzt im Mitspielen-Modus: die App läuft weiter und bewertet dein Timing.', 'entchen', { mode: 'play', tempo: 70 }),
      L('Takt und Taktstriche: Im 4/4-Takt zählst du „1 – 2 – 3 – 4“. Das Metronom betont die 1. Wichtig: bei Fehlern nicht anhalten, sondern weiterspielen – wie in einer Band.'),
      U('When the Saints: Warten-Modus, dann Mitspielen bei 70 %. Die langen Noten (4 Schläge) bewusst aushalten.', 'saints', { mode: 'play', tempo: 70 }),
      S('Saints spielen und singen – kräftig und fröhlich!', 'saints', { tempo: 80 })]],
    ['Vom Blatt spielen', [
      A('Blattspiel C bis G, 3 Durchgänge.', 'blatt-c5'),
      L('Vom-Blatt-Spiel nach dem Piano-Marvel-Prinzip: 10 Sekunden ansehen, Puls zählen, dann ohne Anhalten spielen. Jetzt die ganze Oktave bis C5.', 'blatt-oktave'),
      U('Ode an die Freude im Mitspielen-Modus: 70 % → 80 % → 90 %.', 'ode', { mode: 'play', tempo: 80 }),
      S('Wochenabschluss: Twinkle und Ode spielen und singen.', 'twinkle', { tempo: 90 })]],
  ]),
  W(3, 1, 'Linke Hand: C, F, G', 'Akkordwechsel C – F – G ohne Pause (Mitspielen ⭐⭐)', [
    ['Die linke Hand', [
      A('Fünftonlage links: kleiner Finger auf C3, Daumen auf G3.', 'lh-uebung'),
      L('Ein Akkord = drei Töne gleichzeitig. C-Dur: C – E – G mit den Fingern 5 – 3 – 1. Greife ihn 5× hintereinander, Hand locker lassen.'),
      U('Akkorde C – F – G im Warten-Modus. Trick: beim F bleibt der kleine Finger auf C liegen, nur Finger 2 und 1 rutschen nach oben.', 'lh-akkorde'),
      S('Akkorde langsam spielen und den tiefsten Ton dazu singen („C – F – G – C“).', 'lh-akkorde', { tempo: 60 })]],
    ['Akkorde wechseln', [
      A('Fünftonlage rechts und links nacheinander.', 'lh-uebung', { mode: 'play', tempo: 70 }),
      L('Warum H-D-G statt G-H-D? Diese Umkehrung liegt nah am C-Akkord – die Hand muss kaum springen. So spielen Profis Liedbegleitung.'),
      U('Akkorde C – F – G im Mitspielen-Modus bei 60 %, dann 80 %.', 'lh-akkorde', { mode: 'play', tempo: 60 }),
      S('Zu den Akkorden „Hänschen klein“ summen – passt erstaunlich gut!', 'lh-akkorde', { mode: 'listen' })]],
    ['Ganze Noten & Begleitung hören', [
      A('Fünftonlage links im Mitspielen-Modus.', 'lh-uebung', { mode: 'play' }),
      L('Ganze Note = 4 Schläge. Laut zählen, während der Akkord klingt. Danach: Ode beidhändig zuhören – so wird es nächste Woche klingen.', 'ode-lh', { mode: 'listen' }),
      U('Akkorde C – F – G bei 100 % im Mitspielen-Modus. Ziel ⭐⭐', 'lh-akkorde', { mode: 'play' }),
      S('Ode mit der rechten Hand spielen, die App spielt die linke Hand als Begleitung – dazu singen.', 'ode-lh', { hand: 'right' })]],
  ]),
  W(4, 1, 'Melodie + Grundton', 'Ode beidhändig im Mitspielen-Modus bei 70 % ⭐⭐', [
    ['Hände zusammenbringen', [
      A('Akkorde C – F – G.', 'lh-akkorde'),
      L('Hände zusammen – die Skoove-Methode: 1. jede Hand einzeln, 2. nur die Stellen, wo beide gleichzeitig spielen, 3. alles langsam. Die linke Hand spielt hier nur zu Taktbeginn.'),
      U('Ode beidhändig: erst nur linke Hand, dann beide im Warten-Modus.', 'ode-lh', { hand: 'left' }),
      S('Ode rechts spielen, App begleitet links – singen.', 'ode-lh', { hand: 'right' })]],
    ['Grundtöne wechseln', [
      A('Blattspiel C bis C5.', 'blatt-oktave'),
      L('C, F und G sind die drei wichtigsten Akkorde in C-Dur (Stufe I, IV, V). Mit ihnen kannst du hunderte Lieder begleiten.'),
      U('Twinkle beidhändig im Warten-Modus. Achte auf den Wechsel zu F3 (Finger 2).', 'twinkle-lh'),
      S('Twinkle beidhändig spielen und singen.', 'twinkle-lh', { tempo: 70 })]],
    ['Monatstest', [
      A('Fünftonlage beidhändig nacheinander.', 'fuenfton', { mode: 'play' }),
      L('Rückblick Monat 1: Noten C bis C5, Viertel/Halbe/Ganze, Akkorde C-F-G. Schau dir deine Bestwerte in der Liederliste an.'),
      U('Monatstest: Ode beidhändig im Mitspielen-Modus bei 70 %. Ziel ⭐⭐', 'ode-lh', { mode: 'play', tempo: 70 }),
      S('Dein Lieblingslied aus Monat 1 spielen und singen.', 'twinkle-lh')]],
  ]),
  W(5, 2, 'Bassschlüssel', 'Blattspiel Bassschlüssel ≥ 80 %', [
    ['Der Bassschlüssel', [
      A('Fünftonlage links.', 'lh-uebung'),
      L('Bassschlüssel-Linien von unten: G – H – D – F – A („Grüne Hasen Dürfen Fast Alles“). Zwischenräume: A – C – E – G („Alle Cowboys Essen Gras“). Der Doppelpunkt des Schlüssels umschließt die F-Linie.', 'blatt-bass'),
      U('Alle meine Entchen mit der linken Hand im Bassschlüssel.', 'lh-melodie'),
      S('Entchen links spielen und singen (eine Oktave höher singen ist okay).', 'lh-melodie')]],
    ['Zwei Schlüssel, ein Klavier', [
      A('Blattspiel Bassschlüssel.', 'blatt-bass'),
      L('Das mittlere C verbindet beide Systeme: Hilfslinie unter dem Violinschlüssel = Hilfslinie über dem Bassschlüssel. Jetzt Noten aus beiden Schlüsseln gemischt.', 'blatt-beide'),
      U('Entchen links im Mitspielen-Modus.', 'lh-melodie', { mode: 'play', tempo: 80 }),
      S('Twinkle rechts, App spielt die Bassbegleitung – singen.', 'twinkle-lh', { hand: 'right' })]],
    ['Lesetest', [
      A('Akkorde C – F – G.', 'lh-akkorde', { mode: 'play' }),
      L('Lesetest: Blattspiel Bassschlüssel, 3 Runden. Ziel ≥ 80 %.', 'blatt-bass'),
      U('Ode beidhändig im Mitspielen-Modus bei 80 %.', 'ode-lh', { mode: 'play', tempo: 80 }),
      S('Ode beidhändig spielen und singen.', 'ode-lh', { tempo: 70 })]],
  ]),
  W(6, 2, 'Hände zusammen', 'Saints beidhändig im Mitspielen-Modus ⭐⭐', [
    ['Parallel spielen', [
      A('Hände zusammen parallel – langsam.', 'parallel'),
      L('Spiegelfingersatz: rechts beginnt der Daumen, links der kleine Finger. Gehirn-Training: beide Hände machen dieselbe Bewegung mit verschiedenen Fingern.'),
      U('When the Saints beidhändig: erst links allein, dann beide im Warten-Modus.', 'saints-lh', { hand: 'left' }),
      S('Saints rechts spielen, App begleitet – singen.', 'saints-lh', { hand: 'right' })]],
    ['Lange Noten aushalten', [
      A('Parallel im Mitspielen-Modus.', 'parallel', { mode: 'play' }),
      L('Während die rechte Hand eine lange Note hält, darf die linke Hand nicht „mitwarten“. Laut zählen hilft: „1 – 2 – 3 – 4“.'),
      U('Saints beidhändig im Mitspielen-Modus bei 60 %.', 'saints-lh', { mode: 'play', tempo: 60 }),
      S('Saints beidhändig spielen und singen.', 'saints-lh', { tempo: 70 })]],
    ['Fehler gezielt üben', [
      A('Blattspiel beide Schlüssel.', 'blatt-beide'),
      L('Fehlerstrategie: Schau, wo die roten Noten waren. Übe genau diese Stelle 5× im Warten-Modus, erst dann wieder das ganze Stück.'),
      U('Saints und Twinkle beidhändig im Mitspielen-Modus. Ziel ⭐⭐', 'saints-lh', { mode: 'play', tempo: 80 }),
      S('Wunschlied aus Monat 1–2 spielen und singen.', 'twinkle-lh')]],
  ]),
  W(7, 2, 'Moll-Akkorde', 'Kanon-Akkordfolge beidhändig im Warten-Modus ≥ 90 %', [
    ['Dur und Moll', [
      A('Akkorde C – F – G.', 'lh-akkorde', { mode: 'play' }),
      L('Dur klingt hell, Moll weicher. Der Unterschied ist nur ein Halbton im mittleren Ton (Terz). Hör dir die Moll-Akkorde zuerst an.', 'akkorde-moll', { mode: 'listen' }),
      U('Moll-Akkorde Am, Dm, Em im Warten-Modus.', 'akkorde-moll'),
      S('Zu jedem Akkord den tiefsten Ton singen – hörst du Dur oder Moll?', 'akkorde-moll', { tempo: 60 })]],
    ['Umkehrungen', [
      A('Moll-Akkorde im Mitspielen-Modus.', 'akkorde-moll', { mode: 'play', tempo: 60 }),
      L('Am wird hier als C-E-A gegriffen: dieselben Töne wie A-C-E, nur anders geschichtet. So bleibt die Hand in der Nähe des C-Akkords.'),
      U('Kanon-Akkordfolge: erst nur rechte Hand (Dreiklänge), dann linke Hand (Grundtöne).', 'kanon', { hand: 'right' }),
      S('Kanon langsam spielen und die Grundtöne summen.', 'kanon', { hand: 'right', tempo: 60 })]],
    ['Kanon beidhändig', [
      A('Blattspiel beide Schlüssel.', 'blatt-beide'),
      L('Pachelbels Kanon (um 1680): diese 8 Akkorde finden sich in vielen Popsongs wieder. Einmal zuhören.', 'kanon', { mode: 'listen' }),
      U('Kanon beidhändig im Warten-Modus. Ziel ≥ 90 %.', 'kanon'),
      S('Kanon spielen, eine eigene Melodie dazu summen – improvisieren erlaubt!', 'kanon')]],
  ]),
  W(8, 2, 'Begleitmuster & Amazing Grace', 'Amazing Grace: nur linke Hand spielen und Melodie singen', [
    ['Gebrochene Akkorde', [
      A('Gebrochene Akkorde im Warten-Modus.', 'gebrochen'),
      L('3/4-Takt: „1 – 2 – 3“, betont auf der 1 (Walzer-Gefühl). Amazing Grace beginnt mit einem Auftakt auf Schlag 3.', 'amazing', { mode: 'listen' }),
      U('Amazing Grace rechte Hand: Warten-Modus. Daumen startet auf G3, unter dem mittleren C.', 'amazing'),
      S('Amazing Grace spielen und singen.', 'amazing', { tempo: 70 })]],
    ['Melodie im Fluss', [
      A('Gebrochene Akkorde im Mitspielen-Modus.', 'gebrochen', { mode: 'play', tempo: 70 }),
      L('Bindebögen auf einer Silbe (Melisma): „maz-ing“ singst du über zwei Töne. Achtelnoten = halber Schlag.'),
      U('Amazing Grace rechts im Mitspielen-Modus bei 70 %.', 'amazing', { mode: 'play', tempo: 70 }),
      S('Amazing Grace singen, App spielt die Begleitung.', 'amazing-lh', { hand: 'right' })]],
    ['Singen & begleiten', [
      A('Moll-Akkorde.', 'akkorde-moll', { mode: 'play' }),
      L('Der Rollenwechsel: Jetzt singst du die Melodie und das Klavier begleitet nur. Schalte „Begleitung der anderen Hand“ aus, damit nur deine Stimme die Melodie trägt.'),
      U('Amazing Grace beidhändig, erst links allein, dann beide.', 'amazing-lh', { hand: 'left' }),
      S('Monatsziel: nur linke Hand spielen, Melodie singen.', 'amazing-lh', { hand: 'left', tempo: 70 })]],
  ]),
  W(9, 3, 'Pop-Pattern I–V–vi–IV', 'Ballade-Muster flüssig im Mitspielen-Modus ⭐⭐', [
    ['Die Pop-Akkordfolge', [
      A('Moll-Akkorde.', 'akkorde-moll'),
      L('C – G – Am – F (Stufen I – V – vi – IV) ist die Akkordfolge hunderter Popsongs. Wer sie beherrscht, kann sofort viele Lieder begleiten.', 'pop-1', { mode: 'listen' }),
      U('Pop-Pattern in ganzen Noten: Warten-Modus, dann Mitspielen.', 'pop-1'),
      S('Spiele das Pattern und singe einen Popsong, den du kennst, in C-Dur dazu.', 'pop-1', { mode: 'play', tempo: 60 })]],
    ['Rhythmus', [
      A('Pop-Pattern ganze Noten im Mitspielen-Modus.', 'pop-1', { mode: 'play' }),
      L('Groove entsteht durch gleichmäßige Anschläge. Rechts vier Viertel pro Takt, links nur auf der 1. Achte auf das Timing-Feedback.'),
      U('Pop-Pattern im Viertel-Rhythmus: Mitspielen bei 70 %.', 'pop-2', { mode: 'play', tempo: 70 }),
      S('Viertel-Rhythmus spielen und dazu singen.', 'pop-2', { mode: 'play', tempo: 70 })]],
    ['Ballade', [
      A('Gebrochene Akkorde.', 'gebrochen', { mode: 'play' }),
      L('Ballade-Muster: links Grundton – rechts Akkord – links Quinte – rechts Akkord. Klingt voll, lässt aber Platz für die Stimme.'),
      U('Ballade im Warten-Modus, dann Mitspielen. Ziel ⭐⭐', 'pop-ballade'),
      S('Ballade spielen und deinen Lieblingssong dazu singen.', 'pop-ballade', { mode: 'play', tempo: 70 })]],
  ]),
  W(10, 3, 'Lead Sheets spielen', 'Twinkle aus dem Lead Sheet beidhändig ≥ 90 %', [
    ['Was ist ein Lead Sheet?', [
      A('Pop-Pattern Viertel.', 'pop-2', { mode: 'play' }),
      L('Ein Lead Sheet zeigt nur Melodie und Akkordsymbole – so sehen die meisten Pop-Noten aus. Die linke Hand greift den Akkord, den das Symbol anzeigt.'),
      U('Twinkle Lead Sheet: Warten-Modus. Notenname zeigen hilft am Anfang.', 'twinkle-lead'),
      S('Nur linke Hand (Akkorde) spielen und Twinkle singen.', 'twinkle-lead', { hand: 'left' })]],
    ['Akkordsymbole lesen', [
      A('Moll-Akkorde.', 'akkorde-moll', { mode: 'play' }),
      L('Großbuchstabe = Dur (C, F, G), mit „m“ = Moll (Am, Dm, Em). Übe, jedes Symbol in unter 2 Sekunden zu greifen.'),
      U('When the Saints Lead Sheet beidhändig.', 'saints-lead'),
      S('Saints: links Akkorde, Melodie singen.', 'saints-lead', { hand: 'left' })]],
    ['Dein eigenes Lied', [
      A('Blattspiel beide Schlüssel.', 'blatt-beide'),
      L('Dein Lieblings-Popsong: Suche die Akkorde (z. B. auf einer Akkord-Seite) und wähle eine Version in C-Dur oder mit C, F, G, Am, Dm, Em.'),
      U('Spiele die Akkorde deines Songs im Ballade-Muster – zur Übung zuerst mit dem Pop-Pattern.', 'pop-ballade', { mode: 'play' }),
      S('Deinen Song singen und begleiten.', 'pop-ballade', { mode: 'play', tempo: 70 })]],
  ]),
  W(11, 3, 'Transponieren & Für Elise', 'Lied in eigener Gesangslage singen; Für Elise im Warten-Modus ≥ 80 %', [
    ['Deine Gesangslage', [
      A('Fünftonlage, um +2 Halbtöne transponiert (D-Dur) – beachte die schwarzen Tasten.', 'fuenfton', { transpose: 2 }),
      L('Transponieren = alles höher oder tiefer verschieben. Finde deinen tiefsten und höchsten angenehmen Ton. Probiere bei Amazing Grace −2 bis +3 Halbtöne, bis es bequem klingt.'),
      U('Amazing Grace beidhändig in deiner Tonart (Transponieren-Regler).', 'amazing-lh'),
      S('Amazing Grace in deiner Lage: links spielen, singen.', 'amazing-lh', { hand: 'left' })]],
    ['Für Elise', [
      A('Blattspiel C4 bis C5.', 'blatt-oktave'),
      L('a-Moll und das Kreuz: D♯ ist die schwarze Taste zwischen D und E. Für Elise erst anhören.', 'elise', { mode: 'listen' }),
      U('Für Elise rechte Hand im Warten-Modus, Stück für Stück.', 'elise', { hand: 'right' }),
      S('Amazing Grace oder Saints in deiner Lage singen.', 'saints-lead', { hand: 'left' })]],
    ['Pedal & Ausdruck', [
      A('Für Elise rechts.', 'elise', { hand: 'right' }),
      L('Haltepedal am E-Piano: Bei Für Elise nach jedem Basston kurz drücken, beim nächsten Basston wechseln. Klingt sofort weicher.'),
      U('Für Elise beidhändig: Warten-Modus, dann Mitspielen bei 60 %.', 'elise', { mode: 'play', tempo: 60 }),
      S('Dein Lieblingslied transponiert spielen und singen.', 'twinkle-lead')]],
  ]),
  W(12, 3, 'Abschluss-Stück', 'Ein Lied komplett spielen und singen ⭐⭐⭐', [
    ['Stück wählen', [
      A('Ballade-Muster.', 'pop-ballade', { mode: 'play' }),
      L('Wähle dein Abschluss-Stück: Amazing Grace beidhändig oder dein eigener Popsong. Lege Tonart und Tempo fest.'),
      U('Amazing Grace beidhändig im Warten-Modus, schwierige Stellen gezielt üben.', 'amazing-lh'),
      S('Abschluss-Stück spielen und singen.', 'amazing-lh', { hand: 'left' })]],
    ['Vorspiel-Training', [
      A('Für Elise.', 'elise', { mode: 'play', tempo: 70 }),
      L('Auftritts-Tipps: Fehler überspielen, Puls halten, Anfang und Schluss besonders sicher üben. Atme vor dem Einsatz.'),
      U('Abschluss-Stück im Mitspielen-Modus bei 80 %.', 'amazing-lh', { mode: 'play', tempo: 80 }),
      S('Komplett singen und spielen – mit dem Handy aufnehmen und anhören.', 'amazing-lh', { mode: 'play', tempo: 80 })]],
    ['Dein Konzert', [
      A('Lieblingsübung aus 12 Wochen.', 'kanon'),
      L('Rückblick: Schau dir deine Bestwerte an. Vergleiche mit Woche 1 – was du heute kannst!'),
      U('Abschluss: Mitspielen bei 100 %, Ziel ⭐⭐⭐.', 'amazing-lh', { mode: 'play' }),
      S('Dein Konzert: alle Lieblingsstücke spielen und singen. Herzlichen Glückwunsch!', 'saints-lead', { hand: 'left' })]],
  ]),
  W(13, 3, 'Achtel & Synkopen', 'Synkopen-Pattern im Mitspielen-Modus ⭐⭐', [
    ['Achtelnoten', [
      A('Achtel-Fünftonlage, erst rechts, dann beidhändig.', 'achtel'),
      L('Achtel = halber Schlag. Laut zählen: „1 und 2 und 3 und 4 und“. Der Fuß tippt nur auf die Zahlen.'),
      U('Achtel-Übung im Mitspielen-Modus: 60 % → 80 % → 100 %.', 'achtel', { mode: 'play', tempo: 60 }),
      S('Pop-Pattern spielen und einen Popsong dazu singen.', 'pop-2', { mode: 'play', tempo: 70 })]],
    ['Die Synkope', [
      A('Pop-Pattern Viertel.', 'pop-2', { mode: 'play' }),
      L('Synkope = Betonung zwischen den Schlägen. Das Muster 3+3+2 (Achtel) ist der Herzschlag vieler Popsongs. Erst klatschen, dann zuhören.', 'pop-synkope', { mode: 'listen' }),
      U('Synkopen-Pattern im Warten-Modus, dann Mitspielen bei 70 %.', 'pop-synkope', { mode: 'play', tempo: 70 }),
      S('Synkopen-Pattern spielen und singen – der Gesang bleibt entspannt, das Klavier groovt.', 'pop-synkope', { mode: 'play', tempo: 70 })]],
    ['Groove festigen', [
      A('Achtel beidhändig.', 'achtel', { mode: 'play' }),
      L('Timing-Feedback auswerten: Bist du eher zu früh? Dann bewusst „hinten“ spielen und dem Metronom folgen.'),
      U('Synkopen-Pattern bei 100 %. Ziel ⭐⭐', 'pop-synkope', { mode: 'play' }),
      S('Eigener Song im Synkopen-Groove.', 'pop-synkope', { mode: 'play', tempo: 80 })]],
  ]),
  W(14, 3, 'Neue Tonart: G-Dur', 'Ode in G-Dur beidhändig ≥ 90 %', [
    ['G-Lage', [
      A('Fünftonlage C zur Erinnerung.', 'fuenfton', { mode: 'play' }),
      L('G-Dur hat ein Vorzeichen: F♯. Die Akkorde heißen jetzt G – C – D (Stufen I – IV – V), genau wie C – F – G in C-Dur.'),
      U('G-Dur-Lage und Akkorde im Warten-Modus.', 'g-dur'),
      S('G-Akkorde spielen und den Grundton singen.', 'g-dur', { hand: 'left' })]],
    ['Transponieren in der Praxis', [
      A('G-Dur im Mitspielen-Modus.', 'g-dur', { mode: 'play', tempo: 70 }),
      L('Ode an die Freude in G-Dur: Der Transponieren-Regler steht auf −5. Die Fingersätze bleiben gleich – nur die Lage wandert.'),
      U('Ode beidhändig in G-Dur.', 'ode-lh', { transpose: -5 }),
      S('Ode in G-Dur singen – passt diese Lage besser zu deiner Stimme?', 'ode-lh', { transpose: -5, hand: 'right' })]],
    ['Tonart wählen', [
      A('Blattspiel beide Schlüssel.', 'blatt-beide'),
      L('Wähle für jedes Lied die Tonart, in der du am besten singst. Merke dir den Transponier-Wert.'),
      U('Amazing Grace in deiner Tonart beidhändig im Mitspielen-Modus.', 'amazing-lh', { mode: 'play', tempo: 80 }),
      S('Amazing Grace: links spielen, singen.', 'amazing-lh', { hand: 'left' })]],
  ]),
  W(15, 3, 'Arpeggio-Begleitung', 'Arpeggio flüssig im Mitspielen-Modus ⭐⭐', [
    ['Die Hand öffnen', [
      A('Gebrochene Akkorde.', 'gebrochen', { mode: 'play' }),
      L('Arpeggio über eine Oktave: Grundton (5) – Quinte (2) – Oktave (1) – Quinte (2). Die Hand spannt sich wie ein Fächer.', 'arpeggio', { mode: 'listen' }),
      U('Arpeggio im Warten-Modus, Takt für Takt.', 'arpeggio'),
      S('Langsam arpeggieren und eine ruhige Melodie summen.', 'arpeggio', { mode: 'play', tempo: 50 })]],
    ['Fließen lassen', [
      A('Achtel-Übung.', 'achtel', { mode: 'play' }),
      L('Haltepedal: bei jedem Akkordwechsel treten, kurz lösen, wieder treten („Pedal nach dem Anschlag“). So verschwimmt nichts.'),
      U('Arpeggio im Mitspielen-Modus bei 70 % mit Pedal.', 'arpeggio', { mode: 'play', tempo: 70 }),
      S('Arpeggio spielen und einen Popsong in C singen.', 'arpeggio', { mode: 'play', tempo: 70 })]],
    ['Ballade gestalten', [
      A('Ballade-Muster.', 'pop-ballade', { mode: 'play' }),
      L('Strophe ruhig (Arpeggio), Refrain kräftiger (Synkopen-Pattern): so entsteht ein Arrangement.'),
      U('Abwechselnd 2× Arpeggio, 2× Synkope – deine erste eigene Begleitung.', 'arpeggio', { mode: 'play', tempo: 80 }),
      S('Dein Song: Strophe mit Arpeggio, Refrain mit Synkope.', 'pop-synkope', { mode: 'play', tempo: 80 })]],
  ]),
  W(16, 3, 'Improvisation & eigene Begleitung', 'Eigenes Lied mit selbst gewähltem Begleitmuster', [
    ['Improvisieren', [
      A('Kanon-Akkordfolge.', 'kanon', { mode: 'play' }),
      L('Über C – G – Am – F passt jeder Ton der C-Dur-Tonleiter (nur weiße Tasten). Spiel links die Akkorde und erfinde rechts eine Melodie.'),
      U('Kanon: App spielt die rechte Hand, du improvisierst mit den Grundtönen links.', 'kanon', { hand: 'left', mode: 'play', tempo: 70 }),
      S('Eine eigene Melodie zur Kanon-Folge singen.', 'kanon', { mode: 'listen' })]],
    ['Für Elise beidhändig', [
      A('Arpeggio.', 'arpeggio', { mode: 'play' }),
      L('Für Elise mit Pedal und Dynamik: leise beginnen, beim Bass-Ton Pedal wechseln.'),
      U('Für Elise beidhändig im Mitspielen-Modus bei 80 %.', 'elise', { mode: 'play', tempo: 80 }),
      S('Lieblingslied in deiner Tonart.', 'amazing-lh', { hand: 'left' })]],
    ['Arrangement', [
      A('Synkopen-Pattern.', 'pop-synkope', { mode: 'play' }),
      L('Wähle für dein Abschluss-Lied: Tonart, Begleitmuster für Strophe und Refrain, Tempo.'),
      U('Dein Arrangement üben – Lead Sheet als Vorlage.', 'saints-lead', { mode: 'play', tempo: 90 }),
      S('Komplettes Lied spielen und singen.', 'saints-lead', { hand: 'left' })]],
  ]),
];

export const LEVELS = [
  { n: 1, name: 'Einsteiger', desc: 'Noch nie oder kaum gespielt' },
  { n: 2, name: 'Grundkenntnisse', desc: 'Einfache Melodien, etwas beidhändig' },
  { n: 3, name: 'Fortgeschrittener Anfänger', desc: 'Beidhändig mit Akkorden, beide Notenschlüssel' },
  { n: 4, name: 'Mittelstufe', desc: 'Lieder begleiten, mehr Tempo & Sicherheit' },
  { n: 5, name: 'Fortgeschritten', desc: 'Sicher vom Blatt, Repertoire & Ausdruck' },
];
const ORDER: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  2: [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 12],
  3: [5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 12],
  4: [5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 12],
  5: [5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 12],
};
export const MONTH_NAMES: Record<number, string[]> = {
  1: ['Grundlagen', 'Beide Hände', 'Liedbegleitung'],
  2: ['Akkorde & beide Hände', 'Moll, Begleitmuster & Pop', 'Lead Sheets, Groove & Tonarten'],
  3: ['Beide Hände & Moll', 'Begleitmuster & Pop', 'Groove, Tonarten & Arrangement'],
  4: ['Beide Hände & Moll – intensiv', 'Begleitmuster & Pop – intensiv', 'Groove & Arrangement – intensiv'],
  5: ['Beide Hände & Moll – Profi', 'Begleitmuster & Pop – Profi', 'Groove & Arrangement – Profi'],
};
const TEMPO = [0.85, 1, 1, 1.1, 1.2];
const NOTE = ['', '', '', ' · Level 4: immer beidhändig im Mitspielen-Modus, Tempo +10 %', ' · Level 5: beidhändig, Mitspielen, ohne Notennamen, Tempo +20 %'];

function adapt(b: Block, level: number): Block {
  const o = { ...b };
  if (!b.song || b.mode === 'listen') return o;
  const song = songById(b.song);
  const both = !!song && song.notes.some(n => n.lh.length) && song.notes.some(n => n.rh.length);
  if (level >= 4 && b.kind !== 'Singen' && both && b.hand && b.hand !== 'both') o.hand = 'both';
  if (level >= 4 && b.kind !== 'Lernen' && (b.mode ?? 'wait') === 'wait' && !song?.gen) o.mode = 'play';
  if (level === 5) o.hints = false;
  if (o.mode === 'play') o.tempo = Math.max(40, Math.min(120, Math.round((b.tempo ?? 100) * TEMPO[level - 1] / 5) * 5));
  return o;
}

export function planFor(level: number): Week[] {
  return ORDER[level].map((stage, i) => {
    const w = STAGES.find(x => x.n === stage)!;
    return { ...w, n: i + 1, month: Math.floor(i / 4) + 1, goal: w.goal + NOTE[level - 1],
      sessions: w.sessions.map(s => ({ ...s, blocks: s.blocks.map(b => adapt(b, level)) })) };
  });
}

