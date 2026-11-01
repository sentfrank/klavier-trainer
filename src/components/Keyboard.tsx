const WHITE = [0, 2, 4, 5, 7, 9, 11];
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'H'];
export const noteName = (m: number) => NAMES[m % 12] + (Math.floor(m / 12) - 1);

type Props = { from?: number; to?: number; target: number[]; pressed: Record<number, 'ok' | 'bad' | 'on'>; onPress: (m: number) => void; fingers?: Record<number, number> };

export function Keyboard({ from = 48, to = 84, target, pressed, onPress, fingers = {} }: Props) {
  const whites: number[] = []; for (let m = from; m <= to; m++) if (WHITE.includes(m % 12)) whites.push(m);
  const w = 100 / whites.length;
  const cls = (m: number) => ['key', pressed[m] ?? '', target.includes(m) ? 'target' : ''].join(' ');
  return (
    <div className="keyboard" role="group" aria-label="Klaviatur">
      {whites.map((m, i) => (
        <button key={m} className={cls(m) + ' white'} style={{ left: `${i * w}%`, width: `${w}%` }}
          onPointerDown={() => onPress(m)} aria-label={noteName(m)}>
          {target.includes(m) && fingers[m] && <span className="finger">{fingers[m]}</span>}
          {m % 12 === 0 && <span className="label">{noteName(m)}</span>}
        </button>
      ))}
      {whites.map((m, i) => [1, 3, 6, 8, 10].includes((m + 1) % 12) && m + 1 <= to ? (
        <button key={m + 1} className={cls(m + 1) + ' black'} style={{ left: `${(i + 1) * w - w * 0.3}%`, width: `${w * 0.6}%` }}
          onPointerDown={() => onPress(m + 1)} aria-label={noteName(m + 1)} />
      ) : null)}
    </div>
  );
}
