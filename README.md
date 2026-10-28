# VELTO — Mobility Landing Page

One-page mobility landing, reproduced from Figma node `1519:2` (1920 canvas).
Sections: Header · Hero · Shapes · **Products (pinned scroll animation)** · Line Up · News · Footer.

## Products scroll animation
The stage is pinned while scrolling: the giant **Products** word rises out of view, the small diamond behind the
product grows to full size (green `#93dc73`, rounded 45° square), then the copy, spec card and thumbnail dock fade in.
`js/main.js` maps scroll progress to `--w` / `--d` / `--u` on `.stage__pin`.

## Fidelity notes
- Every Figma px value is written as `calc(N * var(--k))`, `--k = 100vw / 1920`, so the page scales like the design.
- Below 1024px the layout stacks and the animation is skipped (final state shown).
- All photos / product images are `.img` placeholders (gray) — swap in real images later.
- Arrow icons are the original Figma assets (`assets/icons/`).
- Figma font *BrandNewHyosung* (news heading/label) is not available → Pretendard Light/Bold.
- Line Up arrows move the highlighted card (Figma shows card 1 highlighted).
- `css/styles.css` is the shared token file (untouched); brand styles are in `css/site.css`.

## Run
`python3 -m http.server 5500`; deploys to GitHub Pages on push to `main`.
