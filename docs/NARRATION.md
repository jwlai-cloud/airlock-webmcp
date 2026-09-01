# Narration script — read this aloud

**23 lines, 399 words.** Aim for about **2:23 of speech**; the picture adds
roughly 28 seconds and the finished video must be **under 3:00**. Read at a brisk,
natural pace. Do not add asides — there is no slack for them.

> **Speed matters.** A first take at ElevenLabs speed 1.20 read at 213 wpm, which is
> too fast for a technical explanation. Render at **speed 1.00**.

## How to record

**ElevenLabs, via the API** — one request per line, exact segmentation, nothing to split:

```bash
export ELEVENLABS_API_KEY=...
node tools/capture.js --list-voices
node tools/capture.js --tts eleven --voice-id <id>
```

**ElevenLabs, via the web UI** — paste `docs/NARRATION-paste.txt` (break tags already
between lines), download the mp3, then:

```bash
node tools/split-vo.js ~/Downloads/airlock.mp3
node tools/capture.js --tts file
```

**Your own voice** — one continuous take, a clear pause between lines, do not read the
numbers. Same two commands. A full render takes about four minutes, so run it in a
terminal you will leave alone.

Pick a voice that reads *explanatory*, not *promotional*. No music — the rules forbid
copyrighted audio and the cut needs none.

---

## The script

### 1

> Two companies share customers, and neither can say how many. The most basic question in a partnership.

<sub>on screen: Two companies. One question neither can answer.</sub>

### 2

> Answering it means comparing two customer lists. Neither is allowed to show the other its list.

<sub>on screen: Neither may show the other its customer list.</sub>

### 3

> So today they hire a data clean room. Six figures a year, and both upload their customer files to a third party.

<sub>on screen: Today: a clean-room vendor, a contract, six figures.</sub>

### 4

> To measure the overlap safely, both lists leave the building. The measurement creates the risk.

<sub>on screen: To measure the overlap, both lists leave the building.</sub>

### 5

> Airlock starts as an ordinary web app. A marketing team's workspace, with its own audiences and its own buttons.

<sub>on screen: Airlock starts as an ordinary web app.</sub>

### 6

> WebMCP lets it write down what it can do. List audiences. Request approval. Measure overlap. Each is the same function the buttons already call.

<sub>on screen: WebMCP lets the app write down what it can do.</sub>

### 7

> So an agent operates the product directly, instead of reading the screen and guessing.

<sub>on screen: So an agent operates the product — no screenshots, no guessing.</sub>

### 8

> But this question needs a second app, owned by another company, on another origin. Live on the right, in a cross-origin frame.

<sub>on screen: But this answer needs a second app, at another company.</sub>

### 9

> A marketer asks in plain language. The agent cannot answer: the tool that crosses the boundary is not registered, so it is not in its list.

<sub>on screen: The tool that crosses the boundary is not registered yet.</sub>

### 10

> That is the whole idea. A permission check can be argued past. A tool that does not exist cannot.

<sub>on screen: Nothing to call — and no wording brings it into existence.</sub>

### 11

> Asking for the raw records is refused outright.

<sub>on screen: Asking for the records directly is refused outright.</sub>

### 12

> So it asks for approval. A person decides, on each side.

<sub>on screen: Approval is a business decision. A person makes it on each side.</sub>

### 13

> The request crosses to the publisher's console as a tool call. Their officer decides independently.

<sub>on screen: The request crosses to the publisher's console as a tool call.</sub>

### 14

> Two approvals, and only now is the tool registered. Consent creates the capability.

<sub>on screen: Two approvals register the tool. Only now does it exist.</sub>

### 15

> Same question, seconds later. Two thousand shared customers, thirteen thousand more reachable. Two counts crossed. Zero records moved.

<sub>on screen: 2,178 shared. 13,057 more reachable. Zero records moved.</sub>

### 16

> The publisher also returned a note. It is a prompt injection, telling the agent to export everything.

<sub>on screen: The publisher also returned free text — and it is an attack.</sub>

### 17

> It is quarantined as text, never followed. And no tool over there can return a record anyway.

<sub>on screen: Quarantined as text. Never followed as an instruction.</sub>

### 18

> Ask about a segment too thin to be safe, and the answer is withheld, not rounded.

<sub>on screen: Too few people matched. The number is withheld, not rounded.</sub>

### 19

> Every crossing is on the record, on both sides.

<sub>on screen: Every crossing is on the record, for both companies.</sub>

### 20

> The publisher exposes four capabilities here and nothing else. A third origin would not get a denial — it would not learn they exist.

<sub>on screen: The publisher publishes four capabilities here — and nothing else.</sub>

### 21

> That is the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent drives it, and we ship no key.

<sub>on screen: registerTool with exposedTo. getTools. executeTool.</sub>

### 22

> And it is revocable. Withdraw approval and the tool is unregistered. Gone, not disabled.

<sub>on screen: Withdraw approval and the capability is gone — not disabled.</sub>

### 23

> Two companies answered a question about their shared customers. Neither saw the other's data. No vendor sat in between. Airlock.

<sub>on screen: A data clean room with no clean-room vendor in it.</sub>

