# Telecom Pending Completion Plan

This document lists what is still pending in the telecom section and the correct order to complete it.

## Current Telecom Status

Implemented in code:

- SIP trunk CRUD APIs.
- SIP trunk mock mode and Mongo mode.
- SIP trunk password redaction.
- Optional encrypted SIP trunk secret storage.
- Asterisk trunk config generation.
- Runtime WebRTC/PJSIP endpoint config generation.
- Runtime dialplan config generation.
- Runtime RTP config generation.
- Telecom status APIs.
- Trunk health API.
- SIP.js client scaffolding.
- Browser SIP registration helper.
- Browser SIP outbound call helper.
- Baseline Asterisk config files.

Not yet completed as real telecom infrastructure:

- Asterisk is not installed/configured in the project environment.
- Browser is not yet registered to a real Asterisk endpoint.
- RTP audio is not yet routed through Asterisk.
- Real extension-to-extension SIP calling is not verified.
- Real SIP trunk/PSTN calling is not verified.
- Queue, IVR, recording, and supervisor features are not built yet.

## Pending Phase 1: Asterisk Installation

Goal: install and run the PBX.

Pending work:

- Install Asterisk on Linux, VM, cloud server, or Docker host.
- Enable PJSIP.
- Enable Asterisk HTTP server.
- Enable WebSocket/WSS support.
- Configure TLS certificate for WSS.
- Configure RTP port range.
- Open firewall ports:
  - WSS, commonly `8089/tcp`.
  - SIP if needed, commonly `5060/udp`.
  - RTP, commonly `10000-20000/udp`.

Completion check:

```bash
asterisk -rx "core show version"
asterisk -rx "pjsip show transports"
asterisk -rx "rtp show settings"
```

## Pending Phase 2: Apply Generated Asterisk Config

Goal: connect backend-generated config to live Asterisk.

Pending work:

- Set backend env:

```bash
ASTERISK_CONFIG_DIR=/etc/asterisk
ASTERISK_CLI_ENABLED=true
ASTERISK_RELOAD_ENABLED=true
```

- Generate runtime config:

```bash
POST /api/telecom/generate-runtime-config
```

- Generate SIP trunk config if trunks exist:

```bash
POST /api/sip-trunks/regenerate-config
```

- Include generated files from live Asterisk config:
  - `pjsip_webrtc.conf`
  - `pjsip_custom.conf`
  - `extensions_ccaas.conf`
  - `rtp_ccaas.conf`

Completion check:

```bash
asterisk -rx "pjsip show endpoints"
asterisk -rx "dialplan show from-internal"
```

## Pending Phase 3: Browser SIP Registration

Goal: register the React browser client as an Asterisk SIP endpoint.

Pending work:

- Set client env:

```bash
REACT_APP_SIP_ENABLED=true
REACT_APP_SIP_WS_SERVER=wss://<asterisk-host>:8089/ws
REACT_APP_SIP_DOMAIN=<asterisk-host-or-domain>
REACT_APP_SIP_EXTENSION=1001
REACT_APP_SIP_PASSWORD=agent1001
REACT_APP_SIP_DISPLAY_NAME=Agent 1001
```

- Add visible frontend SIP registration controls/status.
- Call `registerSipAgent` from the UI.
- Display states:
  - Disabled.
  - Registering.
  - Registered.
  - Failed.
  - Incoming call.
  - In call.

Completion check:

```bash
asterisk -rx "pjsip show contacts"
```

Expected:

- Contact for extension `1001` appears.

## Pending Phase 4: Extension-To-Extension Calling

Goal: prove real internal PBX calling.

Pending work:

- Register at least two browser agents:
  - `1001`
  - `1002`
- Dial `1002` from `1001`.
- Confirm Asterisk routes through `[from-internal]`.
- Confirm two-way audio.
- Persist call events from real SIP state.

Completion check:

```bash
asterisk -rx "core show channels"
asterisk -rx "pjsip show channels"
```

Expected:

- Active channel appears during call.
- Audio works both directions.
- Backend call log records the call.

## Pending Phase 5: Real-Time PBX Events

Goal: stop relying only on mock/socket events and ingest real PBX events.

Pending work:

- Choose AMI or ARI integration.
- Build Asterisk event worker.
- Capture events:
  - New channel.
  - Ringing.
  - Answered.
  - Bridge created.
  - Hangup.
  - Transfer.
  - Hold.
  - Queue join/leave.
- Store events in `CallEvent`.
- Emit frontend Socket.IO events from PBX events.

Recommended backend files to add:

```text
backend/src/services/telecom/amiClient.js
backend/src/services/telecom/ariClient.js
backend/src/workers/asteriskEvents.worker.js
backend/src/modules/telecom/telecomEvents.controller.js
```

Completion check:

- Frontend updates from real Asterisk events.
- `CallEvent` contains real PBX lifecycle events.

