import mockCalls from "../../data/mockCalls.js";

const USE_MOCK = process.env.USE_MOCK === "true";

// helper → filter today calls
const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

const formatDuration = (seconds) => {
  const secs = Number(seconds) || 0;
  const minutes = Math.floor(secs / 60);
  const remaining = secs % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

export const getTodayAnalytics = async (req, res) => {
  try {
    if (USE_MOCK) {
      const todayCalls = mockCalls.filter((c) => isToday(c.startTime));

      const total = todayCalls.length;

      const completed = todayCalls.filter(
        (c) => c.disposition === "completed"
      ).length;

      const missed = todayCalls.filter((c) => c.disposition === "missed")
        .length;

      const failed = todayCalls.filter((c) => c.disposition === "failed")
        .length;

      const totalDuration = todayCalls.reduce(
        (acc, c) => acc + (c.duration || 0),
        0
      );

      const avgDuration = total > 0 ? Math.floor(totalDuration / total) : 0;

      return res.json({
        total,
        completed,
        missed,
        failed,
        avgDuration,
        callsHandled: total,
        conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgHandleTime: formatDuration(avgDuration),
        csat: 4.6,
      });
    }

    // Future: Get from database
    res.json({
      total: 0,
      completed: 0,
      missed: 0,
      failed: 0,
      avgDuration: 0,
      callsHandled: 0,
      conversionRate: 0,
      avgHandleTime: "00:00",
      csat: 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Agent Analytics
export const getAgentAnalytics = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (USE_MOCK) {
      const calls = mockCalls.filter((c) => c.agentId === agentId);

      const total = calls.length;

      const completed = calls.filter((c) => c.disposition === "completed")
        .length;

      const totalDuration = calls.reduce((acc, c) => acc + (c.duration || 0), 0);

      const avgDuration = total > 0 ? Math.floor(totalDuration / total) : 0;

      return res.json({
        agentId,
        total,
        completed,
        avgDuration,
      });
    }

    res.status(501).json({ message: "Not implemented yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
