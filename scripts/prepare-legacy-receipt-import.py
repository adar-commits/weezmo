#!/usr/bin/env python3
"""Transform legacy receipts CSV → NDJSON + SQL batches for Supabase import.

Usage:
  python3 scripts/prepare-legacy-receipt-import.py /path/to/receipts.csv

Outputs (gitignored):
  scripts/import-legacy-receipts.ndjson
  scripts/import-batches/batch_XXXX.sql
"""

from __future__ import annotations

import csv
import json
import os
import shutil
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "scripts" / "import-legacy-receipts.ndjson"
BATCH_DIR = ROOT / "scripts" / "import-batches"

BRANCH_NAMES = {
    "1000": "ראשון לציון",
    "10000": "איירפורט סיטי",
    "12000": 'סגולה פ"ת',
    "14000": "באר שבע",
    "5000": "נתניה",
    "7000": "בני ברק",
    "800": "ירכא",
    "9000": "קרית אתא",
    "3000": "אתר אינטרנט",
    "6000": "עסקאות טלפוניות",
}
NAME_TO_ID = {v: k for k, v in BRANCH_NAMES.items()}

SKIP_EXISTING = {
    ("IN264004805", "חשבונית מס"),
    ("RC269016418", "קבלה"),
    ("RC269016419", "קבלה"),
    ("RC269016420", "קבלה"),
    ("RC269016421", "קבלה"),
    ("RC269016422", "קבלה"),
}

BATCH_SIZE = 80


def to_num(v: str | None):
    s = (v or "").strip()
    if s == "":
        return None
    try:
        return float(s) if ("." in s or "e" in s.lower()) else int(s)
    except ValueError:
        try:
            return float(s)
        except ValueError:
            return None


def db_type(display: str) -> str:
    if not display:
        return "receipt"
    t = display.lower()
    if "חשבונית" in display or "invoice" in t:
        return "invoice"
    if "משלוח" in display or "delivery" in t:
        return "delivery_note"
    return "receipt"


def parse_ts(s: str | None):
    s = (s or "").strip()
    if not s:
        return None
    try:
        if s.endswith("Z"):
            return datetime.fromisoformat(s.replace("Z", "+00:00"))
        return datetime.fromisoformat(s)
    except Exception:
        return None


def build_items(r: dict) -> list[dict]:
    items = []
    for i in range(45):
        desc = (r.get(f"Items[{i}].ItemDescription") or "").strip()
        sku = (r.get(f"Items[{i}].ItemSKU") or "").strip()
        qty = to_num(r.get(f"Items[{i}].ItemQTY"))
        price = to_num(r.get(f"Items[{i}].ItemPrice"))
        if desc == "" and sku == "" and qty is None and price is None:
            continue
        items.append(
            {
                "ItemDescription": desc,
                "ItemSKU": sku,
                "ItemQTY": qty if qty is not None else 0,
                "ItemPrice": price if price is not None else 0,
            }
        )
    return items


def normalize_bid(raw: str | None, desc: str | None) -> str:
    bid = (raw or "").strip()
    if bid:
        try:
            bid = str(int(float(bid)))
        except ValueError:
            pass
    if not bid:
        bid = NAME_TO_ID.get((desc or "").strip(), "")
    return bid


