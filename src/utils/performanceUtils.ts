export const measurePerformance = async <T>(name: string, op: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await op();
    console.log(`${name} took ${performance.now() - start}ms`);
    return result;
  } catch (e) {
    console.error(`${name} failed after ${performance.now() - start}ms`, e);
    throw e;
  }
};