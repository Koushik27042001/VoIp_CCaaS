import { asyncHandler } from "../../middlewares/async.middleware.js";
import * as sipService from "./sip.service.js";

export const getRegistrationConfig = asyncHandler(async (req, res) => {
  const config = await sipService.getRegistrationConfigForUser(req.user.id);

  if (!config) {
    return res.json({
      success: true,
      data: null,
      provisioned: false,
      message: "SIP extension not provisioned for this user",
    });
  }

  res.json({ success: true, data: config, provisioned: true });
});

export const postRegistrationStatus = asyncHandler(async (req, res) => {
  const result = await sipService.reportRegistration(req.body);
  res.json({ success: true, data: result });
});

export const getSipHealth = asyncHandler(async (_req, res) => {
  const health = await sipService.getSipHealth();
  res.json({ success: true, data: health });
});

export const getExtensions = asyncHandler(async (_req, res) => {
  const extensions = await sipService.listExtensions();
  res.json({ success: true, data: extensions });
});
