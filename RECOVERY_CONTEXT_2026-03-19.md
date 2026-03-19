# CRM Realstate — Recovery Context & Incident Report

Date: 2026-03-19  
Prepared for: project handoff and future incident prevention

---

## 1) Project Overview

This repository is a MERN-style CRM for real estate operations:

- **Frontend**: React + TypeScript + Vite (`frontend/`)
- **Backend**: Node.js + Express + MongoDB (`server/`)
- **Reverse Proxy**: Nginx (`nginx/`)
- **Process Manager**: PM2 (`ecosystem.config.js`)

Core domains handled by the product:

- Authentication and protected routes
- Properties management
- Customers management
- Opportunities pipeline
- Calendar/events and exports
- Media uploads via Cloudinary

---

## 2) Main Incident Summary

### User symptom

- Login in browser failed repeatedly.
- API looked unstable from frontend perspective.

### What was confirmed early

- Backend login endpoint itself can be valid when called correctly.
- Example successful API call:

```bash
curl -i -X POST "https://housecrm.everup.net/api/auth/login" \
  -H "Content-Type: application/json" \
  --data '{"email":"admin@example.com","password":"admin123"}'
```

### High-level root cause chain

The outage was multi-factor, not a single bug:

1. **Incorrect request path was used initially** (`//api/auth/login`) causing route miss (`Cannot POST //api/auth/login`).
2. **Frontend/API base URL drift** introduced hardcoded host/port behavior in API service.
3. **PM2 process drift** introduced duplicate/conflicting process states.
4. **Backend runtime drift** introduced server binding and startup inconsistencies.
5. **Nginx upstream protocol mismatch** (`https://` to an HTTP backend) caused persistent `502 Bad Gateway` and TLS handshake failures.

Final blocker was #5.

---

## 3) Forensic/Recovery Workflow Performed

### A) Server snapshot + branch recovery

- Server state was captured and pushed to a dedicated branch:
  - `server-recovery-2026-03-19`
- This enabled side-by-side diffing and safe rollback strategy.

### B) Local investigation branch

- Local branch aligned to recovery snapshot:
  - `investigate/server`

### C) Focused diffing on auth/runtime files

Primary files analyzed deeply:

- `frontend/src/services/api.ts`
- `frontend/vite.config.ts`
- `server/index.js`
- `ecosystem.config.js`
- Nginx live config at `/etc/nginx/sites-enabled/crm-realstate.conf`

---

## 4) Concrete Technical Findings

### Finding 1: API path malformed (`//api/...`)

- Directly resulted in Express route mismatch.
- Correct endpoint path is `/api/auth/login`.

### Finding 2: Frontend API URL composition regressed

- `frontend/src/services/api.ts` had drift introducing host+port composition and widespread replacements.
- Stabilized to normalized relative API base behavior.

### Finding 3: PM2 process confusion

- Multiple historical process names (`index`, `crm-backend`, `crm-frontend`) caused conflicting assumptions.
- Recovery included stop/delete/start clean cycle.

### Finding 4: Backend runtime behavior drifted

- Backend was at different times configured with custom dual HTTP/HTTPS logic and nonstandard behavior.
- Stabilized to predictable backend listener mode behind Nginx.

### Finding 5: Final and decisive cause — Nginx upstream protocol mismatch

- Effective Nginx upstream attempted TLS to backend:
  - `upstream: "https://127.0.0.1:5432/..."`
- Backend served HTTP on 5432.
- This produced SSL handshake errors and `502` responses.
- Fixed by using:

```nginx
proxy_pass http://127.0.0.1:5432;
```

---

## 5) Key Commands Used During Recovery

> Note: commands below are documented as executed patterns; exact sequences varied during diagnosis.

### PM2 cleanup and restart

```bash
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js --update-env
pm2 save
pm2 flush
pm2 ls
```

### Backend direct health verification

```bash
ss -ltnp | grep -E ':5432|:5001|:5431'
curl -i http://127.0.0.1:5432/health
curl -i http://206.81.28.127:5432/health
```

### Nginx effective config verification

```bash
nginx -T | grep -nE 'server_name|location /api|proxy_pass'
tail -n 80 /var/log/nginx/error.log
```

### Nginx protocol correction

```bash
sed -i -E 's#proxy_pass[[:space:]]+https://(localhost|127\.0\.0\.1):5432;#proxy_pass http://127.0.0.1:5432;#g' /etc/nginx/sites-available/crm-realstate.conf /etc/nginx/sites-enabled/crm-realstate.conf
nginx -t && systemctl restart nginx
```

### Final API confirmation

```bash
curl -i -X POST "https://housecrm.everup.net/api/auth/login" \
  -H "Content-Type: application/json" \
  --data '{"email":"admin@example.com","password":"admin123"}'
```

Result: `HTTP/1.1 200 OK` with token payload.

---

## 6) Files Changed in This Recovery Window (Repo)

Primary code/config changes were made in:

- `frontend/src/services/api.ts`
- `frontend/vite.config.ts`
- `server/index.js`
- `ecosystem.config.js`

Operational config changes were made on server in Nginx active config:

- `/etc/nginx/sites-enabled/crm-realstate.conf`
- `/etc/nginx/sites-available/crm-realstate.conf` (consistency pass)

---

## 7) Current Stable Runtime State (Validated)

At the end of recovery:

- `crm-backend` online in PM2
- `crm-frontend` online in PM2
- Backend health endpoint returns 200
- Domain login API returns 200 + JWT token
- Nginx successfully proxies `/api` to backend over HTTP loopback

---

## 8) Residual Risks / Not Yet Fully Refactored

These did not block immediate recovery but should be addressed next:

1. Some historical config drift remains possible between server and repository defaults.
2. Nginx available/enabled file divergence risk should be removed permanently.
3. `.env` hygiene and secret management must be tightened.
4. PM2 process naming and startup source-of-truth should be standardized.
5. Optional: simplify frontend deployment (serve built static from Nginx directly) to reduce moving parts.

---

## 9) Recommended Permanent Guardrails

1. **Single source of truth for deployment**
   - Version control all runtime configs used in production.

2. **CI sanity checks before deploy**
   - Validate frontend build, backend startup, and route smoke tests.

3. **Nginx lint + smoke test script**
   - Test `/health` and `/api/auth/login` against local upstream before reload.

4. **PM2 startup discipline**
   - Use only `ecosystem.config.js`; avoid ad hoc process names.

5. **Environment separation**
   - Keep backend secrets in server env only.
   - Keep frontend env strictly `VITE_*` non-secret values.

---

## 10) Useful Quick-Check Runbook (Post-Reboot)

```bash
pm2 ls
curl -i http://127.0.0.1:5432/health
nginx -t
curl -i -X POST "https://housecrm.everup.net/api/auth/login" -H "Content-Type: application/json" --data '{"email":"admin@example.com","password":"admin123"}'
```

Expected:

- PM2 apps online
- Backend `/health` => `200`
- Nginx test successful
- Login endpoint => `200` with token JSON

---

## 11) Branch/History Context

Recovery branch lineage (recent):

- `fix(server): update server configuration for improved API handling and health check endpoint`
- `fix(auth): restore relative API base URL for production`
- `Server snapshot before recovery`

Working branch used for investigation and stabilization:

- `investigate/server`

---

## 12) Final Outcome

The login incident was resolved end-to-end.  
The system is now reachable, API-authenticated, and operational under Nginx + PM2.

This report captures the full troubleshooting narrative and operational decisions so future maintenance can proceed from a known-good baseline.
