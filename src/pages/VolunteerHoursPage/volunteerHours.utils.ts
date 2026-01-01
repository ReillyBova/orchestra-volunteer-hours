export const toUtcDate = (iso: string) => {
   const [y, m, d] = iso.split('-').map(Number);

   return new Date(Date.UTC(y, m - 1, d, 12));
};

export const formatDay = (iso: string) =>
   new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
   }).format(toUtcDate(iso));

const parseTime = (t: string) => {
   const m = t.trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
   if (!m) return 0;

   let h = Number(m[1]);
   const min = Number(m[2]);
   const ap = m[3].toLowerCase();

   if (ap === 'pm' && h !== 12) h += 12;
   if (ap === 'am' && h === 12) h = 0;

   return h * 60 + min;
};

export const minutesBetween = (start: string, stop: string) => Math.max(0, parseTime(stop) - parseTime(start));

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const pluralize = (n: number, s: string) => `${n} ${s}${n === 1 ? '' : 's'}`;

export const formatHoursMinutes = (totalMinutes: number) => {
   const h = Math.floor(totalMinutes / 60);
   const m = totalMinutes % 60;

   return `${pluralize(h, 'hour')} ${pluralize(m, 'minute')}`;
};

export const minMaxIsoDate = (isoList: string[]) => {
   if (!isoList.length) return undefined;
   const sorted = [...isoList].sort();

   return { min: sorted[0], max: sorted[sorted.length - 1] };
};
