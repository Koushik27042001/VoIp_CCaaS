/**
 * In-process metrics registry.
 * Swap for Prometheus/StatsD exporters when you add observability infra.
 */
const counters = new Map();

const increment = (name, value = 1) => {
  counters.set(name, (counters.get(name) || 0) + value);
};

const get = (name) => counters.get(name) || 0;

const snapshot = () => Object.fromEntries(counters);

const reset = () => counters.clear();

export const metrics = {
  increment,
  get,
  snapshot,
  reset,

  // Domain helpers
  callStarted: () => increment("calls.started"),
  callEnded: () => increment("calls.ended"),
  callFailed: () => increment("calls.failed"),
};

export default metrics;
