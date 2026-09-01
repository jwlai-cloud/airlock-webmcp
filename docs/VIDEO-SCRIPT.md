# Demo video — script and shot list

Runtime of the captured cut: **1:37**. Limit is 3:00, so there is room to slow any beat.
Re-run `npm run capture` after editing a `cap()` duration in `tools/capture.js`; the whole
cut re-records deterministically in about ninety seconds. No re-shoot.

## Recording the voiceover

Read against the timestamps below. Every beat already carries a burned-in caption, so the
cut reads with the sound off — the narration adds the argument, it does not carry the
picture. Where narration runs longer than its beat, lengthen that beat rather than
rushing the line.

**Do not** use copyrighted music; the rules bar it. The cut needs no music.

## Script

| In | Out | On screen | Narration |
|---|---|---|---|
| 0:00.0 | 0:03.3 | Two companies want to know how many customers they share. | Two companies have overlapping customers and a question they can't answer. How many do we share, and how many more could we reach? Neither is allowed to see the other's records. |
| 0:03.3 | 0:06.3 | Neither is allowed to see the other's customer records. |  |
| 0:06.3 | 0:09.8 | Today that means a clean-room vendor, a contract, and six figures. |  |
| 0:09.8 | 0:12.8 | Airlock is two ordinary web apps on two different origins. |  |
| 0:12.8 | 0:17.6 | A marketer asks in plain language. Nothing is uploaded anywhere. |  |
| 0:17.6 | 0:20.2 | The tool that crosses the boundary is not registered yet — |  |
| 0:20.2 | 0:25.8 | so the agent has nothing to call, and no wording can change that. |  |
| 0:25.8 | 0:29.7 | Asking for the records directly is refused by the publisher. |  |
| 0:29.7 | 0:34.0 | Approval is a business decision, taken by a person on each side. |  |
| 0:34.0 | 0:38.8 | The request crosses to the publisher's own console as a tool call. |  |
| 0:38.8 | 0:44.3 | Both approvals register the capability. Now it exists. |  |
| 0:44.3 | 0:48.5 | 2,178 shared customers. 13,057 more reachable. Zero records moved. |  |
| 0:48.5 | 0:52.0 | The publisher also returned free text — and it is an attack. |  |
| 0:52.0 | 0:57.6 | Quarantined as text, never followed as an instruction. |  |
| 0:57.6 | 1:03.2 | Too few people matched, so the number is withheld, not rounded. |  |
| 1:03.2 | 1:07.4 | Every crossing is on the record, for both companies. |  |
| 1:07.4 | 1:11.9 | The publisher publishes four capabilities to this origin — and nothing else. |  |
| 1:11.9 | 1:15.9 | Registered with exposedTo. Discovered with getTools. Invoked with executeTool. | That's the whole implementation. Tools registered with exposedTo, discovered with getTools, invoked with executeTool. |
| 1:15.9 | 1:21.3 | The browser mediates every call. There is no server in the path. | The browser mediates every call. No backend, no third party, nothing in the path between them. |
| 1:21.3 | 1:25.5 | Withdraw approval and the capability is gone — not disabled. | And approval is revocable. Withdraw it and the tool is unregistered — gone, not disabled. |
| 1:25.5 | 1:29.3 | Authority comes from whether a tool exists, not from a permission check. | That's the argument. A permission check is something a model can be talked past. A tool that doesn't exist is not. |
| 1:29.3 | 1:36.8 | Airlock — a data clean room with no clean-room vendor in it. | Airlock. A data clean room with no clean-room vendor in it. |

## Checks before upload

- [ ] Under 3:00. The cut is 1:37; narration must not push it past the limit.
- [ ] Public on YouTube, not unlisted-only — the rules require publicly visible.
- [ ] Audio present throughout; the rules require a demo *with audio*.
- [ ] No third-party trademarks or copyrighted music.
- [ ] Numbers match the written submission exactly: **2,178** shared, **13,057**
      incremental, **15,235** partner reach, **k = 250**, **4,200** records held,
      **0** records exchanged.
- [ ] Watch once muted. If a beat is unreadable without narration, lengthen it.
