const KEY = 'klavier-trainer-v1';
type Data = { done: Record<string, boolean>; best: Record<string, number>; minutes: Record<string, number> };
function load(): Data {
  try { return { done: {}, best: {}, minutes: {}, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { done: {}, best: {}, minutes: {} }; }
}
export const store = {
  get: load,
  update(fn: (d: Data) => void) { const d = load(); fn(d); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} return d; },
};
