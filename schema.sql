-- absolutcas.com — mailing list infrastructure
-- D1 database: absolutcas-waitlist
--
-- One table. The Worker in src/worker.js is the only writer.
--
-- Column roles:
--   created_at      when the address was submitted. This is the ordering used by the
--                   "first 200" promise, so it is set on insert and never updated.
--   token           opaque per-subscriber secret. Used for the confirm link, the
--                   unsubscribe link, and nothing else. Never exposed in a listing.
--   consented_at    set when the confirm link is clicked. This is both the consent
--                   record and the "$5 wanted" flag. NULL means unconfirmed.
--   unsubscribed_at set when the unsubscribe link is clicked. A non-NULL value wins
--                   over everything: no send may ignore it.
--   order_id        Crowd Supply order reference, supplied by the subscriber at claim
--                   time. NULL until they claim.
--   claimed_at      when a claim was accepted. One claim per row.
--   key_issued_at   when the OpenRouter key was actually handed over. Kept separate
--                   from claimed_at so a failed issue can be retried.
--
-- There is no `email_sent` column on purpose. Send state belongs to Brevo, not here;
-- this table answers "is this address allowed to be mailed", not "was it mailed".

CREATE TABLE IF NOT EXISTS subscribers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT    NOT NULL UNIQUE,
  created_at      TEXT    NOT NULL,
  source          TEXT,
  token           TEXT    NOT NULL UNIQUE,
  consented_at    TEXT,
  unsubscribed_at TEXT,
  order_id        TEXT,
  claimed_at      TEXT,
  key_issued_at   TEXT
);

-- The claim endpoint and the "first 200" check both page by signup order.
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at   ON subscribers(created_at);
-- The broadcast list is "consented and not unsubscribed".
CREATE INDEX IF NOT EXISTS idx_subscribers_consented_at ON subscribers(consented_at);
