// Notes Module - To be implemented
// This will handle call notes, follow-ups, and internal comments

export const createNote = async (req, res) => {
  try {
    const { customerId, callId, content, type } = req.body;
    const agentId = req.user?.id;

    // Future: Save to database

    res.status(201).json({
      message: "Note created",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Future: Fetch from database

    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createNote,
  getNotesByCustomer,
};
