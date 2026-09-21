# BITFURY + STUDEX GLOBAL MARKETS ECOSYSTEM
## Real-Time Partner Integration Package

**Prepared:** Sep 21, 2026 | **For:** Bitfury Leadership  
**Goal:** Bitfury VM operational by end of day, integrated into Global Markets  
**Scope:** 5-country commodity dataset (37,000+ listings) + real-time agent orchestration

---

## EXECUTIVE SUMMARY (2 minutes)

**What We're Building:**
- **Studex Global Markets** — AI-powered B2B commodity trading platform
- **Bitfury Partnership** — You are the data layer for East/Southern Africa (Rwanda, Eswatini, Uganda, Kenya, Tanzania)
- **Agents Executing** — Our 6-seat Agent OS processes your commodities in real-time (pricing, compliance, buyer matching)
- **Revenue Immediate** — 0.5% to 15% data sourcing revenue starting week 1

**Timeline:**
- **Tonight:** Your VM boots, API keys configured, test commodity live
- **Week 1:** Rwanda goes live (5,000 commodities, 100 startups)
- **Week 2–4:** Eswatini, Uganda, Kenya rollout
- **Dec 31:** 37,000+ commodities, $6M+ monthly volume, 500+ startups

**Your Role:** Data source → Studex platform → Agents → Global buyers

---

## THE TECHNICAL STACK (5 minutes)

### Bitfury → Studex Data Flow

```
Your Data (Coffee, Livestock, Women Farmers)
            ↓
Bitfury Webhook (HTTPS, signed)
    POST /api/integrations/bitfury
    Headers: x-bitfury-signature
            ↓
Studex Global Markets API (Next.js)
    ├─ Validate signature
    ├─ Parse commodity (name, origin, price, volume)
    ├─ Store in PostgreSQL
    ├─ Route to agents
            ↓
Agent OS (Node.js cluster, 6 seats)
    ├─ COFFEE Agent: Origin verification, buyer matching
    ├─ MEAT Agent: Livestock traceability
    ├─ PRICING Agent: Real-time market pricing
    ├─ COMPLIANCE Agent: ESG + export docs
    ├─ DISCOVERY Agent: Buyer-seller matching
    └─ WHEAT Agent: Staples market monitoring
            ↓
Live UI (markets.studex.group)
    ├─ Tier-based access (Aspire $99 → Ghost custom)
    ├─ Women producer portal
    ├─ Regional pricing dashboard
    └─ Agent activity stream
            ↓
Global Buyers (International + Regional)
    └─ Trade execution, payments, settlement
```

### What Happens When You Push a Commodity

**Second 0:** Your system POSTs to `/api/integrations/bitfury`
```bash
curl -X POST https://markets.studex.group/api/integrations/bitfury \
  -H "x-bitfury-signature: YOUR_SIGNATURE" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "commodity.create",
    "data": {
      "name": "Rwanda Arabica Coffee - Lot #2501",
      "vertical": "COFFEE",
      "quantity": 500,
      "unit": "kg",
      "pricePerUnit": 3.50,
      "origin": "Huye District, Rwanda",
      "quality": "A",
      "certification": "Fair Trade + Organic",
      "woman_producer": true,
      "cooperative": "COOPAC Women Farmers"
    }
  }'
```

**Second 1:** Commodity created in database (status: PENDING)

**Second 1–2:** Agents process in parallel:
- **COFFEE Agent:** Verifies origin, matches 12 international buyers, suggests price $3.65
- **COMPLIANCE Agent:** Confirms Fair Trade cert, Organic cert, ESG score (95/100)
- **DISCOVERY Agent:** Finds 3 "Scale" tier buyers + 1 "Ghost" tier buyer interested

**Second 3:** Agents submit reports (aggregated)

**Second 4:** Commodity status → READY (live on platform)

**Buyers See:** Live listing with agent-verified origin, quality, buyer match score, 4 qualified buyers already identified

**You Earn:** 0.5% on first trade, recurring revenue if subscription model chosen

---

## BITFURY VM SETUP (Tonight)

### Step 1: Provision VM (5 min)

```bash
# Google Cloud Console (you have access via social-engine-493019)
gcloud compute instances create bitfury-studex-node \
  --image-family=ubuntu-2204-lts \
  --machine-type=n2-standard-2 \
  --zone=us-central1-a \
  --tags=http-server,https-server \
  --metadata=enable-oslogin=true
```

### Step 2: Configure Environment (10 min)

