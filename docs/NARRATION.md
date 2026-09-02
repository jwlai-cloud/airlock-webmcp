# Narration script — read this aloud

**17 lines, 288 words**, about **1:43 of speech**. With a live model
driving the picture the finished cut lands near **2:30** of a 3:00 limit.

> **Render at ElevenLabs speed 1.00.** A take at 1.20 read at 213 wpm, too fast for this.

Front-loaded deliberately: lines 1 to 4 are the cold open, where a real model calls a
tool, hits the boundary, and the reason is stated. If a judge stops at forty seconds
they have already seen the argument.

## How to record

```bash
# ElevenLabs API — exact segmentation, ~1,650 characters
export ELEVENLABS_API_KEY=...
node tools/capture.js --list-voices
node tools/capture.js --tts eleven --voice-id <id> --with-key \
  --base https://jwlai-cloud.github.io/airlock-webmcp/site-a/

# or the web UI: paste docs/NARRATION-paste.txt, download, then send me the path
```

---

## The script

### 1

> A marketer asks an agent how their customers overlap with a partner's audience.

<sub>on screen: A marketer asks an agent about a partner's audience.</sub>

### 2

> A real Gemini model, discovering this page's tools and calling them.

<sub>on screen: Real Gemini. It calls a tool, then hits the boundary.</sub>

### 3

> But it cannot measure the overlap. That tool is not registered, so it was never in the list the model was given.

<sub>on screen: estimate_overlap is not registered — getTools() never returns it.</sub>

### 4

> That is the whole idea. A permission check can be argued past. A tool that does not exist cannot.

<sub>on screen: A permission check can be argued past. A missing tool cannot.</sub>

### 5

> Two companies share customers and cannot say how many. Today that means a clean room: six figures a year, and both upload their customer files to a third party.

<sub>on screen: Two companies. Neither may see the other's list.</sub>

### 6

> Airlock is two ordinary web apps on two origins, and everything between them is WebMCP. Ten tools, both halves of the API.

<sub>on screen: Everything between them is WebMCP.</sub>

### 7

> exposedTo names one origin and no other — a third gets no denial, it never learns the tools exist. And one tool is just a form: the browser writes its schema.

<sub>on screen: exposedTo names one origin. A form becomes a tool.</sub>

### 8

> Ask for the raw records and it refuses.

<sub>on screen: Asking for the records is refused outright.</sub>

### 9

> So it asks for approval, and a person decides on each side.

<sub>on screen: Approval is a business decision — one on each side.</sub>

### 10

> The request crosses to the publisher's own console as a tool call. Their officer decides independently.

<sub>on screen: It crosses to the publisher's console as a tool call.</sub>

### 11

> Two approvals, and only now does registerTool run. Consent creates the capability.

<sub>on screen: Two approvals → registerTool(). Watch the tool list.</sub>

### 12

> Now the model can answer. Two thousand shared, thirteen thousand more reachable. Zero records moved.

<sub>on screen: 2,178 shared. 13,057 more reachable. Zero records moved.</sub>

### 13

> The publisher also returned a note, and it is a prompt injection. It carries untrustedContentHint — but a hint enforces nothing, so we treat it as data regardless.

<sub>on screen: The partner's note is a prompt injection. Quarantined.</sub>

### 14

> A segment too thin to be safe is withheld, not rounded.

<sub>on screen: Too few people matched. Withheld, not rounded.</sub>

### 15

> Three gates, and not one depends on the model behaving well.

<sub>on screen: Three gates. None of them trusts the model.</sub>

### 16

> And it is revocable. Withdraw approval, the signal aborts, the tool is gone.

<sub>on screen: Withdraw approval → the signal aborts → the tool is gone.</sub>

### 17

> Two companies answered a question about their shared customers. Neither saw the other's data. Airlock.

<sub>on screen: A permission check can be argued past. A tool that does not exist cannot. · github.com/jwlai-cloud/airlock-webmcp</sub>

