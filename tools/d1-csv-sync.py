#!/usr/bin/env python3
"""D1 -> CSV, for auditing the mailing list and importing it into Brevo.

    python3 tools/d1-csv-sync.py dump     subscribers.csv     full state, for your audit
    python3 tools/d1-csv-sync.py brevo    brevo-import.csv    every address in D1, Brevo format
    python3 tools/d1-csv-sync.py status                       one-line counts

brevo exports every address in D1, confirmed or not. Add --eligible to export only confirmed,
unremoved rows, or --all to include addresses that clicked "remove me" as well.

One direction only, on purpose. D1 is written by the site (src/worker.js) and nowhere else;
these files are a snapshot of it. Editing a CSV does not change the list, so auditing can
never corrupt the master record.

Both files contain real email addresses. They are gitignored. Never commit them, and never
upload `dump` output to Brevo - use the `brevo` file, which is email-only.

Brevo import: Contacts -> Import contacts -> upload brevo-import.csv. The EMAIL header is
what it looks for. Re-importing is safe; existing contacts are matched by address.
"""

import argparse
import csv
import json
import subprocess
import sys
from pathlib import Path

DB = "absolutcas-waitlist"
ROOT = Path(__file__).resolve().parent.parent

# Ordering is created_at ascending because that is the "first 200" order the $5 credit
# promise depends on. Do not change it casually.
QUERY = """
SELECT email,
       created_at,
       source,
       COALESCE(consented_at, '')                          AS consented_at,
       COALESCE(unsubscribed_at, '')                       AS unsubscribed_at,
       (consented_at IS NOT NULL AND unsubscribed_at IS NULL) AS eligible
FROM subscribers
ORDER BY created_at ASC
"""


def query_remote(sql):
    """Run SQL against the live D1 and return the rows."""
    proc = subprocess.run(
        ["npx", "wrangler", "d1", "execute", DB, "--remote", "--json", "--command", sql],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        sys.exit(f"wrangler failed:\n{proc.stderr.strip()}")
    try:
        return json.loads(proc.stdout)[0]["results"]
    except (json.JSONDecodeError, KeyError, IndexError):
        sys.exit(f"could not parse wrangler output:\n{proc.stdout[:800]}")


def cmd_dump(args):
    rows = query_remote(QUERY)
    out = Path(args.out)
    with out.open("w", newline="") as fh:
        writer = csv.DictWriter(
            fh, fieldnames=["email", "created_at", "source", "consented_at", "unsubscribed_at", "eligible"]
        )
        writer.writeheader()
        writer.writerows(rows)
    print(f"{len(rows)} rows -> {out}")
    print_summary(rows)


def cmd_brevo(args):
    """The import file: every address in D1, one EMAIL column, no state, no tokens.

    Default is everyone except the addresses that clicked "remove me" - those asked not to
    be mailed, and a campaign reaching them is a spam complaint, which is what gets a Brevo
    account suspended. --all includes them anyway.
    """
    rows = query_remote(QUERY)
    if args.all:
        selected = rows
    elif args.eligible:
        selected = [r for r in rows if r["eligible"]]
    else:
        selected = [r for r in rows if not r["unsubscribed_at"]]
    out = Path(args.out)
    with out.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["EMAIL"])
        writer.writerows([r["email"]] for r in selected)
    print(f"{len(selected)} addresses -> {out}")
    print("Import into Brevo list #3: Contacts -> Import contacts. Re-importing is safe.")
    print_summary(rows)
    skipped = sum(1 for r in rows if r["unsubscribed_at"])
    if not args.all and skipped:
        print(f"  left out {skipped} that clicked remove (--all overrides).")


def cmd_status(args):
    print_summary(query_remote(QUERY))


def print_summary(rows):
    eligible = sum(1 for r in rows if r["eligible"])
    unconfirmed = sum(1 for r in rows if not r["consented_at"] and not r["unsubscribed_at"])
    removed = sum(1 for r in rows if r["unsubscribed_at"])
    print(f"  total {len(rows)}   eligible {eligible}   unconfirmed {unconfirmed}   removed {removed}")
    if eligible > 200:
        print("  WARNING: eligible now exceeds the advertised cap of 200.")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("dump", help="full state -> CSV (for auditing)")
    p.add_argument("out", nargs="?", default="subscribers.csv")
    p.set_defaults(func=cmd_dump)

    p = sub.add_parser("brevo", help="every address in D1 -> Brevo import CSV")
    p.add_argument("out", nargs="?", default="brevo-import.csv")
    p.add_argument("--eligible", action="store_true", help="confirmed and unremoved only")
    p.add_argument("--all", action="store_true", help="include addresses that clicked remove")
    p.set_defaults(func=cmd_brevo)

    p = sub.add_parser("status", help="counts only")
    p.set_defaults(func=cmd_status)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
