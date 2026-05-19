# Asterisk PBX setup (VoIP CCaaS)

## Quick start with Docker

From repo root:

```bash
docker compose -f docker-compose.asterisk.yml up -d
```

## Verify browser registration

```bash
docker exec -it voip-asterisk asterisk -rx "pjsip show contacts"
```

You should see `1001` / `1002` when agents register from the dashboard.

## Default extensions

| Extension | Password       |
|-----------|----------------|
| 1001      | agent1001pass  |
| 1002      | agent1002pass  |

Provision matching rows in MongoDB `Sipextensions` collection (see `npm run seed:sip`).

## Environment

Set in `backend/.env`:

```
ASTERISK_AMI_HOST=127.0.0.1
ASTERISK_AMI_PORT=5038
ASTERISK_AMI_USER=admin
ASTERISK_AMI_PASSWORD=changeme_ami_password
ASTERISK_WS_PUBLIC_URL=ws://127.0.0.1:8088/ws
ASTERISK_SIP_DOMAIN=127.0.0.1
```

## PSTN trunk

Edit `extensions.conf` `[outbound-mobile]` and configure a real `pstn-trunk` PJSIP peer for your SIP provider.
