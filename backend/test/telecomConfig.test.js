import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAgentExtensions,
  buildSipRuntimeConfig,
} from "../src/services/telecom/sipRouting.js";

test("buildAgentExtensions creates deterministic browser SIP endpoints", () => {
  const agents = buildAgentExtensions({ start: 1001, count: 2, passwordPrefix: "agent" });

  assert.deepEqual(
    agents.map((agent) => agent.extension),
    ["1001", "1002"]
  );
  assert.equal(agents[0].transport, "transport-wss");
  assert.equal(agents[0].webrtc, true);
});

test("buildSipRuntimeConfig includes WebRTC, dialplan, and RTP snippets", () => {
  const config = buildSipRuntimeConfig();

  assert.match(config.pjsip, /webrtc=yes/);
  assert.match(config.pjsip, /transport-wss/);
  assert.match(config.extensions, /\[from-internal\]/);
  assert.match(config.rtp, /rtpstart=/);
});
