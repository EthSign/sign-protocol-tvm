export function dateToUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function unixTimestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

export function addOneHour(date: Date): Date {
  return new Date(date.getTime() + 60 * 60 * 1000);
}
