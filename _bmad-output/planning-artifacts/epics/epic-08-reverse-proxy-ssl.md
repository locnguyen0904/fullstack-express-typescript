---
epic: 8
title: Production Reverse Proxy and SSL
status: done
priority: MEDIUM
stories: 2
dependencies: None
source: technical-docker-compose-volumes-best-practices-research-2026-02-09.md
frs_covered: [FR7]
---

# Epic 8: Production Reverse Proxy and SSL

Operators can expose the application securely to the internet with SSL/TLS termination, proper request routing, and a foundation for future horizontal scaling.

## Story 8.1: Add Nginx Reverse Proxy Service

As an **operator**,
I want an nginx reverse proxy in the production compose configuration,
So that all traffic is routed through a single entry point with proper request forwarding to backend and frontend services.

**Acceptance Criteria:**

**Given** the production compose file
**When** an `nginx` service is added with a custom configuration
**Then** nginx listens on port 80 and 443
**And** requests to `/api/*` are proxied to the `backend` service on port 3000
**And** all other requests are proxied to the `frontend` service on port 80
**And** proper proxy headers are set (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`)

**Given** the nginx service is running
**When** backend or frontend services are accessed directly (not through nginx)
**Then** only nginx exposes host ports; backend and frontend ports are internal-only in production

**Given** the nginx configuration file
**When** it is stored in `compose/nginx/nginx.conf`
**Then** it is mounted as a read-only volume into the nginx container

## Story 8.2: Configure SSL/TLS Termination

As an **operator**,
I want nginx to handle SSL/TLS termination with certificate support,
So that all public traffic is encrypted and the application meets security standards.

**Acceptance Criteria:**

**Given** the nginx reverse proxy service (from Story 8.1)
**When** SSL configuration is added to the nginx config
**Then** port 443 serves HTTPS with TLS 1.2+ enforced
**And** port 80 redirects all HTTP traffic to HTTPS
**And** SSL certificates are mounted as read-only volumes from a configurable host path

**Given** an operator needs to use self-signed certificates for staging
**When** a `generate:ssl-cert` script is added to the root package.json
**Then** a self-signed certificate and key are generated for local/staging testing
**And** the certificate files are added to `.gitignore`

**Given** an operator uses Let's Encrypt or externally managed certificates
**When** certificate files are placed at the expected mount path
**Then** nginx serves traffic using those certificates without container rebuilds
