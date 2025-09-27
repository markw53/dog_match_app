// Debounce & Throttle
export const debounce = <F extends (...args: any[]) => void>(func: F, wait: number): F => {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as F;
};

export const throttle = <F extends (...args: any[]) => void>(func: F, limit: number): F => {
  let inThrottle = false;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as F;
};

export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> =>
  arr.reduce((acc, item) => {
    const k = String(item[key]);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<string, T[]>);

export const sortBy = <T>(arr: T[], key: keyof T, desc = false): T[] =>
  [...arr].sort((a, b) =>
    desc ? ((b[key] as any) < (a[key] as any) ? -1 : 1) : ((a[key] as any) < (b[key] as any) ? -1 : 1)
  );