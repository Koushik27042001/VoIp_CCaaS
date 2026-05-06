// Socket event handlers
export const handleSocketEvents = (io, socket) => {
  // Agent status update
  socket.on("agent_status", (data) => {
    console.log("👤 Agent status update:", data);
    io.emit("agent_status_changed", {
      agentId: socket.id,
      status: data.status,
      timestamp: new Date(),
    });
  });

  // Call incoming
  socket.on("incoming_call", (data) => {
    console.log("📞 Incoming call:", data);
    io.emit("inbound_call", data);
  });

  // Call outgoing
  socket.on("outgoing_call", (data) => {
    console.log("📤 Outgoing call:", data);
    io.emit("outgoing_call", data);
  });

  // Call ended
  socket.on("call_finished", (data) => {
    console.log("🏁 Call finished:", data);
    io.emit("call_finished", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Agent disconnected:", socket.id);
    io.emit("agent_disconnected", {
      agentId: socket.id,
      timestamp: new Date(),
    });
  });
};

export default handleSocketEvents;
