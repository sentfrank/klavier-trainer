export type MidiListener = (midi: number, on: boolean, velocity: number) => void;
let access: MIDIAccess | null = null;
const listeners = new Set<MidiListener>();

export const midiSupported = () => typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;

export async function initMidi(onChange: () => void) {
  access = await navigator.requestMIDIAccess();
  const bind = () => access!.inputs.forEach(i => { i.onmidimessage = handle; });
  bind();
  access.onstatechange = () => { bind(); onChange(); };
  onChange();
  return access;
}
function handle(e: MIDIMessageEvent) {
  const d = e.data; if (!d) return;
  const [st, note, vel] = d; const cmd = st & 0xf0;
  if (cmd === 0x90 && vel > 0) emit(note, true, vel / 127);
  else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) emit(note, false, 0);
}
export function emit(note: number, on: boolean, vel = 0.8) { listeners.forEach(l => l(note, on, vel)); }
export function onMidi(l: MidiListener) { listeners.add(l); return () => { listeners.delete(l); }; }
export const getAccess = () => access;
