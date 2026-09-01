# Demo video — script

Generated from the capture itself (`tools/script-doc.js`), so this and the recorded cut
cannot drift.

**Runtime 2:15.8. The limit is a ceiling, not a target** — the rules say the video
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
| 0:00.1 | 0:06.5 | Two companies. One question neither can answer. | Two companies have customers in common, and a question neither of them can answer alone. How many do we share? And how many more could we reach? |
| 0:06.5 | 0:10.9 | Neither is allowed to see the other's customer records. | Answering it means comparing two customer lists. Neither is allowed to show the other its list. |
| 0:10.9 | 0:17.3 | Today: a clean-room vendor, a contract, six figures, and weeks. | So today they hire a data clean room. Six figures a year, and both companies upload their customer files to a third party. |
| 0:17.3 | 0:21.9 | The data leaves both buildings to answer one question. | To measure an overlap safely, both lists leave the building. The measurement creates the risk. |
| 0:21.9 | 0:28.8 | WebMCP lets a page hand an agent a narrow set of verbs. | WebMCP changes that. A page hands an agent a narrow set of verbs, and the browser enforces which origins can see them. |
| 0:28.8 | 0:32.7 | So the question can travel instead of the data. | So the question travels to the data. The browser is the clean room. |
| 0:32.7 | 0:40.2 | Airlock: two ordinary web apps, on two different origins. | This is Airlock. Two ordinary web apps on two different origins. An advertiser's workspace, and live on the right, the publisher's own console. |
| 0:40.2 | 0:43.6 | A marketer asks in plain language. Nothing is uploaded. | A marketer asks in plain language. |
| 0:43.6 | 0:48.8 | The tool that crosses the boundary is not registered yet. | It cannot. The tool that crosses the boundary is not registered, so it is not in the agent's tool list. |
| 0:48.8 | 0:55.5 | Nothing to call — and no wording brings it into existence. | That is the whole idea. A permission check can be argued past. A tool that does not exist cannot. |
| 0:55.5 | 0:58.9 | Asking for the records directly is refused outright. | Asking for the raw records is refused outright. |
| 0:58.9 | 1:03.6 | Approval is a business decision. A person makes it on each side. | So it asks for approval. A person decides, on each side. |
| 1:03.6 | 1:09.5 | The request crosses to the publisher's console as a tool call. | The request crosses to the publisher's console as a tool call, where their officer decides independently. |
| 1:09.5 | 1:15.7 | Two approvals register the tool. Only now does it exist. | Two approvals, and only now is the tool registered. Consent creates the capability. |
| 1:15.7 | 1:23.2 | 2,178 shared. 13,057 more reachable. Zero records moved. | Same question, seconds later. Two thousand shared customers, thirteen thousand more reachable. Two counts crossed. Zero records moved. |
| 1:23.2 | 1:28.1 | The publisher also returned free text — and it is an attack. | The publisher also returned a note. It is a prompt injection, telling the agent to export everything. |
| 1:28.1 | 1:34.1 | Quarantined as text. Never followed as an instruction. | It is quarantined as text, never followed. And no tool over there can return a record anyway. |
| 1:34.1 | 1:39.8 | Too few people matched. The number is withheld, not rounded. | Ask about a segment too thin to be safe, and the answer is withheld rather than rounded. |
| 1:39.8 | 1:43.2 | Every crossing is on the record, for both companies. | Every crossing is on the record, on both sides. |
| 1:43.2 | 1:50.4 | The publisher publishes four capabilities here — and nothing else. | The publisher exposes four capabilities here and nothing else. A third origin would not get a denial. It would not learn they exist. |
| 1:50.4 | 2:01.9 | registerTool with exposedTo. getTools. executeTool. | That is the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent drives it. We ship no key and no backend. |
| 2:01.9 | 2:07.8 | Withdraw approval and the capability is gone — not disabled. | And it is revocable. Withdraw approval and the tool is unregistered. Gone, not disabled. |
| 2:07.8 | 2:15.8 | A data clean room with no clean-room vendor in it. | Two companies answered a question about their shared customers. Neither saw the other's data, and no vendor sat in between. Airlock. |

## Before upload

- [ ] Runtime under 3:00 with margin.
- [ ] 1920×1080, H.264, AAC audio.
- [ ] Public on YouTube — the rules require publicly visible, not unlisted.
- [ ] Audio present throughout.
- [ ] No third-party trademarks, no copyrighted music.
- [ ] Numbers match the written submission: **2,178** shared, **13,057** incremental,
      **15,235** partner reach, **k = 250**, **4,200** records held, **0** exchanged.
- [ ] Watch once muted — if a beat is unreadable without narration, raise its `extra`.
