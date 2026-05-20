import { asyncHandler } from "../../middlewares/async.middleware.js";
import { createVoiceAccessToken } from "../../services/twilio/token.service.js";
import { isTwilioClientEnabled, isTwilioEnabled } from "../../config/twilio.js";

export const getVoiceToken = asyncHandler(async (req, res) => {
  const { token, identity } = createVoiceAccessToken(req.user.id);

  res.json({
    success: true,
    data: {
      token,
      identity,
    },
  });
});

export const getTwilioStatus = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      enabled: isTwilioEnabled(),
      clientEnabled: isTwilioClientEnabled(),
    },
  });
});
