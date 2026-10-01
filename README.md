# BAGYT Academy

A complete, fictional Kazakhstan learning academy portfolio demo. Built as an independent React + TypeScript + Vite project; it does not modify the MammaMia demo.

## Run

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 4178 --strictPort
```

Open http://127.0.0.1:4178. This dedicated port avoids the first portfolio project's preview.

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4178
npm test
```

Browser tests expect the app running at http://127.0.0.1:4178. Install Chromium with `npx playwright install chromium` if necessary. The suite covers Kazakh and Russian on desktop and 360px mobile, all course routes, filters and empty states, comparison and its selection limit, finder matching and back navigation, consultation validation and review, language persistence, form progress, contact privacy, focus trapping, menu dismissal, image loading, and horizontal overflow.

## Structure

- `src/data.ts`: localized programme data and deterministic matching.
- `src/i18n.ts`: Kazakh and Russian interface copy.
- `src/main.tsx`: routes and reusable interface components.
- `src/styles.css`: responsive styling and reduced-motion support.
- `tests/journeys.spec.ts`: complete browser journeys.

## Routes and deployment

- `/`
- `/programmes/general-english`
- `/programmes/ielts`
- `/programmes/everyday-kazakh`
- `/programmes/interior-design`

Deploy the `dist` directory on a static host and configure fallback to `/index.html` for non-file routes. `public/_redirects` includes the Netlify/Cloudflare Pages fallback. Vite's dev and preview servers already support direct course links.

## Demo privacy

There is no backend, submission request, analytics, or tracking. Language and selected comparison course IDs may be saved in localStorage. Personal contact information exists only in React memory while the consultation is open; it is cleared on completion or closing the form. Reloading clears the form. Changing languages preserves progress.

Course fees are fictional prices per four weeks; full course totals are calculated proportionally. No student counts, instructor credentials, testimonials, or guaranteed exam outcomes are claimed.

## Assets

Photographs are downloaded and served locally under the [Unsplash License](https://unsplash.com/license). They are illustrative stock photographs, not BAGYT premises or students.

- Learning space: https://images.unsplash.com/photo-1524758631624-e2822e304c36
- Collaborative learning: https://images.unsplash.com/photo-1522202176988-66273c2fd55f

Noto Sans is locally hosted and subset to Latin, Cyrillic (including Ә Ғ Қ Ң Ө Ұ Ү Һ І), punctuation, arrows and the tenge symbol. Source: https://github.com/google/fonts/tree/main/ofl/notosans. SIL Open Font License is included at `public/fonts/OFL.txt`.
# bagyt