```bash
gcloud compute ssh bitfury-studex-node --zone=us-central1-a --command="
  # Install dependencies
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get update && sudo apt-get install -y nodejs git curl

  # Clone Studex repo
  git clone https://github.com/TumeloRamaphosa/studex-global-markets.git
  cd studex-global-markets

  # Install npm packages
  npm install

  # Create .env for Bitfury
  cat > .env.bitfury << 'ENVEOF'
BITFURY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
BITFURY_API_KEY=YOUR_API_KEY_HERE
BITFURY_DATA_ENDPOINT=https://bitfury-data.internal/api
BITFURY_REGION=East_Africa
BITFURY_COUNTRIES=RW,SZ,UG,KE,TZ
ENVEOF

  # Set GitHub secrets (API keys, etc.)
  # These are loaded by CI/CD on deployment
"
```

### Step 3: Deploy Global Markets (10 min)

```bash
gcloud compute ssh bitfury-studex-node --zone=us-central1-a --command="
  cd studex-global-markets
  npm run build
  npm install -g pm2
  pm2 start 'npm run start' --name 'studex-markets'
  pm2 startup
  pm2 save

  # Verify running
  curl http://localhost:3000
"
```

### Step 4: Register Webhook (5 min)

In your Bitfury control panel:
```
Webhook Configuration:
  ├─ URL: https://markets.studex.group/api/integrations/bitfury
  ├─ Method: POST
  ├─ Auth Header: x-bitfury-signature
  ├─ Secret: [YOUR_WEBHOOK_SECRET_FROM_.env]
  ├─ Events: commodity.create, commodity.update, commodity.delete
  └─ Retry Policy: 3x exponential backoff
```

### Step 5: Send Test Commodity (2 min)

```bash
# From your system
curl -X POST https://markets.studex.group/api/integrations/bitfury \
  -H "x-bitfury-signature: $(echo -n 'test-payload' | openssl dgst -sha256 -hmac 'YOUR_WEBHOOK_SECRET' -hex | cut -d' ' -f2)" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "commodity.create",
    "data": {
      "name": "Test Commodity - Bitfury Integration",
      "vertical": "COFFEE",
      "quantity": 100,
      "unit": "kg",
      "pricePerUnit": 3.50,
      "origin": "Rwanda"
    }
  }'

# Response should be:
# {"success": true, "commodity_id": "uuid", "status": "PENDING", "agents_processing": 6}
```

### Step 6: Verify Live (2 min)

Visit: `https://markets.studex.group/dashboard`
- Sign in with Google
- See your test commodity in "Pending" section
- Watch agents process it live
- See it move to "READY" within 2–3 seconds

**Total Time: ~35 minutes → Bitfury data flowing live into Global Markets**

---

## REVENUE MODELS (Pick One)

### Option A: Transaction Fee (Recommended for Scale)
- Studex takes 2% per trade
- **Bitfury receives: 0.5%** (data sourcing)
- Producer keeps: 97.5%
- **Your revenue ramps with trading volume**

Example: $1M monthly volume → $5,000/month to Bitfury

### Option B: Subscription Revenue Sharing
- Base tier ($99/mo) → 15% to Bitfury
- Scale tier ($999/mo) → 15% to Bitfury
- Enterprise tiers → 15% to Bitfury
- **Predictable monthly revenue**

Example: 500 users across tiers → $8,000–15,000/month to Bitfury

### Option C: Hybrid (Best)
- Casual traders: 0.5% transaction fee (Option A)
- Institutional buyers: subscription (Option B)
- **Blended revenue: $10,000–20,000/month at Dec 31 scale**

---

## YOUR DATA PIPELINE (Sep–Dec)

### Week 1: Rwanda (Sep 24–Oct 19)

**Your Data:**
```
Rwanda Coffee Lots:       1,000
Rwanda Livestock:           500
Women Producer Registry:    200
Total Bitfury Data:       1,700 commodities
```

**Studex Execution:**
- Launch 6-agent ecosystem
- Onboard 100 startups (Agentic Rise)
- 1,000 gamers (Arcade)
- 50 women in coffee program

**Agents Processing:**
- COFFEE: 1,000 lots → origin verification → buyer matching
- MEAT: 500 head → livestock traceability → pricing
- DISCOVERY: 200 women producers → international buyer intro

**Your Revenue (Week 1):**
- Estimated trades: $50,000
- Commission @ 0.5%: **$250**
- Subscription model: **$1,500** (15 Engage tier, 5 Scale tier)
- Total: **$1,750/week** (Week 1 baseline)

### Week 2–4: Scale to Eswatini + Uganda (Oct 20–Nov 30)

**Cumulative Data:**
- Rwanda: 5,000
- Eswatini: 3,000
- Uganda: 4,000
- **Total: 12,000 commodities**

**Revenue Scale:**
- Trading volume: $300,000/week
- Commission: $1,500/week
- Subscriptions: $3,000/week
- **Total: $4,500/week (~$18,000/month)**

