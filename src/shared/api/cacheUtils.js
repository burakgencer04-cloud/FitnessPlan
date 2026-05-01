export const createCache = (durationMs) => {
  let cache = { data: [], ts: 0 };
  return {
    get: () => (Date.now() - cache.ts < durationMs && cache.data?.length > 0) ? cache.data : null,
    set: (data) => { cache = { data, ts: Date.now() }; },
    invalidate: () => { cache = { data: [], ts: 0 }; }
  };
};