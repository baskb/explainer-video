# Real screenshots of a website or app

A real screenshot of the product the audience will use is recognised at once; a drawn copy looks like any product. For a film about a website or web app, show the real thing in the scenes where it matters and draw the rest.

## Taking them: `npm run shoot`

`script/shoot.mjs` opens the page in the Chrome that Remotion downloads (no other browser needed; `npm install` adds `puppeteer-core`, which downloads nothing), runs the steps in `script/shots.json`, and saves each screenshot at twice the window size: `public/shots/<name>.png`, plus `public/shots/index.json` with the window size of each shot in CSS pixels.

```json
{
  "sequences": [
    { "url": "http://localhost:5173/", "steps": [{ "shot": "home" }, { "key": "p" }, { "click": "h1" }, { "type": "Say what we sell." }, { "shot": "comment" }] },
    { "url": "http://localhost:5173/", "phone": true, "steps": [{ "shot": "home-phone" }] }
  ]
}
```

- Steps: `wait` (ms), `key`, `type`, `hover` (CSS selector), `click` (CSS selector, with `count` 2 for a double click and `dx`/`dy` to click off centre), `hide` and `show` (a selector, for example the product's own overlay), `eval` (JavaScript; the result is printed, useful to read a position or to call the app's own API), `shot` (a name).
- The window is 1440 x 900 by default (`width`, `height` per sequence). `"phone": true` gives 390 x 716 with a phone user agent and touch, so the page uses its own phone layout. Never squeeze a desktop screenshot into a drawn phone: the page is cut off at both sides.
- The page gets the film's spoken language (`languages[0]` in `film.json`), so a Dutch film shows a Dutch page. Without that, the browser takes the computer's language.
- The script waits for the page to load, not for the network to be quiet: a page with a live connection (live reload, server events) is never quiet.
- Start the product's demo or dev server from a scratch folder, so it does not write review or cache files into a real project, and stop it afterwards.
- To bring the app into a state (a comment resolved, a panel open), prefer its own buttons or its own API (`eval` with `fetch`) over editing its files.

The Claude in Chrome extension can also take screenshots, but it saves them at about 1000 px wide: too soft for a 1080p film.

## Showing them: `components/screenshot.tsx`

- `ShotWindow` shows one or more screenshots in a drawn browser window. Each layer has its own opacity and crop, so one state fades into the next (page, then the page with a comment box, then the result).
- A crop is `{ x, y, w }` in CSS pixels of the page; `mixCrop(a, b, t)` moves between two crops (a zoom or a pan); `full(name)` is the whole screenshot. Zoom in on small text: a full 1440 px page in a 1100 px window makes 14 px text unreadable.
- `toBox(crop, boxWidth, x, y)` turns a point on the page into a point in the window, for `Mark` (an outline with a label), `Pin` and `Pointer` drawn on top. Read positions from the page with an `eval` step (`getBoundingClientRect`).
- `ShotImage` alone puts a screenshot in any box, for example inside a drawn phone.

## Privacy

- Only use screenshots taken for the film, of a demo page or sample content. Never reuse existing screenshots from a project folder without looking at them: they often show a client document, a personal photo, names, or a browser profile picture.
- Cover names and personal data that are still visible with a block of the same colour.
- The headless browser has no profile, history or sign-in, which keeps personal data out of the picture. For a page that needs a sign-in, ask the person how they want to handle it; do not sign in with their account.
