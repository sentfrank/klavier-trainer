import { useEffect, useMemo, useRef, useState } from 'react';
import type { Song } from '../songs';
import { Staff } from './Staff';
import { Keyboard, noteName } from './Keyboard';
import { onMidi, emit } from '../midi';
import { playNote } from '../audio';
import { store } from '../store';

type Mode = 'wait' | 'listen';
export function Practice({ song, onBack }: { song: Song; onBack: () => void }) {
  const [mode, setMode] = useState<Mode>('wait');
  const [i, setI] = useState(0);
  const [status, setStatus] = useState<('ok' | 'bad' | null)[]>([]);
  const [errors, setErrors] = useState(0);
  const [pressed, setPressed] = useState<Record<number, 'ok' | 'bad' | 'on'>>({});
  const [tempo, setTempo] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const stopRef = useRef(false);
  const done = i >= song.notes.length;
  const cur = song.notes[i];
  const fingers = useMemo(() => (cur?.finger ? { [cur.midi]: cur.finger } : {}), [cur]);
  const hadError = useRef(false);

  const reset = () => { setI(0); setStatus([]); setErrors(0); hadError.current = false; };
  useEffect(reset, [song.id]);

  useEffect(() => onMidi((m, on) => {
    if (!on) { setPressed(p => { const n = { ...p }; delete n[m]; return n; }); return; }
    if (mode !== 'wait' || playing) { setPressed(p => ({ ...p, [m]: 'on' })); return; }
    setI(idx => {
      const target = song.notes[idx];
      if (!target) return idx;
      if (m === target.midi) {
        setPressed(p => ({ ...p, [m]: 'ok' }));
        setStatus(s => { const n = [...s]; n[idx] = hadError.current ? 'bad' : 'ok'; return n; });
        hadError.current = false;
        return idx + 1;
      }
      hadError.current = true;
      setErrors(e => e + 1);
      setPressed(p => ({ ...p, [m]: 'bad' }));
      return idx;
    });
  }), [mode, playing, song]);

  useEffect(() => {
    if (!done || mode !== 'wait' || song.notes.length === 0) return;
    const okCount = status.filter(s => s === 'ok').length;
    const acc = Math.round((okCount / song.notes.length) * 100);
    store.update(d => { d.best[song.id] = Math.max(d.best[song.id] ?? 0, acc); });
  }, [done]);

  async function listen() {
    setPlaying(true); stopRef.current = false; setI(0);
    const beat = 60 / (song.tempo * tempo / 100);
    for (let k = 0; k < song.notes.length; k++) {
      if (stopRef.current) break;
      const n = song.notes[k]; setI(k);
      playNote(n.midi, n.beats * beat * 0.95);
      await new Promise(r => setTimeout(r, n.beats * beat * 1000));
    }
    setPlaying(false); setI(0);
  }

  const okCount = status.filter(s => s === 'ok').length;
  const acc = song.notes.length ? Math.round((okCount / song.notes.length) * 100) : 0;
  return (
    <div className="practice">
      <div className="row between">
        <button className="ghost" onClick={onBack}>← Zurück</button>
        <div className="seg">
          <button className={mode === 'wait' ? 'active' : ''} onClick={() => { setMode('wait'); reset(); }}>Warten-Modus</button>
          <button className={mode === 'listen' ? 'active' : ''} onClick={() => { setMode('listen'); reset(); }}>Zuhören</button>
        </div>
      </div>
      <h2>{song.title}</h2>
      <p className="muted">{song.info}</p>

      <Staff notes={song.notes} index={done ? -1 : i} status={status} />

      {mode === 'wait' && (done ? (
        <div className="result">
          <strong>{acc} % fehlerfrei</strong> · {errors} falsche Tasten
          <p className="muted">{acc >= 90 ? 'Sehr gut! Jetzt mit Gesang probieren.' : 'Noch einmal – langsam und genau ist schneller als schnell und falsch.'}</p>
          <button onClick={reset}>Nochmal</button>
        </div>
      ) : (
        <div className="row between status">
          <span>Nächste Note: <strong>{showHint && cur ? noteName(cur.midi) : '?'}</strong>{cur?.finger ? ` · Finger ${cur.finger}` : ''}</span>
          <span>Fehler: {errors} · {i}/{song.notes.length}</span>
          <label className="check"><input type="checkbox" checked={showHint} onChange={e => setShowHint(e.target.checked)} /> Notenname zeigen</label>
          <button className="ghost" onClick={() => cur && playNote(cur.midi)}>Ton hören</button>
        </div>
      ))}
      {mode === 'listen' && (
        <div className="row status">
          {playing ? <button onClick={() => { stopRef.current = true; }}>Stopp</button> : <button onClick={listen}>▶ Abspielen</button>}
          <label>Tempo {tempo} %<input type="range" min={40} max={120} step={5} value={tempo} onChange={e => setTempo(+e.target.value)} /></label>
        </div>
      )}

      <Keyboard target={!done && cur ? [cur.midi] : []} pressed={pressed} fingers={fingers}
        onPress={m => { playNote(m, 0.5); emit(m, true); setTimeout(() => emit(m, false), 250); }} />
      <p className="muted small">Spiele auf deinem E-Piano. Ohne E-Piano: Tasten antippen oder Computertastatur (A S D F G H J K = C bis C).</p>
    </div>
  );
}
