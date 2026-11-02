import { useEffect, useMemo, useRef, useState } from 'react';
import type { Note, Song } from '../songs';
import { Staff } from './Staff';
import { Keyboard, noteName } from './Keyboard';
import { onMidi, emit } from '../midi';
import { playNote, playClick } from '../audio';
import { store } from '../store';

export type Mode = 'wait' | 'play' | 'listen';
export type Hand = 'both' | 'right' | 'left';
export type PracticeOpts = { mode?: Mode; hand?: Hand; tempo?: number; transpose?: number; hints?: boolean };
type St = 'ok' | 'bad' | null;
type Step = Note & { mine: number[]; other: number[]; start: number };
const TOL = 0.45;
export const starsFor = (acc: number) => (acc >= 95 ? 3 : acc >= 80 ? 2 : acc >= 60 ? 1 : 0);
const nextPlayable = (st: Step[], from: number) => { let j = from; while (j < st.length && st[j].mine.length === 0) j++; return j; };
const MODES: [Mode, string][] = [['wait', 'Warten'], ['play', 'Mitspielen'], ['listen', 'Zuhören']];
const HANDS: [Hand, string][] = [['both', 'Beide'], ['right', 'Rechts'], ['left', 'Links']];

export function Practice({ song, opts = {}, onBack }: { song: Song; opts?: PracticeOpts; onBack: () => void }) {
  const [notes, setNotes] = useState<Note[]>(() => (song.gen ? song.gen() : song.notes));
  const [mode, setMode] = useState<Mode>(opts.mode ?? 'wait');
  const hasL = notes.some(n => n.lh.length), hasR = notes.some(n => n.rh.length);
  const [hand, setHand] = useState<Hand>(opts.hand ?? 'both');
  const [tempo, setTempo] = useState(opts.tempo ?? 100);
  const [transpose, setTranspose] = useState(opts.transpose ?? 0);
  const [accomp, setAccomp] = useState(true);
  const [metro, setMetro] = useState(true);
  const [showHint, setShowHint] = useState(opts.hints ?? true);
  const [i, setI] = useState(0);
  const [status, setStatus] = useState<St[]>([]);
  const [errors, setErrors] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [timing, setTiming] = useState('');
  const [pressed, setPressed] = useState<Record<number, 'ok' | 'bad' | 'on'>>({});

  const steps: Step[] = useMemo(() => {
    let t = 0;
    return notes.map(n => {
      const rh = n.rh.map(k => k + transpose), lh = n.lh.map(k => k + transpose);
      const mine = hand === 'both' ? [...rh, ...lh] : hand === 'right' ? rh : lh;
      const other = hand === 'both' ? [] : hand === 'right' ? lh : rh;
      const s = { ...n, rh, lh, mine, other, start: t }; t += n.beats; return s;
    });
  }, [notes, hand, transpose]);
  const total = steps.reduce((a, s) => a + s.beats, 0);
  const beatSec = 60 / (song.tempo * tempo / 100);
  const bpb = song.bpb ?? 4, pickup = song.pickup ?? 0;

  const L = useRef({ mode, steps, beatSec, accomp, metro, running, total });
  L.current = { mode, steps, beatSec, accomp, metro, running, total };
  const R = useRef({ i: 0, hit: new Set<number>(), err: false, t0: 0, timer: 0 as unknown as ReturnType<typeof setInterval>,
    judged: new Set<number>(), started: new Set<number>(), hits: new Map<number, Set<number>>(), lastBeat: -99, status: [] as St[] });

  function stop() { clearInterval(R.current.timer); setRunning(false); L.current.running = false; }
  function reset() {
    stop();
    const r = R.current;
    Object.assign(r, { hit: new Set(), err: false, status: [], judged: new Set(), started: new Set(), hits: new Map(), lastBeat: -99 });
    setStatus([]); setErrors(0); setResult(null); setTiming('');
    const j = L.current.mode === 'wait' ? nextPlayable(L.current.steps, 0) : 0; r.i = j; setI(j);
  }
  useEffect(() => { reset(); return stop; }, [mode, hand, transpose, notes]);

  function finish() {
    const { steps: st, mode: md } = L.current, r = R.current;
    stop();
    if (md === 'listen') { r.i = 0; setI(0); return; }
    const playable = st.map((_, k) => k).filter(k => st[k].mine.length > 0);
    const ok = playable.filter(k => r.status[k] === 'ok').length;
    const acc = playable.length ? Math.round(ok / playable.length * 100) : 0;
    setResult(acc); r.i = st.length; setI(st.length);
    store.update(d => { d.best[song.id] = Math.max(d.best[song.id] ?? 0, acc); });
  }

  function tick() {
    const { steps: st, beatSec: bs, mode: md, accomp: ac, metro: me, total: tot } = L.current, r = R.current;
    const beat = (performance.now() - r.t0) / 1000 / bs;
    const fb = Math.floor(beat);
    if (me && md === 'play' && fb > r.lastBeat && beat < tot) {
      r.lastBeat = fb; const pos = (((fb + bpb - pickup) % bpb) + bpb) % bpb; playClick(pos === 0);
    }
    for (let k = 0; k < st.length; k++) {
      const s = st[k];
      if (!r.started.has(k) && beat >= s.start) {
        r.started.add(k); r.i = k; setI(k);
        const dur = s.beats * bs * 0.95;
        if (md === 'listen') [...s.rh, ...s.lh].forEach(m => playNote(m, dur));
        else if (ac) s.other.forEach(m => playNote(m, dur, 0.6));
      }
      if (md === 'play' && !r.judged.has(k) && beat > s.start + TOL) {
        r.judged.add(k);
        if (s.mine.length) { const h = r.hits.get(k); r.status[k] = h && s.mine.every(m => h.has(m)) ? 'ok' : 'bad'; setStatus([...r.status]); }
      }
    }
    if (beat > tot + 0.6) finish();
  }

  function start() {
    reset();
    const count = L.current.mode === 'play' ? bpb : 0;
    R.current.t0 = performance.now() + count * beatSec * 1000 + 150;
    R.current.started = new Set();
    setRunning(true); L.current.running = true;
    R.current.timer = setInterval(tick, 15);
  }

  useEffect(() => onMidi((m, on) => {
    if (!on) { setPressed(p => { const n = { ...p }; delete n[m]; return n; }); return; }
    const { mode: md, steps: st, beatSec: bs, accomp: ac, running: run } = L.current, r = R.current;
    const mark = (v: 'ok' | 'bad' | 'on') => setPressed(p => ({ ...p, [m]: v }));
    if (md === 'listen' || (md === 'play' && !run)) { mark('on'); return; }
    if (md === 'wait') {
      const s = st[r.i]; if (!s) { mark('on'); return; }
      if (s.mine.includes(m)) {
        r.hit.add(m); mark('ok');
        if (s.mine.every(k => r.hit.has(k))) {
          r.status[r.i] = r.err ? 'bad' : 'ok'; setStatus([...r.status]);
          if (ac) s.other.forEach(k => playNote(k, s.beats * bs, 0.6));
          r.err = false; r.hit = new Set();
          const j = nextPlayable(st, r.i + 1); r.i = j; setI(j);
          if (j >= st.length) finish();
        }
      } else { r.err = true; setErrors(e => e + 1); mark('bad'); }
      return;
    }
    const beat = (performance.now() - r.t0) / 1000 / bs;
    let best = -1, dist = 9;
    st.forEach((s, k) => { if (r.judged.has(k) || !s.mine.includes(m)) return; const d = Math.abs(beat - s.start); if (d <= TOL && d < dist) { best = k; dist = d; } });
    if (best < 0) { setErrors(e => e + 1); mark('bad'); return; }
    if (!r.hits.has(best)) r.hits.set(best, new Set());
    r.hits.get(best)!.add(m);
    const off = beat - st[best].start;
    setTiming(Math.abs(off) < 0.15 ? '✓ pünktlich' : off < 0 ? '↶ etwas zu früh' : '↷ etwas zu spät');
    mark('ok');
  }), []);

  const done = result !== null;
  const cur = steps[i];
  const target = !done && cur && mode !== 'listen' ? cur.mine : [];
  const fingers = cur?.finger && target.length === 1 ? { [target[0]]: cur.finger } : {};
  const nStars = done ? starsFor(result!) : 0;
  const lo = Math.min(48, ...steps.flatMap(s => [...s.rh, ...s.lh]).map(m => m - (m % 12)));
  const hi = Math.max(84, ...steps.flatMap(s => [...s.rh, ...s.lh]).map(m => m - (m % 12) + 12));

  return (
    <div className="practice">
      <div className="row between">
        <button className="ghost" onClick={onBack}>← Zurück</button>
        <div className="seg">{MODES.map(([k, l]) => <button key={k} className={mode === k ? 'active' : ''} onClick={() => setMode(k)}>{l}</button>)}</div>
      </div>
      <h2>{song.title}</h2>
      <p className="muted">{song.info}</p>

      <div className="controls">
        {hasL && hasR && <div className="seg small">{HANDS.map(([k, l]) => <button key={k} className={hand === k ? 'active' : ''} onClick={() => setHand(k)}>{l}</button>)}</div>}
        {mode !== 'wait' && <label>Tempo {tempo} %<input type="range" min={40} max={120} step={5} value={tempo} onChange={e => setTempo(+e.target.value)} disabled={running} /></label>}
        <span className="transpose">Transponieren
          <button className="ghost mini" onClick={() => setTranspose(t => Math.max(-6, t - 1))}>−</button>
          <strong>{transpose > 0 ? '+' : ''}{transpose}</strong>
          <button className="ghost mini" onClick={() => setTranspose(t => Math.min(6, t + 1))}>+</button>
        </span>
        {hand !== 'both' && <label className="check"><input type="checkbox" checked={accomp} onChange={e => setAccomp(e.target.checked)} /> Andere Hand spielt die App</label>}
        {mode === 'play' && <label className="check"><input type="checkbox" checked={metro} onChange={e => setMetro(e.target.checked)} /> Metronom</label>}
        {mode === 'wait' && <label className="check"><input type="checkbox" checked={showHint} onChange={e => setShowHint(e.target.checked)} /> Notenname zeigen</label>}
      </div>

      <Staff notes={steps} index={done ? -1 : i} status={status} lead={song.lead} />

      {done ? (
        <div className="result">
          <div className="stars" aria-label={`${nStars} von 3 Sternen`}>{[1, 2, 3].map(k => <span key={k} className={k <= nStars ? 'on' : ''}>★</span>)}</div>
          <strong>{result} % richtig</strong> · {errors} falsche Tasten
          <p className="muted">{nStars === 3 ? 'Perfekt! Nächster Schritt: Tempo erhöhen oder dazu singen.' : nStars === 2 ? 'Sehr gut! Noch ein Durchgang für den dritten Stern?' : 'Übe die roten Stellen langsam im Warten-Modus – langsam und richtig ist schneller als schnell und falsch.'}</p>
          <div className="row center">
            <button onClick={() => (mode === 'wait' ? reset() : start())}>Nochmal</button>
            {song.gen && <button className="ghost" onClick={() => setNotes(song.gen!())}>Neue Noten</button>}
          </div>
        </div>
      ) : mode === 'wait' ? (
        <div className="row between status">
          <span>Nächste: <strong>{showHint && cur ? cur.mine.map(noteName).join(' + ') : '?'}</strong>{cur?.finger ? ` · Finger ${cur.finger}` : ''}</span>
          <span>Fehler: {errors}</span>
          <button className="ghost" onClick={() => cur?.mine.forEach(m => playNote(m))}>Ton hören</button>
          {song.gen && <button className="ghost" onClick={() => setNotes(song.gen!())}>Neue Noten</button>}
        </div>
      ) : (
        <div className="row status">
          {running ? <button onClick={stop}>■ Stopp</button> : <button onClick={start}>▶ {mode === 'play' ? 'Start (mit Einzählen)' : 'Abspielen'}</button>}
          {mode === 'play' && <span className="timing">{timing}</span>}
          {mode === 'play' && <span>Fehler: {errors}</span>}
        </div>
      )}

      <Keyboard from={lo} to={hi} target={target} pressed={pressed} fingers={fingers}
        onPress={m => { playNote(m, 0.5); emit(m, true); setTimeout(() => emit(m, false), 200); }} />
      <p className="muted small">Spiele auf deinem E-Piano. Ohne E-Piano: Tasten antippen oder Computertastatur (A W S E D F T G Z H U J K = C bis C).</p>
    </div>
  );
}