## Pending Phase 6: SIP Trunk And PSTN Calling

Goal: call real phone numbers.

Pending work:

- Get SIP trunk provider credentials.
- Configure trunk in SIP trunk UI.
- Generate trunk config.
- Configure outbound route.
- Configure inbound DID route.
- Test outbound call.
- Test inbound call.
- Add DID mapping model/API.
- Add outbound route model/API.

Recommended backend models:

```text
DidRoute
OutboundRoute
```

Completion check:

```bash
asterisk -rx "pjsip show registrations"
asterisk -rx "pjsip show endpoints"
```

Expected:

- Trunk registered or reachable.
- Outbound PSTN call works.
- Inbound DID reaches correct destination.

## Pending Phase 7: Queues

Goal: contact-center routing.

Pending work:

- Add queue model.
- Add queue membership model.
- Generate Asterisk queue config.
- Route inbound calls to queues.
- Track waiting calls.
- Track abandoned calls.
- Track SLA.
- Show live queue dashboard.

Recommended files:

```text
backend/src/models/Queue.js
backend/src/models/QueueMember.js
backend/src/modules/queues/queue.routes.js
backend/src/modules/queues/queue.controller.js
backend/src/services/telecom/queueConfig.js
client/src/pages/queues/QueueDashboard.jsx
```

Completion check:

```bash
asterisk -rx "queue show"
```

Expected:

- Queue exists.
- Agents are members.
- Waiting calls route to available agents.

## Pending Phase 8: IVR

Goal: route callers through menu options.

Pending work:

- Add IVR model.
- Add prompt/audio storage.
- Generate dialplan for IVR.
- Map DTMF input to destinations.
- Add timeout and invalid input handling.

Recommended model:

```text
IvrMenu
```

Completion check:

- Inbound call reaches IVR.
- DTMF option routes to extension, queue, or voicemail.

## Pending Phase 9: Recording

Goal: record calls and expose metadata safely.

Pending work:

- Add recording policy.
- Enable MixMonitor in dialplan.
- Add recording metadata model.
- Store recording file path/object key.
- Add playback API with permissions.
- Add retention policy.

Recommended model:

```text
Recording
```

Completion check:

- Completed call has recording metadata.
- Authorized user can play recording.
- Unauthorized user cannot access recording.

## Pending Phase 10: Supervisor Features

Goal: supervisor operations.

Pending work:

- Live calls dashboard.
- Listen/monitor.
- Whisper.
- Barge.
- Transfer controls.
- Agent state controls.
- Permission checks for supervisor/admin roles.

Completion check:

- Supervisor can monitor active calls.
- Agent and customer audio behavior is correct for listen/whisper/barge modes.

## Pending Phase 11: NAT, TURN, And Media Quality

Goal: production-grade audio reliability.

Pending work:

- Deploy TURN server.
- Configure frontend TURN env.
- Test strict NAT networks.
- Capture call quality metrics:
  - Packet loss.
  - Jitter.
  - Round-trip time.
  - ICE candidate type.
- Add network readiness test for agents.

Completion check:

- Calls work from office, home Wi-Fi, mobile hotspot, and restricted networks.
- No one-way audio.

## Pending Phase 12: Security And Production Hardening

Goal: safe telecom administration.

Pending work:

- RBAC for telecom routes.
- Admin-only trunk management.
- Admin-only config generation/reload.
- Audit logs.
- Secret manager integration.
- TLS everywhere.
- Rate limits by route type.
- Alerting for trunk down and call failure spikes.

Completion check:

- Non-admin users cannot change telecom config.
- Admin actions are auditable.
- Secrets are not exposed in logs or API responses.

## Recommended Completion Order

1. Install Asterisk.
2. Apply generated PJSIP, dialplan, and RTP config.
3. Register browser SIP agent.
4. Make extension-to-extension calls.
5. Ingest real PBX events.
6. Configure SIP trunk and PSTN.
7. Add queues.
8. Add IVR.
9. Add recording.
10. Add supervisor features.
11. Deploy TURN and quality monitoring.
12. Harden security and production operations.

## Definition Of Done For Telecom MVP

Telecom MVP is complete when:

- Asterisk is running.
- Browser extension `1001` registers.
- Two browser agents can call each other.
- Audio works both directions.
- Backend persists real call logs.
- Frontend updates from real PBX call events.
- One SIP trunk can place outbound PSTN calls.
- One inbound DID can route to an agent or queue.

## Definition Of Done For CCaaS MVP

CCaaS MVP is complete when:

- Agents log in.
- Agents register as SIP endpoints.
- Inbound calls route through a queue.
- Agents receive and answer queue calls.
- CRM popup appears by phone number.
- Call notes and dispositions persist.
- Basic queue analytics work.
- Supervisor can see live calls and agent states.
