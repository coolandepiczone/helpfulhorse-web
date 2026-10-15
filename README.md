# Helpful Horse (web)

A transparent, click-through desktop-pet-for-the-web. Drop one `<script>` tag
onto a page and a little horse shows up, wanders around, and every so often
tells a joke, a "fact", or types up a short story for you. It's a port of the
[original HelpfulHorseSafe](https://github.com/coolandepiczone/HelpfulHorseSafe)
PyQt5 desktop app to plain HTML/CSS/JS, so any website can embed it for fun.

Art by [papitas](https://bsky.app/profile/papitas.art).

## What it actually does

Nothing sneaky. The whole widget is one JS file that:

- Injects a single `#helpfulhorse-root` container into `document.body`,
  positioned `fixed` and transparent, sitting above the rest of the page.
- Has `pointer-events: none` on that container, so every click/scroll/etc.
  passes straight through to the page underneath - except when it lands on
  the horse itself (or its menu/notepad/dialog), which do accept clicks.
- Makes zero network requests and asks for zero real permissions. The
  "Allow Helpful Horse to access your contacts?" dialog you might see is a
  styled `<div>` for the joke - it never calls a real browser permission API.
- Never touches anything outside its own container. The "story typing" bit
  types into an in-page fake Notepad window, not anything else on the page
  or your OS (the original desktop app could pop open real Notepad and type
  into whatever window had focus - that doesn't translate to the web, on
  purpose).

## Using it on a page

Copy `helpfulhorse.js` and the `assets/` folder somewhere your site serves
static files from, then add:

```html
<script src="/path/to/helpfulhorse.js" defer></script>
```

That's it - the horse appears and starts its idle loop automatically.

`index.html` in this repo is a minimal demo page you can open directly to see
it running.

### This repo is private

Because this repo is private, other sites can't just point a `<script src>`
at `raw.githubusercontent.com` or a CDN like jsDelivr (those only work for
public repos) - GitHub will return a 404/401 for anyone without access. To
actually run this on a site, either:

- Self-host `helpfulhorse.js` + `assets/` on your own static hosting (your
  site, GitHub Pages on a public repo, a public storage bucket, etc.), or
- Flip this repo to public later if you want to serve it straight from
  GitHub via a CDN.

### Configuration

Options can be set either as `data-*` attributes on the script tag, or via a
global `window.HelpfulHorseConfig` object set *before* the script loads.

```html
<script src="helpfulhorse.js" data-size="220" data-timer="30000" defer></script>
```

| Option      | `data-*` attr   | Default   | Meaning                                     |
|-------------|------------------|-----------|----------------------------------------------|
| `basePath`  | `data-base-path` | script's own folder + `assets/` | Where to load the gifs/png from |
| `size`      | `data-size`      | `180`     | Horse width/height in px                     |
| `timer`     | `data-timer`     | `60000`   | Milliseconds between idle "what should I do" checks |
| `speed`     | `data-speed`     | `1.4`     | Walking speed in px per animation frame       |
| `autostart` | `data-autostart` | `true`    | Set to `"false"` to load without starting the idle loop |

### Programmatic API

```js
window.HelpfulHorse.tellJoke();
window.HelpfulHorse.tellFact();
window.HelpfulHorse.tellStory();
window.HelpfulHorse.wave();
window.HelpfulHorse.followCursor();
window.HelpfulHorse.stopFollowing();
window.HelpfulHorse.start();   // (re)start the idle behaviour loop
window.HelpfulHorse.stop();    // pause the idle loop
window.HelpfulHorse.destroy(); // remove the horse from the page entirely
```

## Files

- `helpfulhorse.js` - the whole widget, vanilla JS, no dependencies.
- `assets/` - the horse gifs/pngs, reused from the original desktop app.
- `index.html` - a demo/test page.

## Notes

- Only tested in modern Chromium/Firefox. Animated GIF restart relies on
  reassigning `<img src>`, which is supported everywhere but may flicker
  slightly on slow connections the first time an animation plays.
- This is just for fun - there's nothing here that reads page content,
  phones home, or persists anything.
