export async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T, index: number) => Promise<void>,
  concurrency: number,
): Promise<void> {
  const queue = items.map((item, i) => ({ item, i }));
  const lanes = Math.max(1, Math.min(concurrency, queue.length));
  const runners = Array.from({ length: lanes }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (!next) return;
      await worker(next.item, next.i);
    }
  });
  await Promise.all(runners);
}
