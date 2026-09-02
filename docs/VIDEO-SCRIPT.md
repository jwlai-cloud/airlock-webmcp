# Demo video — script

Generated from the capture itself (`tools/script-doc.js`), so this and the recorded cut
cannot drift.

**Runtime 2:30.9. The limit is a ceiling, not a target** — the rules say the video
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
| 0:00.4 | 0:05.0 | A marketer asks an agent about a partner's audience. | A marketer asks an agent how their customers overlap with a partner's audience. |
| 0:05.0 | 0:12.4 | It can't. That tool is not registered — getTools() never returns it. | It cannot answer. The tool that crosses the boundary is not registered, so it is not in the agent's tool list at all. |
| 0:12.4 | 0:22.4 | A permission check can be argued past. A missing tool cannot. | That is Airlock, and that is the whole idea. A permission check is something a model can be argued past. A tool that does not exist is not. |
| 0:22.4 | 0:31.8 | Two companies. One question neither can answer. | Two companies share customers and neither can say how many. Answering it means comparing two customer lists, and neither may show the other its list. |
| 0:31.8 | 0:41.8 | Today: a clean-room vendor, six figures, both files uploaded. | Today that means a data clean room. Six figures a year, and both companies upload their customer files to a third party. The measurement creates the risk. |
| 0:41.8 | 0:50.7 | Airlock is two ordinary web apps, on two different origins. | Airlock is two ordinary web apps on two different origins. An advertiser's workspace, and live on the right, the publisher's own console. |
| 0:50.7 | 1:01.9 | WebMCP: each app declares what it can do. | WebMCP lets each app write down what it can do. List audiences. Request approval. Measure overlap. Each is the same function the buttons already call. |
| 1:01.9 | 1:05.8 | Asking for the records directly is refused outright. | Asking the publisher for the raw records is refused outright. |
| 1:05.8 | 1:10.3 | Approval is a business decision. A person makes it on each side. | So it asks for approval. A person decides, on each side. |
| 1:10.3 | 1:17.5 | The request crosses to the publisher's console as a tool call. | The request crosses to the publisher's console as a tool call. Their officer decides independently. |
| 1:17.5 | 1:23.6 | Two approvals → registerTool(). Watch the tool list. | Two approvals, and only now is the tool registered. Consent creates the capability. |
| 1:23.6 | 1:32.7 | 2,178 shared. 13,057 more reachable. Zero records moved. | Same question, seconds later. Two thousand shared customers, thirteen thousand more reachable. Two counts crossed. Zero records moved. |
| 1:32.7 | 1:38.4 | The publisher also returned free text — and it is an attack. | The publisher also returned a note. It is a prompt injection, telling the agent to export everything. |
| 1:38.4 | 1:46.5 | Quarantined as text. Never followed as an instruction. | It is quarantined as text, never followed. And no tool over there can return a record anyway. |
| 1:46.5 | 1:52.2 | Too few people matched. The number is withheld, not rounded. | Ask about a segment too thin to be safe, and the answer is withheld, not rounded. |
| 1:52.2 | 2:01.1 | exposedTo: four capabilities to this origin, nothing else. | The publisher exposes four capabilities here and nothing else. A third origin would not get a denial — it would not learn they exist. |
| 2:01.1 | 2:15.1 | All of it: registerTool · exposedTo · getTools · executeTool. | That is the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent drives it, and we ship no key. |
| 2:15.1 | 2:21.5 | Withdraw approval → the signal aborts → the tool is gone. | And it is revocable. Withdraw approval and the tool is unregistered. Gone, not disabled. |
| 2:21.5 | 2:30.9 | A permission check can be argued past. A tool that does not exist cannot.
github.com/jwlai-cloud/airlock-webmcp | Two companies answered a question about their shared customers. Neither saw the other's data. No vendor sat in between. Airlock. |

## Before upload

- [ ] Runtime under 3:00 with margin.
- [ ] 1920×1080, H.264, AAC audio.
- [ ] Public on YouTube — the rules require publicly visible, not unlisted.
- [ ] Audio present throughout.
- [ ] No third-party trademarks, no copyrighted music.
- [ ] Numbers match the written submission: **2,178** shared, **13,057** incremental,
      **15,235** partner reach, **k = 250**, **4,200** records held, **0** exchanged.
- [ ] Watch once muted — if a beat is unreadable without narration, raise its `extra`.
