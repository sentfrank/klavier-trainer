import { useEffect, useState } from 'react';
import type { Note } from '../songs';
type St = 'ok' | 'bad' | null | undefined;
const STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
const SHARP = [1, 3, 6, 8, 10];
const dia = (m: number) => Math.floor(m / 12) * 7 + STEP[m % 12];
const E4 = dia(64), G2 = dia(43);
const g = 10;

function Voice({ keys, top, ref0, cx, beats }: { keys: number[]; top: number; ref0: number; cx: number; beats: number }) {
  if (!keys.length) return null;
  const yOf = (p: number) => top + 4 * g - p * g / 2;
  const ps = keys.map(m => dia(m) - ref0), ys = ps.map(yOf);
  const led = new Set<number>();
  ps.forEach(p => { for (let l = -2; l >= p; l -= 2) led.add(l); for (let l = 10; l <= p; l += 2) led.add(l); });
  const minY = Math.min(...ys), maxY = Math.max(...ys), open = beats >= 2;
  return <>
    {[...led].map(l => <line key={'l' + l} x1={cx - 12} x2={cx + 12} y1={yOf(l)} y2={yOf(l)} className="staffline" />)}
    {keys.map((m, j) => <g key={j}>
      {SHARP.includes(m % 12) && <text x={cx - 24} y={ys[j] + 5} className="acc">♯</text>}
      <ellipse cx={cx} cy={ys[j]} rx={7.5} ry={5.5} transform={`rotate(-20 ${cx} ${ys[j]})`} className={open ? 'head open' : 'head'} />
      {(beats === 1.5 || beats === 3) && <circle cx={cx + 13} cy={ys[j]} r={2} className="dot" />}
    </g>)}
    {beats < 4 && <line x1={cx + 7} x2={cx + 7} y1={maxY} y2={minY - 32} className="stem" />}
    {beats < 1 && <path d={`M${cx + 7} ${minY - 32} q 8 10 10 18`} className="flag" />}
  </>;
}

export function Staff({ notes, index, status, lead }: { notes: Note[]; index: number; status: St[]; lead?: boolean }) {
  const [vw, setVw] = useState(window.innerWidth);
  useEffect(() => { const f = () => setVw(window.innerWidth); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const per = vw >= 1100 ? 12 : vw >= 760 ? 10 : 7;
  const W = 94 + per * 74, tT = 60, tB = tT + 4 * g + 70, H = tB + 4 * g + 36, x0 = 80, dx = (W - x0 - 14) / per;
  const start = Math.max(0, Math.min(Math.max(index, 0) - 2, notes.length - per));
  const view = notes.slice(start, start + per);
  return (
    <svg className="staff" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Noten">
      {[tT, tB].map(top => [0, 1, 2, 3, 4].map(i => <line key={top + '-' + i} x1={10} x2={W - 10} y1={top + i * g} y2={top + i * g} className="staffline" />))}
      <line x1={10} x2={10} y1={tT} y2={tB + 4 * g} className="staffline" />
      <text x={16} y={tT + 4 * g + 6} className="clef">𝄞</text>
      <text x={18} y={tB + 3 * g + 2} className="clef bass">𝄢</text>
      {view.map((n, k) => {
        const idx = start + k, cx = x0 + k * dx + dx / 2, cur = idx === index;
        return (
          <g key={idx} className={['note', cur ? 'current' : '', status[idx] ?? ''].join(' ')}>
            {cur && <rect x={cx - dx / 2 + 2} y={tT - 44} width={dx - 4} height={tB - tT + 4 * g + 66} rx={8} className="cursor" />}
            {n.chord && <text x={cx} y={tT - 30} className="chordsym">{n.chord}</text>}
            {n.finger && <text x={cx} y={tT - 14} className="fingertext">{n.finger}</text>}
            <Voice keys={n.rh} top={tT} ref0={E4} cx={cx} beats={n.beats} />
            {!lead && <Voice keys={n.lh} top={tB} ref0={G2} cx={cx} beats={n.beats} />}
            {n.lyric && <text x={cx} y={tT + 4 * g + 44} className="lyric">{n.lyric}</text>}
          </g>
        );
      })}
    </svg>
  );
}
