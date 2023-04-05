import moment from 'moment';

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

export function formatDateStr(date: string): string {
  const pastDate = moment(date).format('MM/DD/YYYY h:mm A');
  const todayDate = moment(date).format('h:mm A');

  return (
    moment(moment(date)).isSame(moment(), 'day') &&
    moment(moment(date)).isSame(moment(), 'year') &&
    moment(moment(date)).isSame(moment(), 'month')
      ? `Today at ${todayDate}`
      : pastDate
  );
}
