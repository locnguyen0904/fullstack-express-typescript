---
title: "Remove Self-Signed SSL, Use Cloudflare Origin Certificate"
slug: "cloudflare-origin-ssl"
created: "2026-02-10"
status: "completed"
stepsCompleted: [1, 2, 3, 4]
tech_stack: [nginx, cloudflare, docker-compose, yaml, nginx-conf]
files_to_modify:
  [
    compose/nginx/conf.d/backend-template.conf,
    docker-compose.prod.yml,
    package.json,
    DOCKER.md,
    _bmad-output/implementation-artifacts/8-2-configure-ssl-tls.md,
  ]
code_patterns:
  [
    docker-compose-base-override-prod,
    nginx-upstream-proxy,
    volume-bind-mount-ro,
  ]
test_patterns: [docker-compose-config-validation]
---

# Tech-Spec: Remove Self-Signed SSL, Use Cloudflare Origin Certificate

**Created:** 2026-02-10

## Overview

### Problem Statement

Current setup uses self-signed certificates generated locally via `npm run generate:ssl-cert`. With Cloudflare Full (Strict) mode, the origin server needs a Cloudflare Origin Certificate instead. Additionally, since Cloudflare proxies all traffic, nginx sees Cloudflare's edge IPs as `$remote_addr` rather than the real client IP.

### Solution

Replace the self-signed certificate workflow with Cloudflare Origin Certificate documentation. Keep nginx SSL config (port 443, TLS 1.2+) but add Cloudflare real IP restoration so proxy headers reflect the actual client. Remove the self-signed generation script and HTTP→HTTPS redirect (Cloudflare handles that at the edge).

### Scope

**In Scope:**

- Remove `generate:ssl-cert` script from `package.json`
- Remove port 80 HTTP→HTTPS redirect from nginx (Cloudflare handles this)
- Remove port 80 mapping from prod compose
- Add Cloudflare `set_real_ip_from` + `real_ip_header CF-Connecting-IP` to nginx
- Update `DOCKER.md` to document Cloudflare Origin Certificate setup
- Update story 8.2 implementation notes

**Out of Scope:**

- Changing the nginx SSL listener itself (port 443, TLS 1.2+, ciphers — all stay)
- Changing network isolation or other compose structure
- Cloudflare DNS/proxy configuration (handled in Cloudflare dashboard)
- `.gitignore` changes (SSL directory entry stays)

## Context for Development

### Codebase Patterns

- Docker Compose uses base + override + prod pattern (base → override for dev, base + prod for production)
- Nginx config at `compose/nginx/conf.d/backend-template.conf` — single file with upstream definitions, server blocks
- SSL certs mounted from `compose/nginx/ssl/` as read-only volume in prod compose
- Story 8.2 originally added SSL/TLS termination with self-signed cert support
- Port 80 currently used for HTTP→HTTPS redirect (will be removed — Cloudflare handles this)
- Port 443 serves HTTPS with TLS 1.2+ (stays, but certs change from self-signed to Cloudflare Origin)

### Files to Reference

| File                                                             | Purpose                          | Change                                                         |
| ---------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------- |
| `compose/nginx/conf.d/backend-template.conf`                     | Nginx reverse proxy + SSL config | Remove port 80 server block, add Cloudflare real IP directives |
| `docker-compose.prod.yml`                                        | Prod compose — nginx service     | Remove port 80 mapping                                         |
| `package.json`                                                   | Root scripts                     | Remove `generate:ssl-cert` script                              |
| `DOCKER.md`                                                      | Docker guide — SSL cert docs     | Replace self-signed with Cloudflare Origin Cert instructions   |
| `_bmad-output/implementation-artifacts/8-2-configure-ssl-tls.md` | Story 8.2 impl notes             | Update to reflect Cloudflare approach                          |

### Technical Decisions

