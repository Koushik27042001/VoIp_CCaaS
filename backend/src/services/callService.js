// Call Service - Business logic for call operations

export const calculateCallDuration = (startTime, endTime) => {
  return Math.floor((endTime - startTime) / 1000);
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

export const getCallStatus = (disposition) => {
  const statusMap = {
    completed: "✅ Completed",
    missed: "❌ Missed",
    failed: "⚠️ Failed",
  };
  return statusMap[disposition] || "Pending";
};

export default {
  calculateCallDuration,
  formatDuration,
  getCallStatus,
};
