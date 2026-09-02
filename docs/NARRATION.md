# Narration script — read this aloud

**20 lines, 370 words.** Aim for about **2:12 of speech**; the picture adds
roughly 26 seconds and the finished video must be **under 3:00**.

> **Render at ElevenLabs speed 1.00.** A take at 1.20 read at 213 wpm, which is too
> fast for a technical explanation.

This version opens with the product working and the argument landing inside the first
fifteen seconds, which is what the organisers asked for. Lines 1 to 3 are the cold
open: an agent is asked a question, cannot answer, and the reason is the whole point.

> **If credits are tight, use the API rather than the web UI.** ElevenLabs bills per
> character of what you send, and the `<break time="1.2s" />` tags the web UI needs are
> billed too — nineteen of them is 437 characters of pure markup. Rendering line by line
> through the API sends only the speech: **2,182 characters instead of 2,619**, and the
> segmentation is exact so nothing has to be split afterwards.
>
> `node tools/capture.js --estimate` prints the cost before you spend it.
> `eleven_flash_v2_5` costs about half of `eleven_multilingual_v2` if you need it.

## How to record

```bash
# ElevenLabs API — one request per line, exact segmentation
export ELEVENLABS_API_KEY=...
node tools/capture.js --list-voices
node tools/capture.js --tts eleven --voice-id <id>

# or the web UI: paste docs/NARRATION-paste.txt, download, then
node tools/split-vo.js ~/Downloads/airlock.mp3
node tools/capture.js --tts file
```

---

## The script

### 1

> A marketer asks an agent how their customers overlap with a partner's audience.

<sub>on screen: A marketer asks an agent about a partner's audience.</sub>

### 2

> It cannot answer. The tool that crosses the boundary is not registered, so it is not in the agent's tool list at all.

<sub>on screen: It can't. That tool is not registered — getTools() never returns it.</sub>

### 3

> That is Airlock, and that is the whole idea. A permission check is something a model can be argued past. A tool that does not exist is not.

<sub>on screen: A permission check can be argued past. A missing tool cannot.</sub>

### 4

> Two companies share customers and neither can say how many. Answering it means comparing two customer lists, and neither may show the other its list.

<sub>on screen: Two companies. One question neither can answer.</sub>

### 5

> Today that means a data clean room. Six figures a year, and both companies upload their customer files to a third party. The measurement creates the risk.

<sub>on screen: Today: a clean-room vendor, six figures, both files uploaded.</sub>

### 6

> Airlock is two ordinary web apps on two different origins. An advertiser's workspace, and live on the right, the publisher's own console.

<sub>on screen: Airlock is two ordinary web apps, on two different origins.</sub>

### 7

> WebMCP lets each app write down what it can do. List audiences. Request approval. Measure overlap. Each is the same function the buttons already call.

<sub>on screen: WebMCP: each app declares what it can do.</sub>

### 8

> Asking the publisher for the raw records is refused outright.

<sub>on screen: Asking for the records directly is refused outright.</sub>

### 9

> So it asks for approval. A person decides, on each side.

<sub>on screen: Approval is a business decision. A person makes it on each side.</sub>

### 10

> The request crosses to the publisher's console as a tool call. Their officer decides independently.

<sub>on screen: The request crosses to the publisher's console as a tool call.</sub>

### 11

> Two approvals, and only now is the tool registered. Consent creates the capability.

<sub>on screen: Two approvals → registerTool(). Watch the tool list.</sub>

### 12

> Same question, seconds later. Two thousand shared customers, thirteen thousand more reachable. Two counts crossed. Zero records moved.

<sub>on screen: 2,178 shared. 13,057 more reachable. Zero records moved.</sub>

### 13

> The publisher also returned a note. It is a prompt injection, telling the agent to export everything.

<sub>on screen: The publisher also returned free text — and it is an attack.</sub>

### 14

> It is quarantined as text, never followed. And no tool over there can return a record anyway.

<sub>on screen: Quarantined as text. Never followed as an instruction.</sub>

### 15

> Ask about a segment too thin to be safe, and the answer is withheld, not rounded.

<sub>on screen: Too few people matched. The number is withheld, not rounded.</sub>

### 16

> Every crossing is on the record, on both sides.

<sub>on screen: Every crossing is on the record, for both companies.</sub>

### 17

> The publisher exposes four capabilities here and nothing else. A third origin would not get a denial — it would not learn they exist.

<sub>on screen: exposedTo: four capabilities to this origin, nothing else.</sub>

### 18

> That is the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent drives it, and we ship no key.

<sub>on screen: All of it: registerTool · exposedTo · getTools · executeTool.</sub>

### 19

> And it is revocable. Withdraw approval and the tool is unregistered. Gone, not disabled.

<sub>on screen: Withdraw approval → the signal aborts → the tool is gone.</sub>

### 20

> Two companies answered a question about their shared customers. Neither saw the other's data. No vendor sat in between. Airlock.

<sub>on screen: A permission check can be argued past. A tool that does not exist cannot. · github.com/jwlai-cloud/airlock-webmcp</sub>

