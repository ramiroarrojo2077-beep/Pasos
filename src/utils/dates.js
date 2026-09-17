export function dayKey(date = new Date()) {
  const d = new Date(date);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function lastNDays(n, from = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) out.push(dayKey(addDays(from, -i)));
  return out;
}

export function shortWeekday(key) {
  const [y, m, d] = key.split('-').map(Number);
  const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return names[new Date(y, m - 1, d).getDay()];
}

export function formatRange(startISO, endISO) {
  const f = (iso) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };
  return `${f(startISO)} - ${f(endISO)}`;
}

export function daysLeft(endISO) {
  const ms = new Date(endISO).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export function isActiveRange(startISO, endISO) {
  const now = Date.now();
  return new Date(startISO).getTime() <= now && now <= new Date(endISO).getTime();
}
