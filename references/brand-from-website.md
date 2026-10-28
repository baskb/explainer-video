# Brand from the company website

The films look like the company because colours, font and logo come from its own website. This takes about ten minutes.

## Steps

1. Run the script from the skill folder (standard Python, no packages), with the output inside the film project:

   `python -I <skill>/scripts/extract-brand.py https://www.company.com --out brand-candidates`

   It reads the home page and up to ten stylesheets and writes `brand-candidates/brand.json` (colour variables, the most used colours without greys, the greys, fonts, Google Fonts links) and downloads logo candidates (`img` with "logo" in its name or class, inline `<svg>` logos, icons, the share image).

2. Look at the logo files with the Read tool. Pick a version for dark backgrounds (white or light) and one for light backgrounds. SVG is best. If only one colour version exists, make the other by changing the `fill` in the SVG. Copy them to `public/brand/logo-light.svg`, `logo-dark.svg` and `mark.svg` (symbol only, if there is one), and set `RATIO` in `src/brand/Logo.tsx` to width divided by height (from the SVG `viewBox`). PNG works too, when it is transparent and has no empty border (an SVG on a large empty canvas is worse than a tight PNG): put the PNG names in `FILES` in `Logo.tsx` and take the ratio from `ffprobe -v error -show_entries stream=width,height -of csv=p=0 file.png`. If the brand has only a version for dark backgrounds and the film has no light scenes, use it for both.

3. Choose the colours for `src/brand/theme.ts`:
   - `bgDeep`, `bg`, `bgGlow`: the darkest brand colour and two lighter steps of it, for the background gradient. Most corporate sites have a dark navy, green or grey; explainer films read best on a dark background with light text.
   - `primary`: the main brand colour. `accent`: the colour used for links and highlights on the site (often a lighter blue or the logo colour); in the film it marks the thing that matters. `highlight`: a warm contrast colour if the site has one (orange, yellow), used sparingly.
   - `good`, `warn`, `bad`: keep green, amber, red for meaning, adjusted to sit well with the brand.
   - `onAccent`: the text colour on a filled accent shape (badges, pins). White on a dark accent; the darkest brand colour on a light accent such as orange, yellow or light blue.
   - Check contrast: white text on `bg` and `card`, and `accent` text on `bg`, must be easy to read at 1080p.

4. Font: many brands have a body font and a separate headline font. `FONT` in `theme.ts` is the body font; `DISPLAY` and `DISPLAY_WEIGHT` are used by headlines and big numbers (`Headline`, `Counter`, the drawings). By default `DISPLAY` is the body font at weight 800. For a headline font with one weight (Bebas Neue, Anton), load it as `DISPLAY` and set `DISPLAY_WEIGHT` to that weight, so the browser never makes up a bold version. `MONO` is used for terminal text and file names. Use the site's font if `@remotion/google-fonts` has it (Roboto, Inter, Open Sans, Montserrat, Lato, Poppins, Source Sans 3, Nunito, and many more). Change the import in `theme.ts`: `import { loadFont } from "@remotion/google-fonts/Roboto";`. If the site uses a paid font, take the closest Google font and note it in the README.

5. Show the person the choice before building: the logo files and the colours (a quick still of the title page with `npm run stills -- "scene-s00:120"` is the easiest way). Ask them to confirm.

## Rules

- Logo, colours and font belong to the company. Fine for an internal film made for that company; check the company's brand rules before anything is shown outside.
- If no logo is approved yet, keep the placeholder and say so.
- Do not put logos of other products in the film. Product names appear as plain text.
- A real screenshot of something the audience knows (their intranet, a tool) makes them recognise it at once. Cover personal names in it with a block of the same colour.
