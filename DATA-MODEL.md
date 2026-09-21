# Studex Global Markets — Settlement Exchange Data Model

Target: Supabase (Postgres). The arrays in `index.html` are shaped 1:1 with these
tables so the front end can be switched from hardcoded constants to `fetch()`
without touching the render functions.

Design rule running through the whole schema: **screening is a gate, not a
column of the counterparty row.** It is a time-stamped event, re-run per
shipment, and it blocks the contract state machine. A counterparty is never
"permanently cleared."

---

## 1. `counterparties`

| column | type | notes |
|---|---|---|
| `id` | `uuid` pk | |
| `legal_name` | `text` not null | as written on the contract |
| `trading_name` | `text` | |
| `country` | `char(2)` not null | ISO-3166 alpha-2 |
| `city` | `text` | |
| `role` | `cp_role` not null | enum below |
| `desks` | `desk[]` not null | a supplier can serve several |
| `restricted_jurisdiction` | `bool` not null default false | drives rail assignment |
| `deal_ability` | `numeric(3,2)` | 0.00–1.00, nullable — most are unscored |
| `pipeline_stage` | `stage` not null | enum below |
| `contact_email` | `text` | |
| `contact_name` | `text` | |
| `notes` | `text` | |
| `created_at` / `updated_at` | `timestamptz` | |

```sql
create type cp_role as enum
  ('producer','exporter','supplier','buyer','broker','logistics',
   'regulator','consortium','own_vertical','market_maker');

create type desk as enum ('coffee','meat','grain','wheat');

create type stage as enum
  ('prospect','contacted','quoting','negotiating','contracted','shipping');
```

`deal_ability` is deliberately nullable. Only entities with a completed
assessment carry a score; everything else renders as *not scored*. Do not
default it to 0.5 — a fabricated midpoint is worse than an honest blank.

---

## 2. `screening_events`

The compliance spine. Append-only; never updated in place.

| column | type | notes |
|---|---|---|
| `id` | `uuid` pk | |
| `counterparty_id` | `uuid` fk | |
| `contract_id` | `uuid` fk null | null = relationship-level baseline |
| `lists_checked` | `text[]` not null | `{OFAC_SDN, EU_CONSOLIDATED, UK_HMT}` |
| `beneficial_ownership_checked` | `bool` not null | 50%-rule ownership trace |
| `result` | `screen_result` not null | `clear` / `hit` / `pending` |
| `hit_detail` | `jsonb` | matched entity, list, score |
| `screened_by` | `text` not null | agent id or human |
| `screened_at` | `timestamptz` not null | |
| `expires_at` | `timestamptz` not null | default `screened_at + 90 days` |

```sql
create type screen_result as enum ('clear','hit','pending');
```

A contract cannot leave state `04_screening` without a `screening_events` row
where `result = 'clear'`, `contract_id` is this contract, and `expires_at > now()`.
Enforce it in a database trigger, not in application code — the whole point is
that it cannot be skipped by a fast-moving agent.

---

## 3. `corridors`

| column | type | notes |
|---|---|---|
| `id` | `text` pk | e.g. `RW-RU` |
| `title` | `text` not null | |
| `nodes` | `text[]` not null | ordered: origin → transit → discharge |
| `origin_country` / `dest_country` | `char(2)` | |
| `desks` | `desk[]` not null | |
| `incoterms` | `text[]` not null | `{FOB,CIF}` |
| `lead_time_days` | `int4range` | |
| `rail` | `rail` not null | **assigned here, never on the lot** |
| `intermediary_fee_pct` | `numeric(4,2)` | e.g. 2.50 for the Gulf leg |
| `notes` | `text` | |

```sql
create type rail as enum ('A','B');
```

Rail lives on the corridor because it is the **jurisdiction** that decides how
money may move, not the commodity. Add a check constraint: any corridor whose
origin or destination country is flagged restricted must be rail `B`.

---

## 4. `lots`

| column | type | notes |
|---|---|---|
| `id` | `text` pk | e.g. `RW-A1-001` |
| `desk` | `desk` not null | |
| `corridor_id` | `text` fk not null | rail derives from this |
| `seller_id` | `uuid` fk → counterparties | |
| `name` | `text` not null | |
| `origin_label` | `text` | display string |
| `price_low` / `price_high` | `numeric(12,4)` null | null = price on application |
| `price_unit` | `text` | `kg` / `MT` |
| `price_currency` | `char(3)` | |
| `price_basis` | `text` not null | `FOB` / `CIF` / `FCA` / `Landed` |
| `specs` | `jsonb` not null | ordered `[{k,v}]` — heterogeneous by desk |
| `capacity_mt_month` | `numrange` | |
| `moq_mt` | `numeric(10,2)` | |
| `pipeline_stage` | `stage` not null | |
| `container_ref` | `text` | `CONT-002` |

