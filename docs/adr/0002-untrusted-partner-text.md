# 0002 — Treat partner free text as hostile in two independent layers

Status: accepted · 2026-09-01

## Context

Origin B returns free-text segment notes alongside its aggregates. That text is
authored on the other side of a trust boundary and reaches both the model and origin
A's DOM.

`untrustedContentHint` is the spec's answer, but reading the spec closely
(§ Security, "untrusted content"), it is a *signal* permitting a client to sanitize,
spotlight, or hide the payload. It sanitizes nothing itself, and a client may ignore
it. Relying on it alone would make Airlock's central privacy claim depend on the
goodwill of whichever agent shows up.

A second problem: the seed rendered log lines with `insertAdjacentHTML` on
interpolated strings. Once partner text flows through that path, origin B can inject
markup — and script — into origin A. The boundary would leak in the opposite
direction from the one being advertised.

## Decision

Two independent layers, neither sufficient alone:

1. **Annotate.** `untrustedContentHint: true` on every tool whose output carries
   partner-authored free text — `publisher_segment_reach`, `estimate_overlap`,
   `get_receipts` — so a cooperating client can spotlight or strip it. Payloads also
   carry an explicit `partnerNoteTrust` field stating the text is not instructions.
2. **Handle it as hostile regardless.** All partner text is rendered with
   `textContent` into a visually distinct quarantine panel. No HTML sink exists on
   either page; `tools/check.sh` asserts this and fails the build if one appears.

The `sports-fans` note carries a deliberate synthetic prompt-injection string so the
defence is observable rather than asserted.

## Consequences

- The demo shows an injection attempt arriving, being displayed as inert text, and
  changing nothing — because `publisher_export_rows` refuses regardless and
  `estimate_overlap` was never able to return rows.
- `tools/check.sh` must run before any commit that touches rendering.
- Cost: partner text can never be rendered with markup. Acceptable; it is data.
