# BAGYT Academy

BAGYT Academy is a bilingual website concept for a fictional learning academy in Almaty, Kazakhstan. It helps prospective learners explore language and creative courses, compare their options, and find a programme that fits their goals.

The project is a portfolio demo of the journey from discovering a course to completing a consultation form. Its central idea is choosing your next direction, expressed through an interactive compass and the message: **“Келесі қадамыңды таңда.” — “Choose your next step.”**

## The experience

- **Kazakh and Russian:** switch languages throughout the site, including course details and forms.
- **Interactive course compass:** explore four learning directions using a mouse, touch, or keyboard.
- **Programme explorer:** filter courses by subject and online or in-person format.
- **Course details:** review entry requirements, curriculum, a sample study week, expected outcomes, and example tuition fees.
- **Side-by-side comparison:** compare two programmes by duration, level, workload, format, and price.
- **Programme finder:** answer three questions about your goal, experience, and preferred format to find a matching course.
- **Demo consultation:** complete a form with validation, review your details, and see a confirmation screen.

## Learning directions

| Programme | Focus | Format |
| --- | --- | --- |
| General English | English for everyday communication | Online or in person |
| IELTS | Academic exam preparation across all four sections | Online or in person |
| Everyday Kazakh | Practical language for daily conversations | Online |
| Interior Design | Space planning, colour, materials, and a first room concept | In person |

In-person formats are set in Almaty. All programmes, schedules, and prices are illustrative.

## Design and interaction

The visual identity combines bold typography, orange accents, directional arrows, and individual course symbols. Scroll progress, section navigation, and animated transitions reinforce the idea of moving toward a new goal.

Responsive layouts support desktop and mobile screens. Keyboard controls, visible focus states, modal focus management, and reduced-motion support are part of the interface.

Built with React, TypeScript, and Vite, with React Router for navigation and Lucide icons.

## Routing and Vercel deployment

The app uses Vite and React Router's `BrowserRouter`. Vercel builds with `npm run build` and serves `dist`. The root `vercel.json` rewrites `/programmes/*` requests to `/index.html`, so course URLs work when opened directly or refreshed. React Router renders the requested course without changing the URL. The rule does not match `/assets/*`, `/images/*`, `/fonts/*`, or `/favicon.svg`.

`public/_redirects` is for hosts that support that file; Vercel uses `vercel.json`. Redeploy the project after uploading this configuration. In Vercel, the Root Directory must point to the directory containing `package.json` and `vercel.json`.

To check a local production build, run `npm run build`, start `npm run preview`, then run `npm test -- tests/routes.spec.ts` in another terminal. Each programme is checked through a home-page link, in a new tab opened directly, and after a reload. Static images, fonts, favicon, JS and CSS are checked for successful responses and correct content types.

To run the same checks against a deployment:

```sh
PLAYWRIGHT_BASE_URL=https://your-project.vercel.app npm test -- tests/routes.spec.ts
```

## About the demo

BAGYT Academy is a fictional academy, and the site does not accept real enrolments or send consultation requests. The programme finder uses simple matching rules; it is not a language placement test.

There is no backend, analytics, or tracking. Language preferences and comparison selections may be saved in the browser. Contact details remain in memory while the consultation is open and are cleared when it is closed or completed.

Example fees are shown in Kazakhstani tenge per four weeks, with full course totals on the programme pages.

## Assets

Photographs are downloaded and served locally under the [Unsplash License](https://unsplash.com/license). They are illustrative stock photographs, not BAGYT premises or students.

- Learning space: https://images.unsplash.com/photo-1524758631624-e2822e304c36
- Collaborative learning: https://images.unsplash.com/photo-1522202176988-66273c2fd55f

Noto Sans is locally hosted and subset to Latin, Cyrillic (including Ә Ғ Қ Ң Ө Ұ Ү Һ І), punctuation, arrows and the tenge symbol. Source: https://github.com/google/fonts/tree/main/ofl/notosans. SIL Open Font License is included at `public/fonts/OFL.txt`.
