import { useEffect, useState } from 'react';
import { SONGS, songById, type Song } from './songs';
import { WEEKS, MONTHS, type Session, type Block } from './plan';
import { Practice, starsFor, type PracticeOpts } from './components/Practice';
import { initMidi, midiSupported, getAccess, emit, onMidi } from './midi';
import { setMidiOut, playNote } from './audio';
import { store } from './store';
import { noteName } from './components/Keyboard';

const KEYMAP: Record<string, number> = { a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, z: 68, h: 69, u: 70, j: 71, k: 72 };
const optsOf = (b: Block): PracticeOpts => ({ mode: b.mode, hand: b.hand, tempo: b.tempo, transpose: b.transpose });
const label = (b: Block) => [({ wait: 'Warten', play: 'Mitspielen', listen: 'Zuhören' } as const)[b.mode ?? 'wait'],
  b.hand && b.hand !== 'both' ? (b.hand === 'right' ? 'rechte Hand' : 'linke Hand') : '', b.tempo ? `${b.tempo} %` : '',
  b.transpose ? `${b.transpose > 0 ? '+' : ''}${b.transpose} HT` : ''].filter(Boolean).join(', ');
type View = { kind: 'home' } | { kind: 'song'; song: Song; opts?: PracticeOpts; back?: View } | { kind: 'session'; s: Session } | { kind: 'midi' };

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
  const allSessions = WEEKS.flatMap(w => w.sessions);
  const doneCount = allSessions.filter(x => data.done[x.id]).length;
  const nextSession = allSessions.find(x => !data.done[x.id]);

  return (
    <div className="app">
      <header>
        <h1 onClick={() => setView({ kind: 'home' })}>🎹 Klavier-Trainer</h1>
        <button className={'pill ' + (connected ? 'on' : '')} onClick={() => setView({ kind: 'midi' })}>
          {connected ? `● ${devices.ins[0]}` : '○ E-Piano verbinden'}
        </button>
      </header>

      <main>
        {view.kind === 'song' && <Practice key={view.song.id + JSON.stringify(view.opts ?? {})} song={view.song} opts={view.opts} onBack={() => { setData(store.get()); setView(view.back ?? { kind: 'home' }); }} />}

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

        {view.kind === 'session' && (() => { const sv = view; return (
          <section className="card">
            <button className="ghost" onClick={() => setView({ kind: 'home' })}>← Zurück</button>
            <h2>{sv.s.title}</h2>
            <p className="muted">60 Minuten · Aufwärmen → Lernen → Üben → Singen</p>
            {sv.s.blocks.map((b, k) => {
              const song = b.song ? songById(b.song) : undefined;
              return (
                <div className="block-item" key={k}>
                  <span className={'kind k' + k}>{b.kind}<br /><small>{b.min} Min</small></span>
                  <div><p>{b.text}</p>{song && <button onClick={() => setView({ kind: 'song', song, opts: optsOf(b), back: sv })}>▶ {song.title} · {label(b)}</button>}</div>
                </div>
              );
            })}
            <button className={data.done[sv.s.id] ? 'ghost' : ''} onClick={() => toggleDone(sv.s.id)}>
              {data.done[sv.s.id] ? '✓ Erledigt (rückgängig)' : 'Einheit als erledigt markieren'}
            </button>
          </section>); })()}

        {view.kind === 'home' && <>
          <section className="card hero">
            <div>
              <h2>Weiter üben</h2>
              <p className="muted">{doneCount} von {allSessions.length} Einheiten · {doneCount} h von {allSessions.length} h</p>
              <div className="bar"><span style={{ width: `${doneCount / allSessions.length * 100}%` }} /></div>
            </div>
            {nextSession ? <button onClick={() => setView({ kind: 'session', s: nextSession })}>▶ {nextSession.title.replace(/^Einheit \d – /, '')} (Woche {nextSession.id.match(/w(\d+)/)![1]})</button> : <strong>🎉 Plan abgeschlossen!</strong>}
          </section>

          <section className="card">
            <h2>Dein 12-Wochen-Plan</h2>
            <p className="muted">3 Einheiten × 60 Minuten pro Woche</p>
            {[1, 2, 3].map(mo => (
              <div key={mo}>
                <h3>Monat {mo} – {MONTHS[mo - 1]}</h3>
                {WEEKS.filter(w => w.month === mo).map(w => {
                  const d = w.sessions.filter(x => data.done[x.id]).length;
                  return (
                    <details key={w.n} open={nextSession?.id.startsWith(`w${w.n}s`)} className="week">
                      <summary><span>Woche {w.n}: {w.title}</span><span className={'badge ' + (d === 3 ? 'full' : '')}>{d}/3</span></summary>
                      <p className="muted">🎯 Wochenziel: {w.goal}</p>
                      {w.sessions.map(x => (
                        <button key={x.id} className={'session ' + (data.done[x.id] ? 'done' : '')} onClick={() => setView({ kind: 'session', s: x })}>
                          {data.done[x.id] ? '✓ ' : ''}{x.title}
                        </button>
                      ))}
                    </details>
                  );
                })}
              </div>
            ))}
          </section>

          {([['lied', 'Lieder'], ['uebung', 'Übungen & Akkorde'], ['blatt', 'Blattspiel-Training']] as const).map(([cat, t]) => (
            <section className="card" key={cat}>
              <h2>{t}</h2>
              <div className="songs">
                {SONGS.filter(s => s.cat === cat).map(s => {
                  const b = data.best[s.id];
                  return (
                    <button key={s.id} className="song" onClick={() => setView({ kind: 'song', song: s })}>
                      <strong>{s.title}</strong>
                      <span className="muted small">Stufe {s.level}{b !== undefined ? ` · ${'★'.repeat(starsFor(b))}${'☆'.repeat(3 - starsFor(b))} ${b} %` : ''}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </>}
      </main>
    </div>
  );
}