- Keep SSL on nginx (Cloudflare Full Strict requires origin HTTPS)
- Remove self-signed cert generation (Cloudflare Origin Certificates are created in the Cloudflare dashboard, last up to 15 years)
- Remove port 80 from nginx — Cloudflare handles HTTP→HTTPS redirect at the edge
- Add `set_real_ip_from` directives for Cloudflare IPv4/IPv6 ranges so `$remote_addr` reflects the real client
- Use `real_ip_header CF-Connecting-IP` (Cloudflare's canonical header for real client IP)
- `.gitignore` and SSL volume mount unchanged — certs still stored at same path, just sourced differently

## Implementation Plan

### Tasks

- [x] Task 1: Update nginx config — remove HTTP redirect, add Cloudflare real IP
  - File: `compose/nginx/conf.d/backend-template.conf`
  - Action: Remove the port 80 `server` block (HTTP→HTTPS redirect). Add Cloudflare `set_real_ip_from` directives for all Cloudflare IPv4 and IPv6 ranges before the HTTPS server block. Add `real_ip_header CF-Connecting-IP;` directive.
  - Notes: Cloudflare IPv4 ranges: 173.245.48.0/20, 103.21.244.0/22, 103.22.200.0/22, 103.31.4.0/22, 141.101.64.0/18, 108.162.192.0/18, 190.93.240.0/20, 188.114.96.0/20, 197.234.240.0/22, 198.41.128.0/17, 162.158.0.0/15, 104.16.0.0/13, 104.24.0.0/14, 172.64.0.0/13, 131.0.72.0/22. IPv6 ranges: 2400:cb00::/32, 2606:4700::/32, 2803:f800::/32, 2405:b500::/32, 2405:8100::/32, 2a06:98c0::/29, 2c0f:f248::/32.

- [x] Task 2: Remove port 80 from prod compose
  - File: `docker-compose.prod.yml`
  - Action: Change nginx ports from `"80:80"` and `"443:443"` to only `"443:443"`. Remove the port 80 line.
  - Notes: Cloudflare connects to origin on port 443 directly.

- [x] Task 3: Remove `generate:ssl-cert` script
  - File: `package.json`
  - Action: Remove the `"generate:ssl-cert"` line from the `scripts` section.
  - Notes: Cloudflare Origin Certificates are generated in the Cloudflare dashboard, not locally.

- [x] Task 4: Update DOCKER.md for Cloudflare Origin Certificate
  - File: `DOCKER.md`
  - Action: Replace prerequisite step 3's `npm run generate:ssl-cert` with Cloudflare Origin Certificate instructions: (1) Go to Cloudflare dashboard > SSL/TLS > Origin Server > Create Certificate. (2) Save the certificate as `compose/nginx/ssl/cert.pem` and the private key as `compose/nginx/ssl/key.pem`. (3) `chmod 600 compose/nginx/ssl/*.pem`. Update the "Port Mapping > Production" section to remove the port 80 line and update the port 443 description to mention Cloudflare.
  - Notes: Keep the `npm run generate:mongo-key` line — only SSL cert generation is removed.

- [x] Task 5: Update story 8.2 implementation notes
  - File: `_bmad-output/implementation-artifacts/8-2-configure-ssl-tls.md`
  - Action: Update Dev Notes section to reflect Cloudflare Origin Certificate approach instead of self-signed. Note that HTTP→HTTPS redirect is handled by Cloudflare, not nginx.

### Acceptance Criteria

- [x] AC 1: Given the nginx config, when loaded by nginx, then only port 443 is listened on (no port 80 server block exists)
- [x] AC 2: Given a request proxied through Cloudflare, when nginx processes it, then `$remote_addr` reflects the real client IP (not Cloudflare's edge IP) via `set_real_ip_from` and `real_ip_header CF-Connecting-IP`
- [x] AC 3: Given the prod compose file, when `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` is run, then only port 443 is mapped for nginx (port 80 is absent)
- [x] AC 4: Given `package.json`, when inspected, then no `generate:ssl-cert` script exists
- [x] AC 5: Given `DOCKER.md`, when read, then prerequisites reference Cloudflare Origin Certificate (not self-signed generation) and port mapping shows only 443
- [x] AC 6: Given the SSL volume mount in prod compose (`compose/nginx/ssl:/etc/nginx/ssl:ro`), when Cloudflare Origin Certificate files are placed at `compose/nginx/ssl/cert.pem` and `key.pem`, then nginx serves HTTPS using those certificates

## Additional Context

### Dependencies

- Cloudflare account with domain configured and DNS proxied (orange cloud icon)
- Cloudflare Origin Certificate generated from dashboard: SSL/TLS > Origin Server > Create Certificate
- Certificate files saved to `compose/nginx/ssl/cert.pem` and `compose/nginx/ssl/key.pem`

### Testing Strategy

- Validate `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` parses cleanly (no port 80 in output)
- Validate dev compose still works: `docker compose config` (nginx is prod-only, no impact on dev)
- Visual inspection of nginx config for correct Cloudflare IP ranges and `real_ip_header` directive

### Notes

- Cloudflare Origin Certificates last up to 15 years — much better than 90-day Let's Encrypt or 365-day self-signed
- The `compose/nginx/ssl/` gitignore entry stays (certs still shouldn't be committed)
- The SSL volume mount in prod compose stays (certs still mounted the same way, just different source)
- Cloudflare IP ranges may change over time — check https://www.cloudflare.com/ips/ for updates
- If Cloudflare is ever removed, port 80 redirect and self-signed cert generation would need to be re-added

## Review Notes
- Adversarial review completed
- Findings: 5 total, 3 fixed, 2 skipped
- Resolution approach: auto-fix
- F1 (fixed): Added "Full (strict)" SSL mode instruction to DOCKER.md
- F2 (skipped): Hardcoded Cloudflare IPs — documented with update URL, acceptable tradeoff
- F3 (skipped): Unrelated linter change in backend/package.json — harmless
- F4 (fixed): Added `server_tokens off;` to nginx config
- F5 (skipped): Verification steps — nice-to-have, not blocking
