# CLAUDE.md — Frontend Website Rules

## Always Do First
- Invoke a `frontend-design` skill before writing any frontend code, if one is available in the session. **Not currently installed in this environment** — until it is, apply the Anti-Generic Guardrails below manually before writing any UI.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is a devDependency in `package.json` — run `npm install` once before first use. It manages its own Chrome download/cache; no hardcoded browser paths.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- Mobile viewport: add `--mobile` (e.g. `node screenshot.mjs http://localhost:3000 label --mobile`) → 390x844 @2x, saved as `screenshot-N-label-mobile.png`
- `screenshot.mjs` lives in the project root. Use it as-is. It auto-scrolls the page and waits for images to decode before capturing — needed because `loading="lazy"` images and AVIF decode don't reliably finish in time for a `fullPage` screenshot otherwise.
- Full-page screenshots can be very tall — if the Read tool's image view seems too compressed to check fine details, slice it into shorter tiles first (e.g. with ImageMagick `convert -crop`) and read each tile.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

## Pre-Publish Check: `[VERIFY]` Placeholders
- Unconfirmed facts (licences, registration numbers, contact details, coverage claims, etc.) are written into pages as a literal `[VERIFY]` marker (or a descriptive variant like `[VERIFY: location 2 — ...]`) rather than invented or inferred.
- **Before publishing this site, always run `node check-verify.mjs`** from the project root. It scans every `.html` file for `[VERIFY]` and exits non-zero if any remain — there's no CI/build pipeline in this static-HTML project to enforce this automatically, so it must be run manually as the last step before launch.
- Never resolve a `[VERIFY]` marker with a guessed or plausible-sounding value — only replace it with a value the user explicitly confirms.
