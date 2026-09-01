# Demo video — script

Generated from the capture itself (`tools/script-doc.js`), so this and the recorded cut
cannot drift.

**Runtime 2:51.6. The limit is a ceiling, not a target** — the rules say the video
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
| 0:00.1 | 0:06.4 | Two companies. One question neither can answer. | Two companies share customers, and neither can say how many. The most basic question in a partnership. |
| 0:06.4 | 0:11.8 | Neither may show the other its customer list. | Answering it means comparing two customer lists. Neither is allowed to show the other its list. |
| 0:11.8 | 0:18.8 | Today: a clean-room vendor, a contract, six figures. | So today they hire a data clean room. Six figures a year, and both upload their customer files to a third party. |
| 0:18.8 | 0:24.3 | To measure the overlap, both lists leave the building. | To measure the overlap safely, both lists leave the building. The measurement creates the risk. |
| 0:24.3 | 0:31.9 | Airlock starts as an ordinary web app. | Airlock starts as an ordinary web app. A marketing team's workspace, with its own audiences and its own buttons. |
| 0:31.9 | 0:43.1 | WebMCP: the app declares what it can do. | WebMCP lets it write down what it can do. List audiences. Request approval. Measure overlap. Each is the same function the buttons already call. |
| 0:43.1 | 0:47.7 | An agent calls those tools — no screenshots, no guessing. | So an agent operates the product directly, instead of reading the screen and guessing. |
| 0:47.7 | 0:57.1 | This answer needs a second origin — WebMCP's exposedTo. | But this question needs a second app, owned by another company, on another origin. Live on the right, in a cross-origin frame. |
| 0:57.1 | 1:06.1 | That tool is not registered, so getTools() never returns it. | A marketer asks in plain language. The agent cannot answer: the tool that crosses the boundary is not registered, so it is not in its list. |
| 1:06.1 | 1:14.6 | Nothing to call — and no wording brings it into existence. | That is the whole idea. A permission check can be argued past. A tool that does not exist cannot. |
| 1:14.6 | 1:18.1 | Asking for the records directly is refused outright. | Asking for the raw records is refused outright. |
| 1:18.1 | 1:22.9 | Approval is a business decision. A person makes it on each side. | So it asks for approval. A person decides, on each side. |
| 1:22.9 | 1:30.6 | The request crosses to the publisher's console as a tool call. | The request crosses to the publisher's console as a tool call. Their officer decides independently. |
| 1:30.6 | 1:37.7 | Two approvals → registerTool(). Only now does it exist. | Two approvals, and only now is the tool registered. Consent creates the capability. |
| 1:37.7 | 1:47.3 | 2,178 shared. 13,057 more reachable. Zero records moved. | Same question, seconds later. Two thousand shared customers, thirteen thousand more reachable. Two counts crossed. Zero records moved. |
| 1:47.3 | 1:53.5 | The publisher also returned free text — and it is an attack. | The publisher also returned a note. It is a prompt injection, telling the agent to export everything. |
| 1:53.5 | 2:01.2 | Quarantined as text. Never followed as an instruction. | It is quarantined as text, never followed. And no tool over there can return a record anyway. |
| 2:01.2 | 2:08.1 | Too few people matched. The number is withheld, not rounded. | Ask about a segment too thin to be safe, and the answer is withheld, not rounded. |
| 2:08.1 | 2:12.0 | Every crossing is on the record, for both companies. | Every crossing is on the record, on both sides. |
| 2:12.0 | 2:21.7 | exposedTo: four capabilities to this origin, nothing else. | The publisher exposes four capabilities here and nothing else. A third origin would not get a denial — it would not learn they exist. |
| 2:21.7 | 2:34.6 | All of it: registerTool · exposedTo · getTools · executeTool. | That is the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent drives it, and we ship no key. |
| 2:34.6 | 2:41.4 | Withdraw approval → the signal aborts → the tool is gone. | And it is revocable. Withdraw approval and the tool is unregistered. Gone, not disabled. |
| 2:41.4 | 2:51.6 | A data clean room with no clean-room vendor in it. | Two companies answered a question about their shared customers. Neither saw the other's data. No vendor sat in between. Airlock. |

## Before upload

- [ ] Runtime under 3:00 with margin.
- [ ] 1920×1080, H.264, AAC audio.
- [ ] Public on YouTube — the rules require publicly visible, not unlisted.
- [ ] Audio present throughout.
- [ ] No third-party trademarks, no copyrighted music.
- [ ] Numbers match the written submission: **2,178** shared, **13,057** incremental,
      **15,235** partner reach, **k = 250**, **4,200** records held, **0** exchanged.
- [ ] Watch once muted — if a beat is unreadable without narration, raise its `extra`.
