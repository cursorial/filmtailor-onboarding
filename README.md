# Logline by FilmTailor · deck onboarding

A 36-screen onboarding for FilmTailor's pitch deck builder, which turns a feature
film into a deck and makes a version of it for every room it gets pitched in. Static site: open
`index.html`, or push to GitHub Pages as-is.

**Top strip** collapses by default. Open it to see every screen in order and click
any one to jump. **Below** is the interactive prototype. Answer the questions and
the later screens recompute around your answers. Arrow keys move between screens,
except while you're typing in a field.

## Branding
Palette, type and logo are FilmTailor's own: near-black `#030909`, brand cyan
`#4DF6EC` and pink `#FF0099`, Avenir Next with Figtree as the web fallback, and the
stepped-F logo. Courier Prime is used for anything the user writes, because that is
what a screenplay looks like.

## Pricing
FilmTailor already has a plan ladder, so the deck builder sits inside it instead of
inventing one:

| Plan | Price | What the deck builder gives you |
|---|---|---|
| Free forever | $0 | One project, one version, export in every format |
| **Solo** (most popular) | $19.99/mo | Every room version, comps alerts, up to three projects |
| Team | $49.99/mo | Solo plus a shared workspace and five seats |

The recurring parts of the feature are the upgrade. "One film, many rooms" is the
product's best idea, and every extra room version is on Solo. Comps go stale as
new films sell, and the alerts that keep the comps slide current are on Solo. The
free tier keeps a real deck and export, which matches the site's own free tier.

The paywall comes after the reveal, so the user has already seen their title slide
and their comps before any ask. Screen 34 anchors the price against what a
freelance designer charges per deck. Choosing free goes straight to the slate with
no second ask.

## The moment
Screen 13 asks for a title and a logline. Screen 14 reads it against the five
things an executive looks for and names the one that's missing. Screen 17 pulls
reported budgets and grosses for the comps the user picks and gives the median
return. Everything after that is computed from the answers.

## Files
- `index.html`, `styles.css`, `app.js`: shell, design system, renderer and `derive()`
- `screens.js`: all copy, the comps data and the flow logic
- `logo.svg`, `logo-light.svg`: FilmTailor's logo, dark and light text
- `lint.js`: the copy linter, `node lint.js`

## Notes on data
Comp figures are rounded reported production budgets and worldwide grosses. The
designer price range and the percentages attributed to users are illustrative and
would be replaced with sourced figures before launch.
