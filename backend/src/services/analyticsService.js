import Call from "../models/Call.js";
import { formatDuration } from "./callService.js";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getTodayCallAnalytics = async () => {
  const [summary] = await Call.aggregate([
    { $match: { startTime: { $gte: startOfToday() } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$disposition", "completed"] }, 1, 0] },
        },
        missed: {
          $sum: { $cond: [{ $eq: ["$disposition", "missed"] }, 1, 0] },
        },
        failed: {
          $sum: { $cond: [{ $eq: ["$disposition", "failed"] }, 1, 0] },
        },
        totalDuration: { $sum: "$duration" },
      },
    },
  ]);

  const total = summary?.total || 0;
  const avgDuration = total > 0 ? Math.floor((summary.totalDuration || 0) / total) : 0;
  const completed = summary?.completed || 0;

  return {
    total,
    completed,
    missed: summary?.missed || 0,
    failed: summary?.failed || 0,
    avgDuration,
    callsHandled: total,
    conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    avgHandleTime: formatDuration(avgDuration),
    csat: 0,
  };
};

export const getAgentCallAnalytics = async (agentId) => {
  const [summary] = await Call.aggregate([
    { $match: { agentId } },
    {
      $group: {
        _id: "$agentId",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$disposition", "completed"] }, 1, 0] },
        },
        totalDuration: { $sum: "$duration" },
      },
    },
  ]);

  const total = summary?.total || 0;

  return {
    agentId,
    total,
    completed: summary?.completed || 0,
    avgDuration: total > 0 ? Math.floor((summary.totalDuration || 0) / total) : 0,
  };
};
