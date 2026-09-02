# Narration script — read this aloud

**20 lines, 305 words**, about **1:49 of speech**. The picture adds roughly
45 seconds when a live model is driving it, so the cut lands near 2:35 of a 3:00 limit.

> **Render at ElevenLabs speed 1.00.**

This version is driven by a real Gemini model and cuts to two slides — the WebMCP API
surface, and the three gates an injection meets. Four of the twenty lines name WebMCP
or a specific call, up from two.

## How to record

```bash
export ELEVENLABS_API_KEY=...
node tools/capture.js --list-voices
node tools/capture.js --tts eleven --voice-id <id>

# or the web UI: paste docs/NARRATION-paste.txt, then
node tools/split-vo.js ~/Downloads/airlock.mp3
node tools/capture.js --tts file --with-key --base https://jwlai-cloud.github.io/airlock-webmcp/site-a/
```

---

## The script

### 1

> A marketer asks an agent how their customers overlap with a partner's audience.

<sub>on screen: A marketer asks an agent about a partner's audience.</sub>

### 2

> A real Gemini model, discovering this page's tools and calling them.

<sub>on screen: The model calls a tool. Then it hits the boundary.</sub>

### 3

> But it cannot measure the overlap. That tool is not registered, so it was never in the list the model was given.

<sub>on screen: estimate_overlap is not registered — getTools() never returns it.</sub>

### 4

> That is the whole idea. A permission check can be argued past. A tool that does not exist cannot.

<sub>on screen: A permission check can be argued past. A missing tool cannot.</sub>

### 5

> Two companies share customers and neither can say how many. Comparing the lists means showing them.

<sub>on screen: Two companies. One question neither can answer.</sub>

### 6

> So today they hire a clean room. Six figures a year, and both upload their customer files to a third party.

<sub>on screen: Today: a clean-room vendor, six figures, both files uploaded.</sub>

### 7

> Airlock is two ordinary web apps on two origins. Everything between them is WebMCP: ten tools, both halves of the API.

<sub>on screen: Airlock is built entirely from WebMCP.</sub>

### 8

> exposedTo names one origin and no other. A third origin gets no denial — it never learns the tools exist.

<sub>on screen: exposedTo publishes to one origin. Nothing else can see them.</sub>

### 9

> One tool is a form with two attributes. The browser writes its schema, and submitting it runs the page's own handler.

<sub>on screen: One tool is a <form>. The browser writes its schema.</sub>

### 10

> Ask for the raw records and it refuses outright.

<sub>on screen: Asking for the records directly is refused outright.</sub>

### 11

> So it asks for approval. A person decides, on each side.

<sub>on screen: Approval is a business decision. A person makes it on each side.</sub>

### 12

> The request crosses to the publisher's own console, as a tool call. Their officer decides independently.

<sub>on screen: It crosses to the publisher's console — as a WebMCP tool call.</sub>

### 13

> Two approvals, and only now does registerTool run. Consent creates the capability.

<sub>on screen: Two approvals → registerTool(). Watch the tool list.</sub>

### 14

> Now the model can answer. Two thousand shared, thirteen thousand more reachable. Zero records moved.

<sub>on screen: 2,178 shared. 13,057 more reachable. Zero records moved.</sub>

### 15

> The publisher also returned a note. It is a prompt injection.

<sub>on screen: The publisher also returned free text — and it is an attack.</sub>

### 16

> It carries untrustedContentHint — but a hint enforces nothing, so we treat the text as data regardless.

<sub>on screen: untrustedContentHint — but the hint enforces nothing.</sub>

### 17

> A segment too thin to be safe is withheld, not rounded.

<sub>on screen: Too few people matched. The number is withheld, not rounded.</sub>

### 18

> Three gates, and not one depends on the model behaving well.

<sub>on screen: Three gates. None of them trusts the model.</sub>

### 19

> And it is revocable. Withdraw approval, the signal aborts, the tool is gone.

<sub>on screen: Withdraw approval → the signal aborts → the tool is gone.</sub>

### 20

> Two companies answered a question about their shared customers. Neither saw the other's data. Airlock.

<sub>on screen: A permission check can be argued past. A tool that does not exist cannot. · github.com/jwlai-cloud/airlock-webmcp</sub>

