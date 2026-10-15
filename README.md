# Helpful Horse (web)

A transparent, click-through desktop-pet widget for the web. Add one
`<script>` tag and a horse wanders your page, telling jokes, facts, and
stories - purely cosmetic, no network calls, no real permissions, clicks
pass straight through it except when they land on the horse. Ported from the
[original PyQt5 app](https://github.com/coolandepiczone/HelpfulHorseSafe).
Art by [papitas](https://bsky.app/profile/papitas.art).

**Live demo:** https://coolandepiczone.github.io/helpfulhorse-web/

## Usage

```html
<script src="https://coolandepiczone.github.io/helpfulhorse-web/helpfulhorse.js" defer></script>
```

Or self-host `helpfulhorse.js` + `assets/`.

### Config

Set as `data-*` attrs on the script tag, or via `window.HelpfulHorseConfig`
before it loads: `size` (px, default `180`), `timer` (ms between idle
actions, default `60000`), `speed` (px/frame, default `1.4`), `autostart`
(`"false"` to disable), `basePath` (where to load `assets/` from).

### API

```js
window.HelpfulHorse.tellJoke() / tellFact() / tellStory() / wave();
window.HelpfulHorse.followCursor() / stopFollowing();
window.HelpfulHorse.start() / stop() / destroy();
```
