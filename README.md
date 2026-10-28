# VELTO — Smart EV Charging Landing Page

Mobility one-pager. The centerpiece is a pinned scroll stage taken from a Figma reference (ICEVAN "Products" section):
as you scroll, the giant **Products** word rises out of view, the small diamond behind the product grows into the
full rounded diamond, and the copy, spec card and thumbnail dock fade in.

## Layout
| Section  | Layout |
|----------|--------|
| Nav      | full-bleed |
| Products | full-bleed, pinned stage, 3-6-3 (measured from the reference) |
| Features | 4-4-4 (image placeholders) |
| Contact  | full-bleed, 6-6 |
| Footer   | 4-4-4 |

## Notes
- Figma MCP was not available; values were measured from the reference screenshot.
- Product image and dock thumbnails are image placeholders (`.img`).
- Feature images are `.img` placeholders.
- `js/main.js` maps scroll progress to `--w` / `--d` / `--u` on `.stage__pin`. Layout stacks statically at 1024px and below, and with reduced motion.
- `css/styles.css` is the shared token file (do not edit); brand styles live in `css/site.css`.

## Run
`python3 -m http.server 5500`; deploys to GitHub Pages on push to `main`.
