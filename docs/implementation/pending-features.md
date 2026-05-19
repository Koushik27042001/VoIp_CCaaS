# Pending Features

This file tracks work that is not yet complete after the latest telecom-layer update.

## Frontend Authentication

- Login page.
- Register page or admin-created users only decision.
- Protected routes.
- Token storage policy.
- Logout flow.
- Session expiry handling.
- Refresh token support.
- Role-aware navigation.
- Authenticated API interceptor.

## Authorization And Security

- Full role-based access control.
- Admin-only SIP trunk management.
- Admin-only telecom config generation.
- Audit logs for:
  - SIP trunk create/update/delete.
  - Asterisk config generation.
  - Asterisk reload.
  - User role changes.
- Production secret manager integration.
- CSRF strategy if cookie auth is introduced.
- Request ID correlation across logs.

## Notes And CRM

- Persistent lead notes UI wired to `Note`.
- Customer timeline endpoint.
- Call-to-customer timeline view.
- Disposition workflow.
- Customer merge/dedupe.
- Phone normalization to one canonical format.

## Asterisk Runtime

- Actual Asterisk installation.
- PJSIP WebSocket/WSS transport enabled.
- TLS certificate configuration.
- Include generated config files in live Asterisk config.
- Validate generated browser endpoints.
- Validate generated dialplan.
- Validate generated RTP settings.
- Safe reload workflow for production.

## SIP.js Runtime

- UI control to register/unregister SIP agent.
- SIP registration status indicator.
- Incoming call UI.
- Answer/reject incoming call controls.
- SIP call state mapping to frontend active call state.
- Hold/resume using SIP semantics.
- Blind transfer.
- Attended transfer.
- Device selection for microphone/speaker.

## Internal Calling

- Register multiple browser agents.
- Extension-to-extension dialing.
- Asterisk channel state tracking.
- Persist `ringing`, `answered`, `ended`, `failed` events from PBX.
- Handle failed calls and busy/no-answer states.

## PSTN And SIP Trunks

- Provider-specific trunk templates.
- DID mapping.
- Outbound route management.
- Inbound route management.
- Emergency calling policy.
- Caller ID controls.
- Trunk failover.
- Trunk health polling worker.

## Queues And CCaaS

- Queue model.
- Queue membership model.
- Queue routing config generation.
- Queue wait-time analytics.
- Abandoned call tracking.
- Agent state enforcement.
- Supervisor queue dashboard.
- SLA metrics.

## Recording And Compliance

- Recording enable/disable policy.
- Recording metadata model.
- Recording storage integration.
- Retention policy.
- Consent announcement or compliance prompt.
- Recording playback permissions.

## Realtime Telecom Events

- AMI or ARI connection.
- Event ingestion worker.
- Live channel state.
- Live bridge state.
- Queue event ingestion.
- Trunk registration event ingestion.
- Socket event fanout to dashboard.

## NAT And Media Reliability

- TURN server deployment.
- ICE fallback validation.
- RTP packet loss monitoring.
- Jitter/latency metrics.
- Browser device diagnostics.
- Network readiness check for agents.

## Testing

- Backend API integration tests.
- Mongo-backed service tests.
- SIP config snapshot tests.
- Frontend SIP state tests.
- Asterisk test environment.
- E2E tests for mock mode.
- E2E tests for extension registration once Asterisk is available.
