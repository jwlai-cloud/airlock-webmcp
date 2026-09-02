# Narration script — read this aloud

**25 lines, 425 words, 2439 characters.** At your measured speech rate (180 wpm,
taken from the last take) that is about **2:21 of speech**; the picture adds 22 seconds,
so the cut lands near **2:43** of a 3:00 limit.

> **ElevenLabs speed 1.00.** Via the API this bills ~2439 characters.

## After recording

```bash
node tools/split-vo.js ~/Downloads/<file>.mp3 0.70 -45dB
node tools/capture.js --tts file --with-key \
  --base https://jwlai-cloud.github.io/airlock-webmcp/site-a/
```

The last take needed a 0.70s gap threshold rather than the 1.15s default — its break
tags rendered shorter. If the split reports the wrong segment count, that is the knob.

---

## The script

### 1

> How much do our customers overlap with a partner's?

<sub>on screen: A marketer asks an agent about a partner's audience.</sub>

### 2

> Any agent can drive it. Paste a Gemini key and a real model takes over.

<sub>on screen: Bring your own model — the key stays in your browser.</sub>

### 3

> Now a real model. getTools to see what the page offers, executeTool to invoke one.

<sub>on screen: Real Gemini. getTools() to discover, executeTool() to call.</sub>

### 4

> But it cannot measure the overlap. That tool was never registered, so getTools never returned it.

<sub>on screen: estimate_overlap was never registered. Nothing to call.</sub>

### 5

> That is the idea. A permission check can be argued past. A missing tool cannot.

<sub>on screen: A permission check can be argued past. A missing tool cannot.</sub>

### 6

> Two companies share customers and cannot say how many. Today that means a clean room, and both upload their files.

<sub>on screen: Two companies. Neither may see the other's list.</sub>

### 7

> Two ordinary web apps on two origins, and everything between them is WebMCP.

<sub>on screen: Two origins. Aggregates cross; records never do.</sub>

### 8

> A page calls registerTool to declare what it can do, and the browser decides who sees it.

<sub>on screen: WebMCP: a page declares what it can do.</sub>

### 9

> The publisher registers with exposedTo, naming one origin. A third gets no denial — it never learns they exist.

<sub>on screen: exposedTo names one origin. A third gets no denial.</sub>

### 10

> Its console runs in a frame carrying allow equals tools — the Permissions Policy that lets either side reach the other.

<sub>on screen: allow="tools" — the frame is how the crossing is permitted at all.</sub>

### 11

> The advertiser reaches them with getTools and fromOrigins, then executeTool — each running in the publisher's page, over records that never move.

<sub>on screen: getTools({fromOrigins}) · executeTool() · browser-mediated.</sub>

### 12

> A tool's description is not a comment. It is the whole basis on which a model decides to call it. Ours says the export tool always refuses, so the model reports that instead of retrying.

<sub>on screen: The description is prompt, not documentation.</sub>

### 13

> One tool is not JavaScript — a form with toolname, and the browser writes its schema.

<sub>on screen: One tool is a <form>. The browser writes its schema.</sub>

### 14

> Building it disproved three things the documentation says. requestUserInteraction does not exist in Chrome at all. fromOrigins is additive, not a filter. And executeTool needs a JSON string — an object throws.

<sub>on screen: Three published facts about this API were wrong.</sub>

### 15

> Ask for the raw records and it refuses.

<sub>on screen: Asking for the records is refused outright.</sub>

### 16

> So it asks for approval. A person decides on each side.

<sub>on screen: Approval is a business decision — one on each side.</sub>

### 17

> That crosses to their console as a WebMCP tool call. Their officer decides.

<sub>on screen: It crosses to the publisher's console as a WebMCP tool call.</sub>

### 18

> Two approvals, and only now does registerTool run, bound to an AbortController.

<sub>on screen: registerTool({signal}) · toolchange fires · watch the list.</sub>

### 19

> The model is back, and now it can answer. Two thousand shared, thirteen thousand more reachable. Zero records moved.

<sub>on screen: Real model again — 2,178 shared, 13,057 reachable, 0 records moved.</sub>

### 20

> It also returned a prompt injection. The tool carries untrustedContentHint — but a hint enforces nothing.

<sub>on screen: untrustedContentHint — but a hint enforces nothing.</sub>

### 21

> A segment too thin to be safe is withheld, not rounded.

<sub>on screen: Too few people matched. Withheld, not rounded.</sub>

### 22

> All of it is checked by a Playwright suite that drives the same calls an agent makes — twenty-five of them, run against the live pair rather than a local copy.

<sub>on screen: 25 automated checks, against the deployed pair.</sub>

### 23

> Three gates. Not one depends on the model behaving well.

<sub>on screen: Three gates. None of them trusts the model.</sub>

### 24

> And it is revocable. Abort the signal, the tool is unregistered. Gone, not disabled.

<sub>on screen: Abort the signal → the tool is unregistered → gone.</sub>

### 25

> Two companies answered a question about their shared customers. Neither saw the other's data. Airlock.

<sub>on screen: A permission check can be argued past. A tool that does not exist cannot. · github.com/jwlai-cloud/airlock-webmcp</sub>

