# Brag Plan: Cafe Landing

## What is this app?
A template that turns one `cafe.json` into a polished, personalised landing page for a real cafe, sent to the owner by DM as a sales pitch, with a tracker that tells you when they opened it.

## The angle
The product sells websites to cafe owners, so the video sells it the way the page does: quiet, editorial, confident. The surprise is the mechanism behind the pretty page: change one line of JSON and it is a different cafe; send the link and you know the moment they look.

## Hook (first 2-3 seconds)
The real hero: the serif wordmark KOPI SENJA settles on the greige ground and the iced latte photo rises into its lower edge, exactly as the live page does. No caption yet. The page is the hook.

## Key moments (the middle)
- The `cafe.json` card types `"name": "Kopi Senja"`, then the name is retyped to `"Rumah Teduh"` and the wordmark beside it swaps on the beat.
- The DM: a chat bubble arrives carrying the link-preview card (hero photo, title, domain), then the real mobile page scrolls inside a phone.
- The admin row flips from "Belum dibuka 0×" to "Dibuka 1× · baru saja · HP" with the green dot.

## Outro / punchline
Dark band like the site footer: "Satu file. Satu cafe. Satu link." then "Cafe Landing · React · NestJS · SQLite".

## User flow worth showing
Edit `cafe.json` → share the link by DM (preview card) → owner opens it → admin shows "Dibuka".

## Tone
- Preset: polished
- Creative direction: quiet editorial cafe film, matching the NORD/NORA-style site
- Interpretation: few scenes, longer holds, soft slides and crossfades, restrained SFX, no jokes; confidence through the real UI.

## Format: landscape — 1920x1080
## Duration: 21s

## Visual identity (from the project)
- Background: #EFEAE2 (greige), surface #E2DACE
- Accent / band: #171513 (near-black), band text #EFEAE2
- Text: #171513, muted #665E54
- Status green: #3E8E5E
- Display font: Bodoni Moda (variable, uppercase wordmark)
- Body font: Hanken Grotesk (uppercase tracked labels as the identity motif)
- Strongest visual element: the oversized serif wordmark with the product photo overlapping it

## Share copy (draft)
Bikin template landing page cafe: satu cafe.json jadi website personal untuk tiap cafe, dikirim lewat DM, dan aku tahu kapan pemiliknya membuka link-nya. React + NestJS.

## Audio direction
- Role: warm bed with sparse professional accents
- Music: happy-beats-business-moves-vol-9 (114.8 BPM), fade in 0.6s, fade out over the last 1.5s
- Music cue guidance: preset cues read. Strong cues: 6.34s (name swap), 14.22s (admin flips to Dibuka), 20.53s (outro land). Beat grid ~0.525s; the three product thumbnails could snap to beats 9.50/10.01/10.54 but they are not read text so every beat is fine.
- Audio-reactive treatment: none (polished restraint; the page is static and calm)
- SFX posture: sparse, low high-frequency risk
- Audio-coupled moments: soft impact on wordmark settle; light key ticks while the JSON types; switch on the name swap; click as the chat bubble lands; bong when the admin row flips; soft impact on the outro
- Restraint rule: no SFX on every element; nothing bright or clicky repeated

## Storyboard

### Scene 1 — The page — 0.0-3.7s
Greige ground. KOPI SENJA wordmark (Bodoni, uppercase, ~300px) settles from slight scale; hero photo rises into its lower edge. Small labels left "KOPI GULA AREN / SEJAK 2019", right "COBLONG / BANDUNG".
Sequential/interaction: wordmark then photo
Audio intent: warm opening
Audio-coupled idea: soft impact as the photo lands (~1.07 beat)
Transition mood: soft slide → Scene 2

### Scene 2 — One file — 3.7-7.9s
Left: a code card titled `content/cafes/<slug>/cafe.json` typing `"name": "Kopi Senja"`. Right: the wordmark. At 6.34 the value retypes to `"Rumah Teduh"` and the wordmark swaps. Headline above: "Satu file JSON. Satu website cafe." (holds ≥1.5s)
Sequential/interaction: typing, then retype
Audio-coupled idea: key ticks while typing; switch at 6.34 (beat-locked)
Transition mood: clean wipe → Scene 3

### Scene 3 — The DM — 7.9-12.6s
Left: chat bubble with the link-preview card (hero photo, "Kopi Senja · Coblong, Bandung", "namamu.my.id/kopi-senja"). Right: phone frame with the real mobile page screenshot scrolling slowly. Headline "Dikirim lewat DM." (holds ≥1.2s)
Sequential/interaction: bubble lands, then page scrolls
Audio-coupled idea: click as the bubble lands
Transition mood: soft crossfade → Scene 4

### Scene 4 — The signal — 12.6-16.9s
The admin table (system UI, white card on light ground) with one row: Kopi Senja /kopi-senja, "Belum dibuka", 0×. At 14.22 it flips to "Dibuka", 1×, "baru saja · HP", green dot. Headline "Kamu tahu saat link dibuka." (holds ≥1.5s)
Sequential/interaction: status flip
Audio-coupled idea: bong on the flip (beat-locked 14.22)
Transition mood: slide up → Scene 5

### Scene 5 — Outro — 16.9-21.0s
Near-black band. "Satu file. Satu cafe. Satu link." in Bodoni, then "CAFE LANDING · REACT · NESTJS · SQLITE" small tracked label. Land at 20.53.
Audio-coupled idea: soft impact at 20.53
Transition mood: end on hold

**Music mood for this video:** upbeat but calm
**Audio summary:** a warm business bed fades in under the page, a few quiet accents mark typing, the swap and the "Dibuka" signal, and it fades out under the dark outro.