`specs` is `jsonb` on purpose. A coffee lot carries screen size, cup score and
defect count; an oat lot carries moisture, impurity and grain size; a poultry
lot carries almost nothing until the supplier quotes. Forcing those into shared
columns produces a table that is 70% null.

**Coffee grading** is the one place worth a lookup table, because it is a real
published scale and the mapping drives price:

## 5. `coffee_grades`

| grade | screen_mesh | cup_score | defects | fob_low | fob_high | buyer_tier |
|---|---|---|---|---|---|---|
| A1 | 18+ | 86+ | 0–5 | 7.50 | 12.00 | 5 |
| A2 | 16–18 | 84–85 | 5–10 | 5.50 | 8.00 | 3 |
| A3 | 15–16 | 82–83 | 10–15 | 4.50 | 6.00 | 2 |
| FAQ | 14–15 | 80–82 | 15–25 | 3.50 | 5.00 | 1 |

NAEB scale. 18 mesh = 7.14 mm, 15 mesh = 6.0 mm. USD/kg FOB.

---

## 6. `contracts`

The state machine. One row per trade.

| column | type | notes |
|---|---|---|
| `id` | `uuid` pk | |
| `ref` | `text` unique | human ref |
| `lot_id` | `text` fk | |
| `buyer_id` / `seller_id` | `uuid` fk | |
| `corridor_id` | `text` fk | |
| `state` | `contract_state` not null | enum below |
| `quantity_mt` | `numeric(12,3)` not null | |
| `price` | `numeric(12,4)` not null | agreed, not indicative |
| `currency` | `char(3)` not null | |
| `incoterm` | `text` not null | |
| `instrument` | `instrument` | LC / TT / intermediary / on-chain escrow |
| `documents` | `jsonb` | `{bl, coo, phyto, gost, halaal, inspection}` |
| `inspector` | `text` | SGS / Bureau Veritas |
| `signed_at` / `shipped_at` / `settled_at` | `timestamptz` | |

```sql
create type contract_state as enum
  ('01_enquiry','02_offer','03_contract','04_screening','05_instrument',
   '06_documents','07_shipment','08_inspection','09_discharge','10_settlement');

create type instrument as enum
  ('letter_of_credit','telegraphic_transfer','gulf_intermediary','onchain_escrow');
```

Instrument sizing (Rail B), from the origination files:

- above $200K → letter of credit
- $100K–500K → Gulf intermediary (AED→USD), 2.5% fee
- below $50–100K → telegraphic transfer

---

## 7. `settlement_instructions`

| column | type | notes |
|---|---|---|
| `id` | `uuid` pk | |
| `contract_id` | `uuid` fk | |
| `rail` | `rail` not null | copied from corridor at contract time, immutable |
| `amount` / `currency` | `numeric(14,2)` / `char(3)` | |
| `onchain_tx` | `text` | Base tx hash, rail A only |
| `stdx_credit` | `numeric(14,4)` | internal unit |
| `bank_ref` | `text` | rail B only |
| `released_against` | `text` | inspection certificate ref |
| `status` | `text` | `pending` / `released` / `settled` / `failed` |

Constraint: `rail = 'A'` rows must have null `bank_ref`; `rail = 'B'` rows must
have null `onchain_tx`. A settlement instruction that carries both is a bridged
payment, and bridging a restricted-jurisdiction payment onto stablecoin rails is
the exact pattern regulators treat as evasion. Make it structurally impossible
rather than a policy in a document nobody reads.

---

## Row-level security

- `counterparties`, `lots`, `corridors` — readable by authenticated members.
- `screening_events` — compliance role only. Agents may **insert**, never update
  or delete.
- `contracts`, `settlement_instructions` — parties to the contract plus
  compliance.
- Nothing is public-readable. The board page shipped to partner entities renders
  from a curated view, not the base tables.

## Open items before this goes live

1. FSCA crypto-asset service provider licensing on the South African leg.
2. SARB exchange-control reporting on every cross-border flow.
3. A screening data source. The lists are free; a usable API is not. Budget for
   one, or the gate is a checkbox rather than a control.
4. Beneficial-ownership tracing to the 50% rule — the part that catches what a
   name-match screen misses.
