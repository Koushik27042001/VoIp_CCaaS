import { asyncHandler } from "../../middlewares/async.middleware.js";
import * as callRepo from "../../repositories/call.repository.js";

const formatDuration = (seconds) => {
  const secs = Number(seconds) || 0;
  const minutes = Math.floor(secs / 60);
  const remaining = secs % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

export const getTodayAnalytics = asyncHandler(async (_req, res) => {
  const todayCalls = await callRepo.getTodayCalls();

  const total = todayCalls.length;
  const completed = todayCalls.filter((c) => c.disposition === "completed").length;
  const missed = todayCalls.filter((c) => c.disposition === "missed").length;
  const failed = todayCalls.filter((c) => c.disposition === "failed").length;

  const totalDuration = todayCalls.reduce((acc, c) => acc + (c.duration || 0), 0);
  const avgDuration = total > 0 ? Math.floor(totalDuration / total) : 0;

  res.json({
    total,
    completed,
    missed,
    failed,
    missedCalls: missed,
    avgDuration,
    callsHandled: total,
    conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgHandleTime: formatDuration(avgDuration),
    csat: 0,
  });
});

export const getAgentAnalytics = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const calls = await callRepo.getCallsByAgent(agentId);

  const total = calls.length;
  const completed = calls.filter((c) => c.disposition === "completed").length;
  const totalDuration = calls.reduce((acc, c) => acc + (c.duration || 0), 0);
  const avgDuration = total > 0 ? Math.floor(totalDuration / total) : 0;

  res.json({
    agentId,
    total,
    completed,
    avgDuration,
  });
});
