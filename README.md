# Expense Websocket Relay

Socket.IO relay service for realtime chat and sync events.

## Production checklist

- Node.js `>=20.11.0`
- `REALTIME_RELAY_SECRET` must match backend `REALTIME_RELAY_SECRET`
- `RELAY_ALLOWED_ORIGINS` must be explicit in production (no `*`)
- Backend must point to this relay:
  - `REALTIME_RELAY_URL=https://<relay-host>`
  - `REALTIME_PUBLIC_SOCKET_URL=https://<relay-host>`

## Endpoints

- `GET /health`
- `GET /ready`
- `POST /internal/events` (Bearer secret required)

## Local run

```bash
npm install
npm run dev
```

## Production run

```bash
npm install --omit=dev
npm run start
```