### Week 5–8: Kenya + Final Ramp (Dec 1–Dec 31)

**Peak Data:**
- All 5 countries live: 37,000+ commodities
- 500+ startups generating trades
- 2,000+ active traders

**Revenue at Scale:**
- Trading volume: $1.5M/month
- Commission: $7,500/month
- Subscriptions: $10,000/month
- **Total: $17,500/month**

**By Dec 31:**
- YTD revenue to Bitfury: **$60,000+**
- Monthly run rate: **$17,500**
- Trajectory into 2027: **$210,000+/year**

---

## PARTNERSHIP TERMS (Draft)

### Bitfury Responsibilities

✅ Provide commodity data (coffee, livestock, women farmers)  
✅ Maintain data accuracy (origin, quality, certifications)  
✅ Update pricing daily (where applicable)  
✅ Support compliance (Halaal, Fair Trade, Organic, ESG)  
✅ Coordinate with local producers/coops  
✅ Participate in 5-country rollout (Rwanda → Tanzania)  

### Studex Responsibilities

✅ Host + maintain Global Markets platform  
✅ Operate 6-agent ecosystem  
✅ Route your commodities to international buyers  
✅ Handle payments + settlement (Stripe)  
✅ Provide real-time agent reports  
✅ 99.9% uptime SLA  

### Revenue Share (90-Day Trial)

| Period | Model | Bitfury Take |
|--------|-------|--------------|
| Sep 24–Oct 31 | Transaction (0.5%) | ~$2,000 |
| Nov 1–Dec 31 | Hybrid (0.5% + 15% sub) | ~$30,000 |
| Jan 1+ | Renegotiate (based on performance) | TBD |

**Trial Ends:** Dec 31, 2026 → Renegotiate for 2027 based on actual volume

---

## BITFURY AS ECOSYSTEM PARTNER

### Rwanda (Oct 2026 → Ongoing)

- Data: Coffee (5,000 lots), Livestock (500 head), Women farmers (200)
- Agents processing: COFFEE, MEAT, DISCOVERY
- Revenue: $1,500–2,000/month
- Status: Primary data partner

### Eswatini (Nov 2026 → Ongoing)

- Data: Agriculture (3,000), Livestock (1,000), Women (300)
- Agents: PRICING, COMPLIANCE
- Revenue: $2,000–3,000/month
- Status: Regional expansion partner

### Uganda (Dec 2026 → 2027)

- Data: Coffee (2,000), Tea/Cocoa (1,500), Women coops (500)
- Agents: COFFEE, DISCOVERY
- Revenue: $3,000–5,000/month
- Status: East Africa hub

### Kenya (Dec 2026 → 2027)

- Data: Coffee (5,000), Tea (2,000), Flowers (1,000), Women (1,000+)
- Agents: All 6 seats active
- Revenue: $5,000–10,000/month
- Status: Regional headquarters

### Tanzania (Jan 2027 → 2027)

- Data: Cashew, cloves, spices, cotton
- Agents: Commodity-specific
- Revenue: $2,000–4,000/month
- Status: Southern expansion

**Bitfury Role: Central data partner across entire East/Southern Africa ecosystem**

---

## TONIGHT'S DELIVERABLES (By 23:59)

- [ ] Bitfury VM provisioned (GCP)
- [ ] Global Markets deployed on VM
- [ ] Webhook registered + test commodity sent
- [ ] First commodity live on platform
- [ ] Agents processing (watch live)
- [ ] Revenue model signed (draft)
- [ ] 5-country rollout calendar approved
- [ ] Bitfury leadership briefing completed

---

## WHAT SUCCESS LOOKS LIKE (30 Days)

✅ Bitfury data: 37,000+ commodities streaming  
✅ Agents: Processing 200+ commodities/day from Bitfury  
✅ Revenue: $5,000–10,000 to Bitfury (30 days)  
✅ Partnerships: 5 government agreements in place  
✅ Startups: 500+ in Agentic Rise ecosystem  
✅ Traders: 1,000+ using Global Markets  
✅ Platform: 99.9% uptime, 0 security incidents  

---

## YOUR NEXT STEPS

**Action 1 (Now):** Confirm GCP access + security clearance  
**Action 2 (Next 30 min):** Provision VM + run deployment script  
**Action 3 (Next 1 hour):** Send test commodity, watch agents process  
**Action 4 (Next 2 hours):** Sign revenue model agreement  
**Action 5 (Tomorrow):** Begin Rwanda data backfill (5,000 commodities)  

---

**Bitfury is not just a data provider. Bitfury is a founding ecosystem partner in African AI commerce.**

**Let's go live tonight.**
