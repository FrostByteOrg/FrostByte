export function addDate(_now: Date, weeks?: number, days?: number, hours?: number, minutes?: number, seconds?: number): Date {
  let now = new Date(_now);
  if (weeks) {
    now.setDate(now.getDate() + (weeks * 7));
  }

  if (days) {
    now.setDate(now.getDate() + days);
  }

  if (hours) {
    now.setHours(now.getHours() + hours);
  }

  if (minutes) {
    now.setMinutes(now.getMinutes() + minutes);
  }

  if (seconds) {
    now.setSeconds(now.getSeconds() + seconds);
  }

  return now;
}
