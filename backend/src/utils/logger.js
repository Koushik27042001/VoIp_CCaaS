/**
 * @deprecated Import from ../telemetry/logger.js instead.
 * Kept for backward compatibility with existing imports.
 */
import telemetryLogger from "../telemetry/logger.js";

export const logger = {
  info: (message, meta) => telemetryLogger.info(meta ?? {}, message),
  error: (message, error) =>
    telemetryLogger.error(
      { err: error instanceof Error ? error : undefined },
      message
    ),
  warn: (message, meta) => telemetryLogger.warn(meta ?? {}, message),
  debug: (message, meta) => telemetryLogger.debug(meta ?? {}, message),
};

export default telemetryLogger;
