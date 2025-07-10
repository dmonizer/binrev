// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logExecution<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const fnName = fn.name || 'anonymous';
    console.log(`Starting execution of ${fnName}`);

    const start = performance.now();
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Start "still running" logger
    intervalId = setInterval(() => {
      console.log(`Function ${fnName} still running...`);
    }, 1000);

    const clear = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const result = fn(...args);

    if (result instanceof Promise) {
      return result.finally(() => {
        clear();
        const end = performance.now();
        console.log(`Finished execution of ${fnName} in ${Math.round(end - start)} ms`);
      }) as ReturnType<T>;
    } else {
      clear();
      const end = performance.now();
      console.log(`Finished execution of ${fnName} in ${Math.round(end - start)} ms`);
      return result as ReturnType<T>;
    }
  };
}
