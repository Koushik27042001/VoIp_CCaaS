# Twilio Production Setup

Your Twilio console shows demo URLs like:

- Voice: `https://demo.twilio.com/welcome/voice/`
- Messaging: `https://demo.twilio.com/welcome/sms/reply`

**Do not use those in production.** Point Twilio to **your backend** instead.

## 1) Backend environment

Copy `backend/.env.example` to `backend/.env` and set:

```env
PUBLIC_API_URL=https://YOUR-PUBLIC-URL
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+19124916443
TWILIO_API_KEY_SID=SK...
TWILIO_API_SECRET=...
TWILIO_TWIML_APP_SID=AP...
```

`PUBLIC_API_URL` must be reachable by Twilio (use [ngrok](https://ngrok.com) for local dev).

## 2) Create Twilio API Key + TwiML App

In [Twilio Console](https://console.twilio.com):

1. **Account → API Keys** → Create API Key → copy `SID` + `Secret`
2. **Voice → TwiML Apps** → Create → set Voice Request URL:

```
POST {PUBLIC_API_URL}/api/webhooks/twilio/voice/client
```

Copy the TwiML App SID into `TWILIO_TWIML_APP_SID`.

## 3) Configure your Twilio phone number

Phone Numbers → your number → Configure:

| Setting | Value |
|---------|-------|
| Voice webhook (POST) | `{PUBLIC_API_URL}/api/webhooks/twilio/voice/inbound` |
| Messaging webhook (POST) | `{PUBLIC_API_URL}/api/webhooks/twilio/sms/inbound` |

## 4) Verify setup endpoint

Start backend and open:

```
GET http://localhost:5000/api/webhooks/twilio/setup
```

This returns the exact webhook URLs to paste into Twilio Console.

## 5) Start the stack

```bash
# Backend
cd backend && npm run dev

# Frontend
cd client && npm start
```

Login as agent → open `/agent` → dialer shows **Voice registered** → place call.

## Call flow

1. Agent logs in → browser gets Twilio Voice token
2. Agent dials number → backend creates call record
3. Twilio Voice SDK connects agent audio
4. Twilio dials customer via your TwiML App webhook
5. Status webhooks update CRM analytics + live call panel

## Production checklist

- [ ] `PUBLIC_API_URL` is HTTPS public domain
- [ ] `TWILIO_VALIDATE_WEBHOOKS=true` in production
- [ ] Rotate API keys and JWT secret
- [ ] Never commit `.env` files
- [ ] Upgrade Twilio trial account for unrestricted calling
