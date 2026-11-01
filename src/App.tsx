import { useEffect, useState } from 'react';
import { SONGS, type Song } from './songs';
import { WEEKS, type Session } from './plan';
import { Practice } from './components/Practice';
import { initMidi, midiSupported, getAccess, emit, onMidi } from './midi';
import { setMidiOut, playNote } from './audio';
import { store } from './store';
import { noteName } from './components/Keyboard';

const KEYMAP: Record<string, number> = { a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, z: 68, h: 69, u: 70, j: 71, k: 72 };
type View = { kind: 'home' } | { kind: 'song'; song: Song } | { kind: 'session'; s: Session } | { kind: 'midi' };

export default function App() {
  const [view, setView] = useState<View>({ kind: 'home' });
  const [devices, setDevices] = useState<{ ins: string[]; outs: MIDIOutput[] }>({ ins: [], outs: [] });
  const [outId, setOutId] = useState('');
  const [midiErr, setMidiErr] = useState('');
  const [lastKey, setLastKey] = useState<number | null>(null);
  const [data, setData] = useState(store.get());

  const refresh = () => {
    const a = getAccess(); if (!a) return;
    setDevices({ ins: [...a.inputs.values()].map(i => i.name ?? 'MIDI-Gerät'), outs: [...a.outputs.values()] });
  };
  const connect = () => initMidi(refresh).catch(e => setMidiErr(String(e?.message ?? e)));
  useEffect(() => { if (midiSupported()) connect(); }, []);
  useEffect(() => setMidiOut(devices.outs.find(o => o.id === outId) ?? null), [outId, devices]);
  useEffect(() => onMidi((m, on) => on && setLastKey(m)), []);

  useEffect(() => {
    const down = new Set<string>();
    const kd = (e: KeyboardEvent) => { const m = KEYMAP[e.key.toLowerCase()]; if (m && !down.has(e.key) && !e.repeat) { down.add(e.key); playNote(m, 0.5); emit(m, true); } };
    const ku = (e: KeyboardEvent) => { const m = KEYMAP[e.key.toLowerCase()]; if (m) { down.delete(e.key); emit(m, false); } };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  const toggleDone = (id: string) => setData(store.update(d => { d.done[id] = !d.done[id]; }));
  const connected = devices.ins.length > 0;

  return (
    <div className="app">
      <header>
        <h1 onClick={() => setView({ kind: 'home' })}>🎹 Klavier-Trainer</h1>
        <button className={'pill ' + (connected ? 'on' : '')} onClick={() => setView({ kind: 'midi' })}>
          {connected ? `● ${devices.ins[0]}` : '○ E-Piano verbinden'}
        </button>
      </header>

      <main>
        {view.kind === 'song' && <Practice song={view.song} onBack={() => { setData(store.get()); setView({ kind: 'home' }); }} />}

        {view.kind === 'midi' && (
          <section className="card">
            <h2>E-Piano verbinden</h2>
            {!midiSupported() ? <p className="warn">Dieser Browser unterstützt kein Web MIDI. Bitte Chrome oder Edge verwenden.</p> : <>
              <ol className="steps">
                <li>E-Piano per USB-Kabel (oder Bluetooth-MIDI) mit dem Computer verbinden und einschalten.</li>
                <li>Auf „Suchen“ tippen und den MIDI-Zugriff im Browser erlauben.</li>
                <li>Eine Taste drücken – sie erscheint unten.</li>
              </ol>
              <button onClick={connect}>Geräte suchen</button>
              {midiErr && <p className="warn">{midiErr}</p>}
              <p><strong>Eingänge:</strong> {devices.ins.join(', ') || 'keine gefunden'}</p>
              <p><strong>Letzte Taste:</strong> {lastKey !== null ? noteName(lastKey) : '–'}</p>
              <label className="block">Töne der App abspielen über:
                <select value={outId} onChange={e => setOutId(e.target.value)}>
                  <option value="">Lautsprecher des Geräts</option>
                  {devices.outs.map(o => <option key={o.id} value={o.id}>E-Piano: {o.name}</option>)}
                </select>
              </label>
              <button className="ghost" onClick={() => playNote(60)}>Testton C</button>
            </>}
            <p><button className="ghost" onClick={() => setView({ kind: 'home' })}>← Zurück</button></p>
          </section>
        )}

        {view.kind === 'session' && (
          <section className="card">
            <button className="ghost" onClick={() => setView({ kind: 'home' })}>← Zurück</button>
            <h2>{view.s.title}</h2>
            <p className="muted">60 Minuten, in vier Blöcken</p>
            {view.s.blocks.map((b, k) => {
              const song = SONGS.find(s => s.id === b.songId);
              return (
                <div className="block-item" key={k}>
                  <span className="min">{b.min}′</span>
                  <div><p>{b.text}</p>{song && <button onClick={() => setView({ kind: 'song', song })}>Üben: {song.title}</button>}</div>
                </div>
              );
            })}
            <button className={data.done[view.s.id] ? 'ghost' : ''} onClick={() => toggleDone(view.s.id)}>
              {data.done[view.s.id] ? '✓ Erledigt (rückgängig)' : 'Einheit als erledigt markieren'}
            </button>
          </section>
        )}

        {view.kind === 'home' && <>
          <section className="card">
            <h2>Dein 12-Wochen-Plan</h2>
            <p className="muted">3 Einheiten × 60 Minuten pro Woche</p>
            {[1, 2, 3].map(mo => (
              <div key={mo}>
                <h3>Monat {mo} – {['Grundlagen', 'Beide Hände', 'Liedbegleitung'][mo - 1]}</h3>
                {WEEKS.filter(w => w.month === mo).map(w => (
                  <details key={w.n} open={w.n === 1} className="week">
                    <summary>
                      <span>Woche {w.n}: {w.title}</span>
                      {w.sessions && <span className="badge">{w.sessions.filter(s => data.done[s.id]).length}/{w.sessions.length}</span>}
                    </summary>
                    <p className="muted">Ziel: {w.goal}</p>
                    {w.sessions ? w.sessions.map(s => (
                      <button key={s.id} className={'session ' + (data.done[s.id] ? 'done' : '')} onClick={() => setView({ kind: 'session', s })}>
                        {data.done[s.id] ? '✓ ' : ''}{s.title}
                      </button>
                    )) : <p className="muted small">Einheiten folgen im nächsten Ausbauschritt.</p>}
                  </details>
                ))}
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Lieder</h2>
            <div className="songs">
              {SONGS.map(s => (
                <button key={s.id} className="song" onClick={() => setView({ kind: 'song', song: s })}>
                  <strong>{s.title}</strong>
                  <span className="muted small">Stufe {s.level}{data.best[s.id] !== undefined ? ` · Bestwert ${data.best[s.id]} %` : ''}</span>
                </button>
              ))}
            </div>
          </section>
        </>}
      </main>
    </div>
  );
}
