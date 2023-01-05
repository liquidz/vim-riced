export const memoize = <T extends unknown[], U extends Promise<unknown>>(
  fn: (...args: T) => U,
  keyFn?: (args: T) => string,
) => {
  const mem: Record<string, U> = {};
  return (...args: T): U => {
    const key = (keyFn === undefined) ? JSON.stringify(args) : keyFn(args);
    if (mem[key] === undefined) {
      mem[key] = fn(...args);
    }
    return mem[key];
  };
};
