# 0001 — Authority by tool existence, not by a runtime permission check

Status: accepted · 2026-08-31

## Context

`estimate_overlap` crosses an origin boundary and returns data derived from another
company's first-party rows. It must not be callable without both operators' consent.

The conventional implementation registers the tool always and checks a flag inside
`execute`. That leaves the tool in the agent's tool list before consent: its name and
description sit in the model's context, and the gate becomes a negotiation the model
can be argued out of — by a confused user, or by injected text asserting consent was
already granted. The refusal message is itself an oracle.

## Decision

Do not register the tool until consent is granted. `request_partner_consent` puts an approval
modal in front of the operator and, on grant, calls `registerTool` with
`{signal: controller.signal}`. `revoke_partner_consent` aborts that
signal, which unregisters the tool. Each transition fires `toolchange`.

## Consequences

- Before consent the capability is absent from `getTools()`. There is no name to guess
  and no error to probe. Prompt injection cannot call a tool that does not exist.
- Revocation is real removal, not a flag flip.
- Agents caching a tool list can go stale; `toolchange` is the mitigation, and the
  browser mediates `executeTool` against current registration regardless.
- This is the submission's central claim, so it is on the never-cut list in SPEC §8.

## Amendment, 2026-09-01

The original implementation called `client.requestUserInteraction()` from the execute
callback's second argument. Testing against Chrome 152 showed that argument is
`undefined` and the method exists on no receiver, so that code path threw. Consent now
uses an in-page modal resolved inside the tool call, which is also visible on camera and
stylable — a native `confirm()` was neither. The decision above is unchanged; only the
dialog mechanism moved.

## Alternatives rejected

- **Runtime flag inside `execute`** — rejected above.
- **`exposedTo` toggling alone** — governs which origins see a tool, not whether the
  local agent may invoke it. Wrong axis for operator consent.
