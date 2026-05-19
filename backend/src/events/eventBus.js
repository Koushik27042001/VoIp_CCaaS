import { EventEmitter } from "events";
import logger from "../telemetry/logger.js";

const eventBus = new EventEmitter();

eventBus.setMaxListeners(25);

eventBus.on("error", (err) => {
  logger.error({ err }, "Unhandled event bus error");
});

export default eventBus;
