import mongoose from "mongoose";
import mockCalls from "../../data/mockCalls.js";
import { isMockMode } from "../../config/env.js";
import {
  getAgentCallAnalytics,
  getTodayCallAnalytics,
} from "../../services/analyticsService.js";

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

export const getTodayAnalytics = async (req, res, next) => {
  try {
    if (isMockMode()) {
      const todayCalls = mockCalls.filter((c) => isToday(c.startTime));
      const total = todayCalls.length;
      const completed = todayCalls.filter((c) => c.disposition === "completed").length;
      const missed = todayCalls.filter((c) => c.disposition === "missed").length;
      const failed = todayCalls.filter((c) => c.disposition === "failed").length;
      const totalDuration = todayCalls.reduce((acc, c) => acc + (c.duration || 0), 0);
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

    res.json(await getTodayCallAnalytics());
  } catch (err) {
    next(err);
  }
};

export const getAgentAnalytics = async (req, res, next) => {
  try {
    const { agentId } = req.params;

    if (isMockMode()) {
      const calls = mockCalls.filter((c) => c.agentId === agentId);
      const total = calls.length;
      const completed = calls.filter((c) => c.disposition === "completed").length;
      const totalDuration = calls.reduce((acc, c) => acc + (c.duration || 0), 0);

      return res.json({
        agentId,
        total,
        completed,
        avgDuration: total > 0 ? Math.floor(totalDuration / total) : 0,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: "Invalid agentId" });
    }

    res.json(await getAgentCallAnalytics(new mongoose.Types.ObjectId(agentId)));
  } catch (err) {
    next(err);
  }
};
