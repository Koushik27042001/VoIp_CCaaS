# RTP Basics For This Project

RTP carries audio. SIP only negotiates the call; RTP/WebRTC media carries the voice packets.

## Media Flow

Target media path:

```text
Browser microphone
  -> WebRTC SRTP
  -> Asterisk
  -> RTP/SRTP bridge
  -> Browser extension, queue, SIP trunk, or PSTN carrier
```

## Why RTP Matters

Bad RTP configuration causes:

- One-way audio.
- No audio.
- Robotic audio.
- Dropped calls after answer.
- Calls that signal correctly but cannot be heard.

## Required Asterisk Settings

Generated RTP config comes from:

- `backend/src/services/telecom/sipRouting.js`
- `backend/src/services/asterisk/generateRuntimeConfig.js`

Generated development file:

- `backend/generated/asterisk/rtp_ccaas.conf`

Baseline file:

- `asterisk/rtp.conf`

Default generated settings:

```ini
[general]
rtpstart=10000
rtpend=20000
icesupport=yes
stunaddr=stun.l.google.com:19302
```

## Firewall Requirements

Open the RTP UDP range on the Asterisk host:

- Default: `10000-20000/udp`

Also open:

- SIP transport ports if used.
- Asterisk WSS port, commonly `8089`.

## Browser NAT Traversal

Browser WebRTC uses ICE.

Development:

- STUN can be enough on simple networks.

Production:

- TURN is required for strict NAT, enterprise firewalls, and many remote agents.

Client env:

```bash
REACT_APP_STUN_URL=stun:stun.l.google.com:19302
REACT_APP_TURN_URL=turn:turn.example.com:3478
REACT_APP_TURN_USERNAME=<username>
REACT_APP_TURN_CREDENTIAL=<password>
```

## Verification

Asterisk:

```bash
asterisk -rx "rtp show settings"
asterisk -rx "core show channels"
```

Browser:

- Confirm microphone permission.
- Confirm remote audio element plays.
- Use browser WebRTC internals to inspect ICE candidate pair, packet loss, jitter, and bitrate.

## Current Status

Implemented:

- RTP config generation.
- STUN env support in WebRTC and SIP.js helpers.
- TURN env support in WebRTC and SIP.js helpers.

Pending:

- TURN deployment.
- Real Asterisk RTP validation.
- Packet-loss/jitter monitoring.
- Automated ICE fallback test.