def richness(r: dict) -> int:
    items = build_items(r)
    score = len(items) * 10
    if (r.get("BranchID") or "").strip():
        score += 5
    if (r.get("CustomerPhone") or "").strip():
        score += 2
    if (r.get("CustomerName") or "").strip():
        score += 1
    if (r.get("type") or "").strip():
        score += 1
    return score


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: prepare-legacy-receipt-import.py /path/to/receipts.csv", file=sys.stderr)
        return 2
    csv_path = Path(sys.argv[1])
    if not csv_path.is_file():
        print(f"CSV not found: {csv_path}", file=sys.stderr)
        return 2

    best: dict = {}
    with csv_path.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            inv = (r.get("InvoiceNumber") or "").strip()
            typ = (r.get("type") or "").strip()
            legacy = (r.get("_id") or "").strip()
            key = (inv, typ) if inv else (f"legacy:{legacy}", typ)
            upd = (
                parse_ts(r.get("updatedAt"))
                or parse_ts(r.get("createdAt"))
                or datetime.min.replace(tzinfo=timezone.utc)
            )
            rich = richness(r)
            prev = best.get(key)
            if prev is None or (upd, rich) >= (prev[0], prev[1]):
                best[key] = (upd, rich, r)

    rows_out = []
    skipped_existing = 0
    for _key, (upd, _rich, r) in best.items():
        inv = (r.get("InvoiceNumber") or "").strip()
        typ = (r.get("type") or "").strip()
        if (inv, typ) in SKIP_EXISTING:
            skipped_existing += 1
            continue
        items = build_items(r)
        bid = normalize_bid(r.get("BranchID"), r.get("BranchDesc"))
        bname = BRANCH_NAMES.get(bid) or ((r.get("BranchDesc") or "").strip() or None)
        created = parse_ts(r.get("createdAt")) or upd
        total = to_num(r.get("TotalPrice"))
        vat = to_num(r.get("VAT"))
        discount = to_num(r.get("discount"))
        payload = {
            "template_id": "receipt",
            "InvoiceNumber": inv or None,
            "BranchID": bid or None,
            "PrintDate": (r.get("PrintDate") or "").strip() or None,
            "SalesRepresentative": (r.get("SalesRepresentative") or "").strip() or None,
            "CustomerName": (r.get("CustomerName") or "").strip() or None,
            "CustomerPhone": (r.get("CustomerPhone") or "").strip() or None,
            "CustomerEmail": (r.get("CustomerEmail") or "").strip() or None,
            "Items": items,
            "TotalPrice": total if total is not None else 0,
            "type": typ or None,
            "paymentType": (r.get("paymentType") or "").strip() or None,
            "discount": discount,
            "VAT": vat,
            "legacy_mongo_id": (r.get("_id") or "").strip() or None,
            "imported_from": "legacy_csv",
        }
        if bname:
            payload["BranchName"] = bname
        payload = {
            k: v for k, v in payload.items() if v is not None or k in ("Items", "TotalPrice")
        }
        cc = (r.get("coupons[0].couponCode") or "").strip()
        if cc:
            payload["coupons"] = [
                {
                    "couponCode": cc,
                    "couponValue": to_num(r.get("coupons[0].couponValue")),
                }
            ]
        rows_out.append(
            {
                "type": db_type(typ),
                "template_id": "receipt",
                "created_at": created.isoformat(),
                "branch_id": bid or None,
                "customer_name": payload.get("CustomerName"),
                "customer_phone": payload.get("CustomerPhone"),
                "payload": payload,
            }
        )

    OUT_PATH.write_text(
        "\n".join(json.dumps(row, ensure_ascii=False) for row in rows_out) + "\n",
        encoding="utf-8",
    )

    shutil.rmtree(BATCH_DIR, ignore_errors=True)
    BATCH_DIR.mkdir(parents=True, exist_ok=True)
    for i in range(0, len(rows_out), BATCH_SIZE):
        chunk = rows_out[i : i + BATCH_SIZE]
        payload = json.dumps(chunk, ensure_ascii=False)
        tag = "wzm"
        while f"${tag}$" in payload:
            tag += "x"
        sql = (
            "insert into documents (type, template_id, created_at, branch_id, customer_name, customer_phone, payload)\n"
            "select type, template_id, created_at::timestamptz, branch_id, customer_name, customer_phone, payload\n"
            f"from jsonb_to_recordset(${tag}${payload}${tag}::jsonb) as x(\n"
            "  type text, template_id text, created_at text, branch_id text, customer_name text, customer_phone text, payload jsonb\n"
            ");"
        )
        (BATCH_DIR / f"batch_{i // BATCH_SIZE:04d}.sql").write_text(sql, encoding="utf-8")

    bids = Counter(r.get("branch_id") or "(none)" for r in rows_out)
    print(
        f"rows={len(rows_out)} skipped_existing={skipped_existing} "
        f"batches={(len(rows_out) + BATCH_SIZE - 1) // BATCH_SIZE}"
    )
    print("branch_id top:", bids.most_common(12))
    print(f"wrote {OUT_PATH}")
    print(f"wrote {BATCH_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
