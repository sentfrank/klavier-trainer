let ctx: AudioContext | null = null;
let midiOut: MIDIOutput | null = null;
export function setMidiOut(o: MIDIOutput | null) { midiOut = o; }

const freq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export function playNote(midi: number, seconds = 0.6, velocity = 0.8) {
  if (midiOut) {
    midiOut.send([0x90, midi, Math.round(velocity * 127)]);
    setTimeout(() => midiOut?.send([0x80, midi, 0]), seconds * 1000);
    return;
  }
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.35 * velocity, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.4, seconds) + 0.6);
  g.connect(ctx.destination);
  [1, 2, 3].forEach((h, i) => {
    const o = ctx!.createOscillator();
    o.type = i === 0 ? 'triangle' : 'sine';
    o.frequency.value = freq(midi) * h;
    const hg = ctx!.createGain(); hg.gain.value = [1, 0.3, 0.12][i];
    o.connect(hg).connect(g); o.start(t); o.stop(t + seconds + 1.2);
  });
}

export function playClick(accent = false) {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = accent ? 1600 : 1000;
  g.gain.setValueAtTime(accent ? 0.3 : 0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.06);
}
