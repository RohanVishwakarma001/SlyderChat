export const minutesAgo = (n: number) => Date.now() - n * 60 * 1000;
export const hoursAgo = (n: number) => Date.now() - n * 60 * 60 * 1000;
export const daysAgo = (n: number) => Date.now() - n * 24 * 60 * 60 * 1000;
