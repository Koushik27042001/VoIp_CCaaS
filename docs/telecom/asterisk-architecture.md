# Asterisk Architecture

Asterisk is the PBX and telecom control layer for the next phase of this project.

## Target Architecture

```text
React Agent Desktop
  -> SIP.js over WSS
  -> Asterisk HTTP/WebSocket transport
  -> PJSIP endpoint
  -> Asterisk dialplan
  -> Internal extension, queue, IVR, recording, SIP trunk, or PSTN
```

Backend responsibilities:

```text
Express backend
  -> SIP trunk CRUD
  -> Asterisk config generation
  -> Telecom status APIs
  -> Trunk health APIs
  -> Call and event persistence
```

## Asterisk Config Areas

`pjsip.conf`:

- PJSIP transports.
- Browser WebRTC endpoints.
- Auth objects.
- AOR/contact behavior.
- Provider SIP trunks.

`extensions.conf`:

- Dialplan routing.
- Internal extension calls.
- Outbound PSTN prefix.
- Inbound trunk routing.
- Future queue and IVR logic.

`rtp.conf`:

- RTP port range.
- ICE support.
- STUN settings.

## Repo Files

Baseline includes:

- `asterisk/pjsip.conf`
- `asterisk/extensions.conf`
- `asterisk/rtp.conf`

Generated development configs:

- `backend/generated/asterisk/pjsip_webrtc.conf`
- `backend/generated/asterisk/pjsip_custom.conf`
- `backend/generated/asterisk/sip_custom.conf`
- `backend/generated/asterisk/extensions_ccaas.conf`
- `backend/generated/asterisk/rtp_ccaas.conf`

Generation services:

- `backend/src/services/asterisk/generateRuntimeConfig.js`
- `backend/src/services/asterisk/generateSipConfig.js`

## Backend APIs

SIP trunks:

- `GET /api/sip-trunks`
- `POST /api/sip-trunks`
- `PUT /api/sip-trunks/:id`
- `DELETE /api/sip-trunks/:id`
- `POST /api/sip-trunks/regenerate-config`

Telecom:

- `GET /api/telecom/status`
- `GET /api/telecom/trunk-health`
- `GET /api/telecom/sip-runtime-plan`
- `POST /api/telecom/generate-runtime-config`

## Asterisk CLI Integration

The backend has a safe allowlist-based CLI wrapper in:

- `backend/src/services/telecom/asteriskManager.js`

Allowed commands include:

- `core show version`
- `pjsip show endpoints`
- `pjsip show registrations`
- `pjsip show contacts`
- `pjsip show aors`
- `queue show`
- `rtp show settings`

By default, CLI execution is disabled.

Enable only when intentionally configured:

```bash
ASTERISK_CLI_ENABLED=true
```

Reload behavior is separately controlled:

```bash
ASTERISK_RELOAD_ENABLED=true
```

## Recommended Local Setup

Use a Linux VM, WSL-compatible external Linux host, Docker image with host networking, or a dedicated server. Asterisk is generally smoother on Linux than native Windows.

Minimum setup:

- Asterisk installed.
- PJSIP enabled.
- HTTP server enabled.
- WebSocket/WSS transport enabled.
- RTP UDP range open.
- TLS certificate available for WSS.

## Current Status

Implemented:

- Config generation.
- Safe CLI snapshot wrapper.
- Trunk health endpoint.
- Runtime SIP/WebRTC endpoint generation.
- Baseline include files.

Pending:

- Real Asterisk installation.
- Real WSS transport.
- Live endpoint registration.
- AMI/ARI event ingestion.
- Queue, recording, and supervisor features.
