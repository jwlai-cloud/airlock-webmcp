# Demo video — script

Generated from the capture itself (`tools/script-doc.js`), so this and the recorded cut
cannot drift.

**Runtime 2:46.6. The limit is a ceiling, not a target** — the rules say the video
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
| 0:00.3 | 0:03.1 | A marketer asks an agent about a partner's audience. | How much do our customers overlap with a partner's? |
| 0:03.1 | 0:09.1 | Bring your own model — the key stays in your browser. | Any agent can drive it. Paste a Gemini key and a real model takes over. |
| 0:09.1 | 0:15.0 | Real Gemini. getTools() to discover, executeTool() to call. | Now a real model. getTools to see what the page offers, executeTool to invoke one. |
| 0:15.0 | 0:21.0 | estimate_overlap was never registered. Nothing to call. | But it cannot measure the overlap. That tool was never registered, so getTools never returned it. |
| 0:21.0 | 0:26.9 | A permission check can be argued past. A missing tool cannot. | That is the idea. A permission check can be argued past. A missing tool cannot. |
| 0:26.9 | 0:33.9 | Two companies. Neither may see the other's list. | Two companies share customers and cannot say how many. Today that means a clean room, and both upload their files. |
| 0:33.9 | 0:39.3 | Two origins. Aggregates cross; records never do. | Two ordinary web apps on two origins, and everything between them is WebMCP. |
| 0:39.3 | 0:44.5 | WebMCP: a page declares what it can do. | A page calls registerTool to declare what it can do, and the browser decides who sees it. |
| 0:44.5 | 0:53.0 | exposedTo names one origin. A third gets no denial. | The publisher registers with exposedTo, naming one origin. A third gets no denial — it never learns they exist. |
| 0:53.0 | 1:00.0 | allow="tools" — the frame is how the crossing is permitted at all. | Its console runs in a frame carrying allow equals tools — the Permissions Policy that lets either side reach the other. |
| 1:00.0 | 1:08.9 | getTools({fromOrigins}) · executeTool() · browser-mediated. | The advertiser reaches them with getTools and fromOrigins, then executeTool — each running in the publisher's page, over records that never move. |
| 1:08.9 | 1:20.4 | The description is prompt, not documentation. | A tool's description is not a comment. It is the whole basis on which a model decides to call it. Ours says the export tool always refuses, so the model reports that instead of retrying. |
| 1:20.4 | 1:25.9 | One tool is a <form>. The browser writes its schema. | One tool is not JavaScript — a form with toolname, and the browser writes its schema. |
| 1:25.9 | 1:40.8 | Three published facts about this API were wrong. | Building it disproved three things the documentation says. requestUserInteraction does not exist in Chrome at all. fromOrigins is additive, not a filter. And executeTool needs a JSON string — an object throws. |
| 1:40.8 | 1:43.6 | Asking for the records is refused outright. | Ask for the raw records and it refuses. |
| 1:43.6 | 1:48.2 | Approval is a business decision — one on each side. | So it asks for approval. A person decides on each side. |
| 1:48.2 | 1:54.2 | It crosses to the publisher's console as a WebMCP tool call. | That crosses to their console as a WebMCP tool call. Their officer decides. |
| 1:54.2 | 1:59.9 | registerTool({signal}) · toolchange fires · watch the list. | Two approvals, and only now does registerTool run, bound to an AbortController. |
| 1:59.9 | 2:08.2 | Real model again — 2,178 shared, 13,057 reachable, 0 records moved. | The model is back, and now it can answer. Two thousand shared, thirteen thousand more reachable. Zero records moved. |
| 2:08.2 | 2:15.5 | untrustedContentHint — but a hint enforces nothing. | It also returned a prompt injection. The tool carries untrustedContentHint — but a hint enforces nothing. |
| 2:15.5 | 2:19.0 | Too few people matched. Withheld, not rounded. | A segment too thin to be safe is withheld, not rounded. |
| 2:19.0 | 2:28.0 | 25 automated checks, against the deployed pair. | All of it is checked by a Playwright suite that drives the same calls an agent makes — twenty-five of them, run against the live pair rather than a local copy. |
| 2:28.0 | 2:33.5 | Three gates. None of them trusts the model. | Three gates. Not one depends on the model behaving well. |
| 2:33.5 | 2:39.6 | Abort the signal → the tool is unregistered → gone. | And it is revocable. Abort the signal, the tool is unregistered. Gone, not disabled. |
| 2:39.6 | 2:46.6 | A permission check can be argued past. A tool that does not exist cannot.
github.com/jwlai-cloud/airlock-webmcp | Two companies answered a question about their shared customers. Neither saw the other's data. Airlock. |

## Before upload

- [ ] Runtime under 3:00 with margin.
- [ ] 1920×1080, H.264, AAC audio.
- [ ] Public on YouTube — the rules require publicly visible, not unlisted.
- [ ] Audio present throughout.
- [ ] No third-party trademarks, no copyrighted music.
- [ ] Numbers match the written submission: **2,178** shared, **13,057** incremental,
      **15,235** partner reach, **k = 250**, **4,200** records held, **0** exchanged.
- [ ] Watch once muted — if a beat is unreadable without narration, raise its `extra`.
