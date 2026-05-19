# SIP Basics For This Project

SIP is the signaling protocol used to create, route, answer, transfer, and end calls. SIP does not carry the audio itself; audio is carried by RTP or WebRTC media.

## Where SIP Fits

Current mock/WebRTC mode:

```text
Browser
  -> Socket.IO
  -> Browser WebRTC peer
```

Target real telecom mode:

```text
Browser SIP.js client
  -> SIP over WSS
  -> Asterisk PJSIP
  -> Dialplan
  -> Extension, queue, trunk, or PSTN destination
```

## Important SIP Concepts

- User agent: a SIP client. In this project, the browser becomes a user agent through SIP.js.
- Registrar: server that accepts SIP registrations. Asterisk is the registrar.
- Endpoint: a configured SIP identity, such as agent extension `1001`.
- Contact: the active network location where an endpoint is registered.
- INVITE: starts a call.
- 180 Ringing: remote side is ringing.
- 200 OK: call answered.
- ACK: confirms answer.
- BYE: ends a call.
- REGISTER: logs the browser agent into Asterisk.

## Project SIP Files

Client:

- `client/src/sip/sipConfig.js`
- `client/src/sip/sipClient.js`
- `client/src/sip/registerAgent.js`
- `client/src/sip/callHandler.js`

Backend:

- `backend/src/services/telecom/sipRouting.js`
- `backend/src/services/asterisk/generateRuntimeConfig.js`
- `backend/src/modules/telecom/telecom.routes.js`

Asterisk baseline:

- `asterisk/pjsip.conf`
- `asterisk/extensions.conf`
- `asterisk/rtp.conf`

## Browser SIP Environment

Set these in the client environment:

```bash
REACT_APP_SIP_ENABLED=true
REACT_APP_SIP_WS_SERVER=wss://localhost:8089/ws
REACT_APP_SIP_DOMAIN=localhost
REACT_APP_SIP_EXTENSION=1001
REACT_APP_SIP_PASSWORD=agent1001
REACT_APP_SIP_DISPLAY_NAME=Agent 1001
```

## Backend Telecom APIs

- `GET /api/telecom/status`
- `GET /api/telecom/sip-runtime-plan`
- `POST /api/telecom/generate-runtime-config`

## SIP Registration Verification

Use Asterisk CLI:

```bash
asterisk -rx "pjsip show endpoints"
asterisk -rx "pjsip show contacts"
```

Expected result:

- Endpoint `1001` exists.
- Contact for `1001` appears after browser registration.

## Current Status

Implemented:

- SIP.js installed.
- SIP client wrapper exists.
- Browser registration scaffolding exists.
- Outbound SIP call helper exists.
- Asterisk endpoint config generation exists.

Pending infrastructure:

- Real Asterisk WSS endpoint.
- TLS certificate.
- Live SIP registration test.
- Real SIP calls through Asterisk.
