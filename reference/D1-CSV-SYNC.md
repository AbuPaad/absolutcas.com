# D1 to CSV

`tools/d1-csv-sync.py` reads the mailing list out of the live D1 database and writes it to
CSV files on this machine. It is how the list leaves Cloudflare and reaches Brevo.

> **Location note.** This file lives in `reference/`. Paths in it are relative to the
> repository root, one level up (`tools/…`, `src/…`). The only markdown kept at the repo
> root is `SITE-COPY.md`.

## The three commands

Run from the repository root (`~/musings/paadweb`):

```
python3 tools/d1-csv-sync.py status                 counts only, writes nothing
python3 tools/d1-csv-sync.py dump                   -> subscribers.csv
python3 tools/d1-csv-sync.py brevo                  -> brevo-import.csv
```

### `status`

One line: `total 4   eligible 0   unconfirmed 3   removed 1`. Prints a warning if eligible
ever exceeds the advertised cap of 200.

### `dump` — subscribers.csv

The audit file. Every row in D1, full state, no filtering:

| Column | Meaning |
|---|---|
| `email` | lowercased, unique |
| `created_at` | when they signed up. Never changes. This is the ordering the "first 200" promise depends on. |
| `source` | which form sent it (`landing`, `verify`, …) |
| `consented_at` | the confirm click, empty if never clicked |
| `unsubscribed_at` | the remove click, empty if still subscribed |
| `eligible` | 1 only when consented and not removed |

Sorted by `created_at` ascending, so the file is the claim order.

This is a **snapshot**. Editing or deleting a row in it changes nothing anywhere — the next
`dump` overwrites the file. D1 is the master record and `src/worker.js` is its only writer.

### `brevo` — brevo-import.csv

The upload file: one `EMAIL` column, no state, no tokens. Every address in D1, confirmed
or not.

- `--eligible` — confirmed and unremoved only. This is the double-opt-in subset, and it is
  usually empty because nobody clicks confirm unless the mail is going out.
- `--all` — includes addresses that clicked "remove me" as well.

Default excludes the removed ones. Someone who pressed "remove me" and then receives a
campaign files a spam complaint, and complaints are what get a Brevo account suspended, so
that one is not the default. `--all` overrides when you want literally everything.

## The routine

Every other day:

```
cd ~/musings/paadweb
python3 tools/d1-csv-sync.py brevo
```

Then in Brevo: **Contacts → Import contacts → upload `brevo-import.csv`**, into list #3.
The importer looks for the `EMAIL` header. Re-importing the same file is safe — existing
contacts are matched by address, not duplicated — which is why this can be done on a
schedule without bookkeeping.

`dump` is for when you want to look at the whole thing: who signed up, who confirmed, who
left, in what order.

## Why it is one-directional

D1 is written by the site and nowhere else. These files are read out of it, never written
back. That is deliberate: it means a mistake in a CSV cannot corrupt the master record, and
there is no merge to get wrong. If you want a row gone, remove the contact in Brevo and let
the site's own unsubscribe handle D1.

The site also pushes to Brevo directly (`src/worker.js`): it adds the contact on the confirm
click and deletes it on the remove click. Those calls and this CSV are not in conflict — the
CSV re-pushes the whole set anyway, and the worker's delete covers the gap between your runs.

## Privacy

Both files contain real email addresses, and this repository is public:

- `subscribers.csv` and `brevo-import.csv` are gitignored. Never commit them.
- Never upload `dump` output to Brevo — it carries state columns and the whole history. Use
  the `brevo` file, which is email-only by construction.
- Upload the `brevo` file only to Brevo. It is not a file to paste anywhere else.

## If it breaks

- **`wrangler failed: …` / authentication error** — `npx wrangler whoami`. The script
  shells out to wrangler and needs the same login your terminal has.
- **It returns 0 rows while the site is clearly signing people up** — you are almost
  certainly hitting a different database. This script always passes `--remote`; a bare
  `wrangler d1 execute` without it queries a throwaway local file in `.wrangler/`.
- **`could not parse wrangler output`** — a wrangler upgrade changed its JSON shape. Run the
  query by hand to see it:
  `npx wrangler d1 execute absolutcas-waitlist --remote --json --command "SELECT * FROM subscribers LIMIT 1;"`
- **Counts look wrong** — `status` reads D1 directly, so trust it over any CSV you have open.
