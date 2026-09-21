# Agent Operating System

See `/Documents/Obsidian Vault/Bitfury/agent-os-architecture.md` for full spec.

**6 Agent Seats:**
- MEAT (verify cert, price, find buyers)
- COFFEE (traceability, quality, auctions)
- WHEAT (harvest logs, silo management)
- PRICING (dynamic market pricing)
- COMPLIANCE (origin, batch, trader verification)
- DISCOVERY (buyer-seller matching)

**Stack:**
- Agent OS: Node.js cluster + Redis
- Orchestrator: Naledi Nexus (scheduling + async coordination)
- Data: PostgreSQL + Prisma
- Deployment: GCP Compute + Cloudflare Tunnel

**Data Flow:**
```
Bitfury (source)
   ↓ (webhook: commodity.create)
Global Markets API
   ↓ (queue: commodity.pending)
Agent OS (6 parallel processes)
   ↓ (reports: pricing, compliance, buyers)
Naledi Nexus (aggregates)
   ↓ (DB update: commodity.ready)
Users (tier-filtered view)
```

**Rwanda Deployment:**
- Local Agent OS (6 seats, 1 server)
- Local PostgreSQL + Redis
- Cloudflare Tunnel → markets.studex.group
- Data stays in Rwanda, access is global

**Status:** Ready to deploy

See BITFURY-INTEGRATION.md for webhook spec.
