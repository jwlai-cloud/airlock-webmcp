# Demo video — script

Generated from the capture itself (`tools/script-doc.js`), so this and the recorded cut
cannot drift.

**Runtime 2:45.1. The limit is a ceiling, not a target** — the rules say the video
"must be less than three (3) minutes", with no minimum, and judges are not required to
watch beyond it. Leave margin; do not aim at 2:59.

The narration is synthesised by `tools/capture.js` with macOS `say` and mixed onto the
picture at the beat times actually recorded, so audio and picture cannot drift either.

```bash
npm run capture                              # default voice, 205 wpm
node tools/capture.js --voice "Karen (Premium)" --rate 190
node tools/capture.js --no-voice             # picture only, to record your own
```

To re-record in a human voice, read the narration column against the timestamps and run
`--no-voice`, or replace the audio track in an editor. Every beat carries a burned-in
caption, so the cut reads with the sound off; the narration carries the argument, not the
picture.

## Script

| In | Out | On screen | Narration |
|---|---|---|---|
| 0:00.1 | 0:07.4 | Two companies. One question neither can answer. | Two companies have customers in common, and a question neither of them can answer alone. How many do we share? And how many more could we reach? |
| 0:07.4 | 0:12.3 | Neither is allowed to see the other's customer records. | Answering it means comparing two customer lists, and neither is allowed to show the other its list. |
| 0:12.3 | 0:21.3 | Today: a clean-room vendor, a contract, six figures, and weeks. | So today they hire a data clean room. A contract, a procurement cycle, six figures a year, and both companies upload their customer files to a third party. |
| 0:21.3 | 0:27.1 | The data leaves both buildings to answer one question. | To find out how much two lists overlap, both lists have to leave the building. The measurement creates the risk. |
| 0:27.1 | 0:34.6 | WebMCP lets a page hand an agent a narrow set of verbs. | WebMCP changes that. A page hands an agent a narrow set of verbs, and the browser enforces which origins can even see them. |
| 0:34.6 | 0:40.6 | So the question can travel instead of the data. | So the question travels to the data, instead of the data travelling to a vendor. The browser is the clean room. |
| 0:40.6 | 0:48.9 | Airlock: two ordinary web apps, on two different origins. | This is Airlock. Two ordinary web apps on two different origins. The advertiser's workspace, and live on the right, the publisher's own console. |
| 0:48.9 | 0:53.7 | A marketer asks in plain language. Nothing is uploaded. | A marketer asks in plain language. Watch the answer. |
| 0:53.7 | 0:59.6 | The tool that crosses the boundary is not registered yet. | It can't. The tool that crosses the boundary isn't registered, so it isn't in the agent's tool list at all. |
| 0:59.6 | 1:06.6 | Nothing to call — and no wording brings it into existence. | That's the whole idea. A permission check can be argued past. A tool that doesn't exist cannot. |
| 1:06.6 | 1:12.5 | Asking for the records directly is refused outright. | Asking for the raw records is refused outright. That tool exists only so the refusal is auditable. |
| 1:12.5 | 1:18.0 | Approval is a business decision. A person makes it on each side. | So it asks for approval. That's a business decision, and a person makes it on each side. |
| 1:18.0 | 1:27.6 | The request crosses to the publisher's console as a tool call. | One operator authorises the purpose. The request then crosses to the publisher's console, as a tool call, where their officer decides for themselves. |
| 1:27.6 | 1:34.1 | Two approvals register the tool. Only now does it exist. | Two approvals, and only now is the tool registered. Consent creates the capability. |
| 1:34.1 | 1:43.9 | 2,178 shared. 13,057 more reachable. Zero records moved. | Same question, seconds later. Two thousand one hundred and seventy-eight shared customers. Thirteen thousand more reachable. Two counts crossed. Zero records moved. |
| 1:43.9 | 1:49.5 | The publisher also returned free text — and it is an attack. | The publisher also returned a note. That note is a prompt injection, telling the agent to export everything. |
| 1:49.5 | 1:57.6 | Quarantined as text. Never followed as an instruction. | It's quarantined as text, never followed. And even if a model believed it, no tool over there can return a record. |
| 1:57.6 | 2:06.5 | Too few people matched. The number is withheld, not rounded. | Ask about a segment that's too thin and the answer is withheld, not rounded. Under two hundred and fifty people, so the number never leaves. |
| 2:06.5 | 2:10.0 | Every crossing is on the record, for both companies. | Every crossing is on the record, on both sides. |
| 2:10.0 | 2:18.2 | The publisher publishes four capabilities here — and nothing else. | The publisher exposes four capabilities to this origin and nothing else. A third origin wouldn't get a denial. It wouldn't learn they exist. |
| 2:18.2 | 2:31.2 | registerTool with exposedTo. getTools. executeTool. | That's the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent can drive it — Chrome's own runs Gemini. We ship no key and no backend. |
| 2:31.2 | 2:36.9 | Withdraw approval and the capability is gone — not disabled. | And it's revocable. Withdraw approval and the tool is unregistered. Gone, not disabled. |
| 2:36.9 | 2:45.1 | A data clean room with no clean-room vendor in it. | Two companies answered a question about their shared customers. Neither saw the other's data, and there was no vendor in between. Airlock. |

## Before upload

- [ ] Runtime under 3:00 with margin.
- [ ] 1920×1080, H.264, AAC audio.
- [ ] Public on YouTube — the rules require publicly visible, not unlisted.
- [ ] Audio present throughout.
- [ ] No third-party trademarks, no copyrighted music.
- [ ] Numbers match the written submission: **2,178** shared, **13,057** incremental,
      **15,235** partner reach, **k = 250**, **4,200** records held, **0** exchanged.
- [ ] Watch once muted — if a beat is unreadable without narration, raise its `extra`.
