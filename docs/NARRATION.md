# Narration script — read this aloud

**23 lines, 393 words.** Aim for **about 2:15 of speech**; the picture adds
roughly 30 seconds on top, and the finished video must come in **under 3:00**. Read at a
brisk, natural pace — think explaining it to a colleague, not presenting to a room.
Do not add asides; the cut has no slack for them.

## How to record

**One continuous take.** Read the numbered lines in order and leave a clear pause —
about a second of silence — between each. Do not read the numbers aloud. If you fluff a
line, pause and read it again; you can drop the bad take when you check the split.

Save it anywhere (`.m4a`, `.wav`, `.mp3`) and give me the path, or run it yourself:

```bash
node tools/split-vo.js ~/Desktop/airlock-vo.m4a   # splits on your pauses
node tools/capture.js --tts file                  # re-cuts the video to your voice
```

`capture.js` projects the runtime before it records, so a read that runs long is caught
in a second rather than after a three-minute render. If the splitter finds the wrong
number of segments, retune it instead of re-recording:
`node tools/split-vo.js <file> 0.4 -30dB`.

Quiet room; a phone voice memo or a headset is fine — consistency beats a good
microphone. **No music**: the rules forbid copyrighted audio, and the cut needs none.

---

## The script

### 1

> Two companies have customers in common, and a question neither of them can answer alone. How many do we share? And how many more could we reach?

<sub>on screen: Two companies. One question neither can answer.</sub>

### 2

> Answering it means comparing two customer lists. Neither is allowed to show the other its list.

<sub>on screen: Neither is allowed to see the other's customer records.</sub>

### 3

> So today they hire a data clean room. Six figures a year, and both companies upload their customer files to a third party.

<sub>on screen: Today: a clean-room vendor, a contract, six figures, and weeks.</sub>

### 4

> To measure an overlap safely, both lists leave the building. The measurement creates the risk.

<sub>on screen: The data leaves both buildings to answer one question.</sub>

### 5

> WebMCP changes that. A page hands an agent a narrow set of verbs, and the browser enforces which origins can see them.

<sub>on screen: WebMCP lets a page hand an agent a narrow set of verbs.</sub>

### 6

> So the question travels to the data. The browser is the clean room.

<sub>on screen: So the question can travel instead of the data.</sub>

### 7

> This is Airlock. Two ordinary web apps on two different origins. An advertiser's workspace, and live on the right, the publisher's own console.

<sub>on screen: Airlock: two ordinary web apps, on two different origins.</sub>

### 8

> A marketer asks in plain language.

<sub>on screen: A marketer asks in plain language. Nothing is uploaded.</sub>

### 9

> It cannot. The tool that crosses the boundary is not registered, so it is not in the agent's tool list.

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

> The request crosses to the publisher's console as a tool call, where their officer decides independently.

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

> Ask about a segment too thin to be safe, and the answer is withheld rather than rounded.

<sub>on screen: Too few people matched. The number is withheld, not rounded.</sub>

### 19

> Every crossing is on the record, on both sides.

<sub>on screen: Every crossing is on the record, for both companies.</sub>

### 20

> The publisher exposes four capabilities here and nothing else. A third origin would not get a denial. It would not learn they exist.

<sub>on screen: The publisher publishes four capabilities here — and nothing else.</sub>

### 21

> That is the whole implementation. Registered with exposedTo, discovered with getTools, invoked with executeTool. Any agent drives it. We ship no key and no backend.

<sub>on screen: registerTool with exposedTo. getTools. executeTool.</sub>

### 22

> And it is revocable. Withdraw approval and the tool is unregistered. Gone, not disabled.

<sub>on screen: Withdraw approval and the capability is gone — not disabled.</sub>

### 23

> Two companies answered a question about their shared customers. Neither saw the other's data, and no vendor sat in between. Airlock.

<sub>on screen: A data clean room with no clean-room vendor in it.</sub>

---

## Using ElevenLabs

**Best route — the API, one request per line.** Each clip is exactly one beat, so nothing
has to be split afterwards and the timing is perfect:

```bash
export ELEVENLABS_API_KEY='...'
node tools/capture.js --list-voices                      # ids and labels on your account
node tools/capture.js --tts eleven --voice-id <id>
```

`eleven_multilingual_v2` is the default model; override with `--eleven-model`. Voice
settings are set for narration (stability 0.45, similarity 0.75, speaker boost on) — edit
`synthEleven` in `tools/capture.js` if you want them different.

**Or the web UI.** Paste `docs/NARRATION-paste.txt`, which is the same script with
`<break time="1.2s" />` between lines so the pauses are clean and even. Download the mp3,
then:

```bash
node tools/split-vo.js ~/Downloads/airlock.mp3
node tools/capture.js --tts file
```

Pick a voice that reads *explanatory*, not *promotional* — this is a technical
explanation, and an over-produced trailer read will undercut it. A measured, slightly dry
delivery suits the argument better than enthusiasm.

## If you would rather not record it

```bash
npm run capture                                     # macOS Karen (Premium)
node tools/capture.js --voice "Lee (Premium)"       # any installed voice
GEMINI_API_KEY=... node tools/capture.js --tts gemini --gemini-voice Charon
```
