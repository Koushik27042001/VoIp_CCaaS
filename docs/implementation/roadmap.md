# Implementation Roadmap

This roadmap starts from the current codebase state: web app foundation complete, backend production foundation complete, telecom scaffolding ready, real PBX infrastructure still pending.

## Phase 0: Completed Foundation

Status: Done.

Completed:

- React CCaaS workspace.
- Backend REST API.
- Socket.IO realtime layer.
- Mock/WebRTC call flow.
- Mongo-ready models.
- Customer, call, analytics, and SIP trunk service layers.
- Zod validation.
- Pino logging.
- API rate limiting.
- SIP trunk config generation.
- Telecom status/config APIs.
- SIP.js browser client scaffolding.
- Asterisk baseline config files and docs.

## Phase 1: Local Asterisk Foundation

Goal: get a real PBX running locally or on a Linux VM.

Tasks:

- Install Asterisk with PJSIP support.
- Enable the Asterisk HTTP server.
- Enable WebSocket or secure WebSocket transport.
- Configure RTP port range.
- Configure Opus/ulaw/alaw codecs.
- Copy or include baseline files from `/asterisk`.
- Generate runtime configs with:
  - `POST /api/telecom/generate-runtime-config`
- Include generated files in active Asterisk config:
  - `pjsip_webrtc.conf`
  - `extensions_ccaas.conf`
  - `rtp_ccaas.conf`
- Reload Asterisk.

Verification:

- `asterisk -rx "core show version"`
- `asterisk -rx "pjsip show endpoints"`
- `asterisk -rx "pjsip show transports"`
- `asterisk -rx "rtp show settings"`
- `GET /api/telecom/status`

Exit criteria:

- Asterisk is running.
- PJSIP transports exist.
- WebRTC endpoints exist.
- RTP range is configured.

## Phase 2: Browser SIP Registration

Goal: register the browser as an Asterisk SIP endpoint using SIP.js.

Client env:

- `REACT_APP_SIP_ENABLED=true`
- `REACT_APP_SIP_WS_SERVER=wss://<asterisk-host>:8089/ws`
- `REACT_APP_SIP_DOMAIN=<asterisk-domain-or-ip>`
- `REACT_APP_SIP_EXTENSION=1001`
- `REACT_APP_SIP_PASSWORD=agent1001`
- `REACT_APP_STUN_URL=stun:stun.l.google.com:19302`

Tasks:

- Serve frontend over HTTPS if using remote microphone/WSS constraints.
- Start backend and frontend.
- Register SIP.js client.
- Validate Asterisk contact registration.

Verification:

- Browser console shows SIP registration success.
- `asterisk -rx "pjsip show contacts"` shows extension `1001`.
- `GET /api/telecom/status` shows CLI data when `ASTERISK_CLI_ENABLED=true`.

Exit criteria:

- Browser extension registers reliably.
- Disconnect/reconnect works.
- Asterisk sees the agent contact.

## Phase 3: Internal Extension Calling

Goal: make real PBX calls between browser agents.

Tasks:

- Register at least two browser endpoints, such as `1001` and `1002`.
- Dial one extension from another.
- Validate dialplan route `_1XXX` in `[from-internal]`.
- Verify RTP audio both directions.
- Persist call lifecycle events in Mongo.

Verification:

- `asterisk -rx "pjsip show channels"`
- `asterisk -rx "core show channels"`
- Browser audio works both directions.
- Backend call history records call start/end.

Exit criteria:

- Extension-to-extension calling works through Asterisk.
- Audio is stable.
- Call logs persist.

## Phase 4: Real SIP Trunk And PSTN

Goal: connect to a provider and place real external calls.

Tasks:

- Add carrier credentials in SIP trunk UI.
- Generate provider trunk config.
- Configure provider IP allowlists or registration credentials.
- Configure outbound route and trunk name.
- Configure inbound DID route.
- Test outbound prefix, currently `_9X.` in generated dialplan.
- Map inbound DID to an extension, queue, or IVR.

Verification:

- `asterisk -rx "pjsip show registrations"`
- `asterisk -rx "pjsip show endpoints"`
- Test call to a real phone number.
- Test inbound call from PSTN.

Exit criteria:

- Outbound PSTN works.
- Inbound DID reaches the expected destination.
- Failed trunk states are visible in `/api/telecom/trunk-health`.

## Phase 5: Contact Center Core

Goal: move from PBX calling to CCaaS behavior.

Tasks:

- Agent states:
  - Available.
  - On call.
  - Break.
  - Offline.
- Queues.
- Queue membership.
- Queue wait metrics.
- Inbound routing to queues.
- Call dispositions.
- CRM-linked call timelines.
- Persistent notes.
- Recording metadata.
- Live call dashboard.

Verification:

- Queue calls route to available agents.
- Agent state affects routing.
- CRM popup appears quickly by phone lookup.
- Analytics comes from persisted call data.

Exit criteria:

- Agents can take queued calls.
- Supervisors can see live activity.
- Calls are linked to customers and call history.

## Phase 6: Supervisor And Enterprise Features

Goal: production contact-center operations.

Tasks:

- Supervisor monitoring.
- Whisper/barge.
- Transfer.
- Hold/resume via SIP re-INVITE or feature codes.
- IVR.
- Business hours.
- Call recording storage.
- Audit logs.
- RBAC.
- Admin permissions.
- Trunk health polling worker.
- Alerting.

Exit criteria:

- Admin and supervisor operations are safe, auditable, and role-limited.
- Calls can be monitored and controlled.
- Production support teams can diagnose trunk, queue, and agent problems.

## Phase 7: Production Hardening

Goal: deploy safely.

Tasks:

- MongoDB production deployment.
- HTTPS frontend.
- WSS Asterisk endpoint.
- TURN server.
- Strict CORS.
- Secrets management.
- Log retention.
- Metrics dashboards.
- Load testing.
- Backup and restore.
- Incident runbooks.

Exit criteria:

- System survives real network conditions.
- NAT traversal is validated.
- Logs and metrics expose failures quickly.
- Secrets and telecom admin operations are locked down.
