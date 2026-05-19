# Production Checklist

Use this before moving from mock/demo mode to real telecom traffic.

## Backend Environment

- Set `USE_MOCK=false`.
- Verify `MONGO_URI` points to production MongoDB.
- Set a strong `JWT_SECRET`.
- Set `SIP_TRUNK_SECRET_KEY` before storing encrypted SIP trunk passwords.
- Set `NODE_ENV=production`.
- Set `LOG_LEVEL=info` or stricter.
- Set `CORS_ORIGIN` to approved frontend origins only.
- Set `SOCKET_CORS_ORIGIN` to approved frontend origins only.
- Tune `API_RATE_LIMIT_PER_MINUTE`.
- Tune `SIGNALING_RATE_LIMIT_PER_MINUTE`.

## MongoDB

- Use authentication.
- Use backups.
- Verify indexes are created.
- Monitor query latency.
- Monitor connection pool usage.
- Validate phone lookup performance.
- Validate call history pagination.

## Asterisk Host

- Install Asterisk with PJSIP.
- Enable HTTP server for WebSocket/WSS.
- Configure TLS for WSS.
- Configure RTP port range.
- Open firewall ports:
  - SIP UDP/TCP/TLS as needed.
  - WSS port, commonly `8089`.
  - RTP UDP range, commonly `10000-20000`.
- Install Opus support if required.
- Disable unused SIP transports.
- Lock down Asterisk manager/admin access.

## Generated Configs

- Set `ASTERISK_CONFIG_DIR`.
- Generate runtime config:
  - `POST /api/telecom/generate-runtime-config`
- Generate trunk config:
  - `POST /api/sip-trunks/regenerate-config`
- Include generated snippets from active Asterisk config.
- Keep generated files permission-restricted.
- Keep `ASTERISK_RELOAD_ENABLED=false` until reload permissions are intentionally configured.

## Asterisk CLI Access

- Keep `ASTERISK_CLI_ENABLED=false` by default.
- Enable it only if the Node process is allowed to run safe `asterisk -rx` commands.
- Do not expose arbitrary Asterisk command execution.
- Monitor `/api/telecom/status`.
- Monitor `/api/telecom/trunk-health`.

## Browser SIP

- Set `REACT_APP_SIP_ENABLED=true`.
- Set `REACT_APP_SIP_WS_SERVER=wss://<host>:8089/ws`.
- Set `REACT_APP_SIP_DOMAIN`.
- Set agent extension and password.
- Serve frontend over HTTPS.
- Validate browser microphone permission.
- Validate SIP registration in Asterisk.
- Validate reconnect behavior.

## NAT And RTP

- Configure STUN.
- Deploy TURN for strict NAT environments.
- Verify RTP audio in both directions.
- Test office, home, and mobile hotspot networks.
- Monitor packet loss, jitter, and one-way-audio cases.

## SIP Trunks

- Store provider credentials securely.
- Use IP allowlisting where supported.
- Validate registration or IP-auth mode.
- Validate outbound route.
- Validate inbound DID route.
- Validate caller ID.
- Create trunk failover plan.

## Security

- Add RBAC before allowing non-admin users into SIP trunk settings.
- Add audit logs before production telecom admin actions.
- Protect generated config endpoints.
- Protect reload endpoints.
- Rotate SIP credentials.
- Never commit `.env`.
- Never commit generated secrets or provider trunk passwords.

## Observability

- Monitor Node memory.
- Monitor socket connection count.
- Monitor Mongo query latency.
- Monitor call creation/error rate.
- Monitor Asterisk registrations.
- Monitor Asterisk contacts.
- Monitor channel count.
- Monitor trunk health.
- Alert on:
  - Trunk unregistered.
  - High failed calls.
  - Mongo unavailable.
  - Asterisk unavailable.
  - High websocket disconnects.

## Verification Commands

Backend:

```bash
npm test
npm audit --audit-level=moderate
```

Asterisk:

```bash
asterisk -rx "core show version"
asterisk -rx "pjsip show endpoints"
asterisk -rx "pjsip show contacts"
asterisk -rx "pjsip show registrations"
asterisk -rx "rtp show settings"
```

HTTP:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/telecom/status
```

## Go-Live Gate

Do not send real customer traffic until:

- Browser SIP registration works.
- Extension-to-extension audio works.
- Outbound PSTN works.
- Inbound DID routing works.
- Logs and metrics are visible.
- Admin telecom routes are role-protected.
- Recovery steps are documented.
