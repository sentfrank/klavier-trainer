import type { Note } from '../songs';
// Diatonische Position relativ zu E4 (unterste Linie im Violinschlüssel)
const STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
const SHARP = [1, 3, 6, 8, 10];
const pos = (m: number) => (Math.floor(m / 12) - 5) * 7 + STEP[m % 12] - 2;

type Props = { notes: Note[]; index: number; status: ('ok' | 'bad' | null)[] };

export function Staff({ notes, index, status }: Props) {
  const per = 8; const start = Math.max(0, Math.min(index - 2, notes.length - per));
  const view = notes.slice(Math.max(0, start), Math.max(0, start) + per);
  const W = 640, H = 170, top = 50, gap = 12, x0 = 70, dx = (W - x0 - 20) / per;
  const y = (m: number) => top + 4 * gap - pos(m) * (gap / 2);
  return (
    <svg className="staff" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Notenzeile">
      {[0, 1, 2, 3, 4].map(i => <line key={i} x1={10} x2={W - 10} y1={top + i * gap} y2={top + i * gap} className="staffline" />)}
      <text x={14} y={top + 4 * gap + 6} className="clef">𝄞</text>
      {view.map((n, k) => {
        const i = start + k, cx = x0 + k * dx + dx / 2, cy = y(n.midi), p = pos(n.midi);
        const st = status[i]; const cur = i === index;
        const open = n.beats >= 2;
        const cl = ['note', cur ? 'current' : '', st ?? ''].join(' ');
        const ledgers = []; for (let l = -2; l >= p; l -= 2) ledgers.push(top + 4 * gap - l * (gap / 2));
        return (
          <g key={i} className={cl}>
            {cur && <rect x={cx - dx / 2 + 2} y={top - 26} width={dx - 4} height={4 * gap + 52} rx={8} className="cursor" />}
            {ledgers.map(ly => <line key={ly} x1={cx - 12} x2={cx + 12} y1={ly} y2={ly} className="staffline" />)}
            {SHARP.includes(n.midi % 12) && <text x={cx - 22} y={cy + 5} className="acc">♯</text>}
            <ellipse cx={cx} cy={cy} rx={7.5} ry={5.5} transform={`rotate(-20 ${cx} ${cy})`} className={open ? 'head open' : 'head'} />
            {n.beats < 4 && <line x1={cx + 7} x2={cx + 7} y1={cy} y2={cy - 34} className="stem" />}
            {n.beats % 1 !== 0 && n.beats > 1 && <circle cx={cx + 13} cy={cy} r={2} className="dot" />}
            {n.beats < 1 && <path d={`M${cx + 7} ${cy - 34} q 8 10 10 18`} className="flag" />}
            {n.finger && <text x={cx} y={top - 12} className="fingertext">{n.finger}</text>}
            {n.lyric && <text x={cx} y={top + 4 * gap + 40} className="lyric">{n.lyric}</text>}
          </g>
        );
      })}
    </svg>
  );
}
