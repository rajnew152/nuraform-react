# Nuraform — React replica

High-fidelity React rebuild of the [nuraform.com](https://www.nuraform.com/) homepage, built from
the HTTrack mirror in `../nuraform/`. Assets, fonts, videos and animation parameters are reused
from that mirror rather than reinterpreted.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # -> dist/
npm run preview   # serve the production build
```

---

## 1. Audit of the existing download

The mirror is **not** a Webflow export — the original is an **Astro** site (`_astro/` bundles,
`BaseLayout.astro_…`). What the audit found:

| Area | Finding |
| --- | --- |
| HTML | `nuraform/www.nuraform.com/index.html` — minified single line; root `index.html` is the same page with UTM query params. |
| CSS | Two stylesheets for the homepage: `_slug_.CDEP6yqJ.css` (globals, nav, buttons, section titles, footer) and `index.KDZ-ojfk.css` (hero, about, how, features, testimonials). Both fully present. |
| JS | `BaseLayout.…js` (nav drawer, footer reveal, ScrollSmoother, `[data-text-effect]`) and `index.…js` (hero loop, parallax, pinned intro, use-case wheels, video behaviour). Both present and readable. |
| **Broken** | The three GSAP chunks these bundles import — `index.CH_iu5NA.js`, `ScrollTrigger.C4gmGO9R.js`, `SplitText.Cpc1cBKW.js` — **were never downloaded**. HTTrack skipped them. |
| Images / SVG | All 52 referenced assets present. Nothing missing. |
| Video | All 8 `.mp4` clips plus every `poster` image present. |
| Fonts | `Antonia-Variable.otf` and `DMSans-Variable.ttf` present; both are variable fonts driven by `font-variation-settings`. |
| WebGL | The hero background is a remote **UnicornStudio** scene (`data-us-project="R4QGWiyS7SYks3bqd6Y5"`). The runtime `unicornStudio.umd.js` is mirrored locally; the scene definition is fetched from UnicornStudio at runtime. |

### How the gaps were closed

- **GSAP** — installed from npm at **exactly 3.13.0**, the version the original bundles were built
  against. Since 3.13 the public package includes ScrollSmoother, SplitText, ScrollToPlugin and
  ScrollTrigger, so all four plugins the site uses are available.
- **UnicornStudio** — the mirrored `unicornStudio.umd.js` is served from `public/vendor/` and booted
  by `useUnicornStudio`. The hero keeps its solid `#ff633e` fallback if the scene cannot be fetched.
- Everything else was copied straight out of the mirror into `public/`.

---

## 2. Architecture

```
src/
  App.jsx                    ScrollSmoother host + section composition
  main.jsx                   root render
  lib/
    gsap.js                  plugin registration + the two breakpoint flags
    SmootherContext.jsx      shares the smoother with the nav drawer
  hooks/
    useGsapEffect.js         gsap.context() scoped to a ref, reverted on unmount
    useSplitTextEffect.js    the site-wide [data-text-effect] heading reveal
    useUnicornStudio.js      loads + boots the hero WebGL runtime
    useIsomorphicLayoutEffect.js
  components/
    Navbar/        nav bar + full-screen mobile drawer
    Hero/          banner, typewriter loop, masked images, motif parallax
    About/         About → Intro (pinned copy) + UseCases (counter-rotating wheels)
    ProductDemo/   the three numbered "how" steps → HowBlock
    FeatureSection/ two sliders → FeatureGroup → FeatureCard
    Testimonials/  floating bubbles + spinning gradient
    CTA/           closing call to action (lives inside the footer, as in the original)
    Footer/        bar skyline reveal, logo + avatar fly-out, links, legal
    CtaButton/     the pill button used everywhere
    SectionTitle/  subtitle + heading + description
    VideoWrapper/  looping clip with play/pause toggle
    Logo/, icons/  logo marks and icons as inline SVG
```

Copy and asset lists live in a `*Data.js` file beside each component, so no component holds
hard-coded content inline.

### Why plain component CSS instead of CSS Modules

Each component owns one stylesheet, co-located and imported by that component. The class names are
kept **identical to the original** rather than hashed, because the original's cascade depends on
them in ways hashing would silently break:

- descendant selectors that cross component boundaries
  (`.nav__menu .content .--cta > .cta-button:first-of-type`,
  `.how__blocks .--block.--right .--img .video-wrapper__button-wrapper`);
- structural selectors (`.--bubbles div:nth-of-type(3)`, `.bar:nth-child(4)`);
- GSAP and ScrollSmoother reading the DOM by class and attribute
  (`.masked-img`, `[data-text-effect]`, `[data-speed]`, `[data-lag]`).

Modularity comes from the file layout; fidelity comes from leaving the selectors alone.

---

## 3. Animations ported

| Animation | Where | Notes |
| --- | --- | --- |
| Smooth scrolling | `App.jsx` | `ScrollSmoother`, `smooth: 1.2`, `effects: true`. Disabled below 768px, as in the original. |
| `data-speed` / `data-lag` parallax | markup | Driven by ScrollSmoother's effects; values copied from the original markup. |
| Hero prompt typewriter + circle wipe | `Hero.jsx` | Infinite timeline: 1.6s `power4.out` clip-path wipe, 0.03s/char typing, 2.5s hold, then un-typing. |
| Hero motif drift | `Hero.jsx` | Scrubbed timeline, `x: 150 / -120 / 60 / -240 / 60`. |
| Nav light theme over hero | `Hero.jsx` | ScrollTrigger toggling `.white`. |
| Pinned intro copy | `About/Intro.jsx` | SplitText words per line + glyph scaling 0 → 2. |
| Use-case wheels | `About/UseCases.jsx` | 8 spokes, 20° apart, 340° sweep, content counter-rotated. |
| "How" media parallax | `ProductDemo.jsx` | ±20% slide-in; above 768px only. |
| Heading word reveal | `useSplitTextEffect.js` | `rotationX: -90 → 0`, 0.05s stagger, `scrub: 0.9`. Above 768px only. |
| Testimonial motif drift | `Testimonials.jsx` | Above 768px only. |
| Footer skyline | `Footer.jsx` | Bars scale up from the centre outwards, then the logo and three avatars fly to their CSS positions. |
| Hover-to-play video | `VideoWrapper.jsx` | `--m` clips start paused on desktop and play only while hovered. |

### Two fidelity details worth knowing

- **`Intro.jsx` animates the background wrapper as a beat.** The original iterates
  `.--intro .container div`, which includes `.--bg`. Its empty word-split and fade still occupy a
  beat of the scrubbed timeline, so dropping it would redistribute the scroll range and desync the
  three real lines. It is kept in the list deliberately; its own fade is a no-op because
  `.--intro .--bg` is `opacity: 1 !important`.
- **`VideoWrapper` keeps its toggle in the "pause" state from the start**, matching the original —
  the control is only visible on hover, at which point the clip really is playing.

### One deliberate fix, not a redesign

ScrollTrigger measures pin positions when a trigger is created. In a bundled React app that happens
before the variable fonts have swapped in, which changes the height of every wrapped paragraph and
therefore every pin start below it — and ScrollTrigger's automatic `load` refresh can fire before
React has even mounted. `App.jsx` therefore calls `ScrollTrigger.refresh()` after mount and again on
`document.fonts.ready`. Without this the pinned intro started at scroll 0 instead of 428px on mobile.

`main.jsx` renders without `StrictMode` on purpose: ScrollSmoother installs a single global scroll
proxy, and the deliberate double-mount would build and tear down the whole scroll rig on every load.

---

## 4. QA results

Verified with headless Chromium against the live site at 1512×900, 900×1000 and 390×844, sampling
12 scroll positions per viewport.

**Layout metrics are an exact match at all three viewports** — document height, every section
height and offset, `h1` size, hero circle and prompt-bar widths:

| | docH | h1 | banner | about | how | features | testimonials | footer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop (ref = replica) | 12774 | 64px | 900 | 6030 | 2492 | 1971 | 900 | 1039 |
| Tablet (ref = replica) | 12674 | 56px | 910 | 6700 | 1850 | 1669 | 1000 | 915 |
| Mobile (ref = replica) | 10900 | 40px | 934 | 5655 | 1889 | 1631 | 886 | 969 |

Interaction and integrity checks (production build, 18/18):

- mobile drawer open/close, burger morph, link slide-in, social fade-in, backdrop dismiss
- nav light-theme toggle over the hero
- CTA hover — label offset, fill and both arrows are byte-identical to the reference
  (`matrix(1, 0, 0, 1, 51, 0)`, `rgb(15, 15, 15)`)
- hero typewriter and masked-image reveal running; UnicornStudio canvas mounted
- feature slider horizontal scrolling; hover-to-play and button toggle on videos
- **0 console errors, 0 HTTP errors, 37/37 images and 8/8 videos decoded**

### Known differences

1. **Hero WebGL scene** is fetched from UnicornStudio at runtime; it needs network access. Offline,
   the hero falls back to solid `#ff633e`.
2. **Video frames and typewriter text** differ between any two screenshots — both loop
   independently of scroll position.
3. **Homepage only.** The mirror also contains `pricing`, `faq`, `blogs` (+ 4 posts), `terms`,
   `privacy` and their stylesheets (`pricing.NCkjEsjf.css`, `_slug_.DFyDSR0p.css`). Nav and footer
   links point at their eventual routes (`/pricing`, `/faq`, …) but those pages are not built.
