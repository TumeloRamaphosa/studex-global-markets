# Studex Global Markets

**B2B Commodity Trading Platform**  
AI-powered discovery and trading for African premium commodities: Wagyu beef, specialty coffee, and wheat.

## Architecture

- **Frontend:** Next.js 14 → Cloudflare Pages (free tier)
- **Backend:** Node.js with Next.js API routes
- **Database:** PostgreSQL (Cloud SQL on GCP)
- **Auth:** NextAuth.js + Google OAuth
- **Payments:** Stripe (5-tier SaaS model)
- **AI Orchestration:** Naledi Nexus agents
- **Integrations:** Bitfury webhook bridge

## 5-Tier Access

| Tier | Price | Commodities | Verticals |
|------|-------|-------------|-----------|
| Aspire | $99/mo | 10 | 1 |
| Engage | $299/mo | 50 | 2 |
| Scale | $999/mo | 500+ | 3 |
| Elite | $2,500/mo | 5,000+ | 3 |
| Ghost | Custom | Unlimited | 3 |

## Deploy

```bash
git push origin main  # Auto-deploys to Cloudflare Pages
```

---
**Built with:** Claude Code | **Last:** Sep 21, 2026
