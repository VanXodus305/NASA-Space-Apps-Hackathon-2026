# SPHEREx Blink

A public sky-image explorer for NASA Space Apps. Three responsive pages: `/` (search and blink player), `/targets` (five challenge targets), and `/about` (mission and interpretation guide).

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The frontend proxies requests to `SPHEREX_API_URL`, defaulting to `http://127.0.0.1:8000`. Set this server-only variable to your deployed FastAPI origin in production. Do not append `/frames`.

Start the separate [backend](https://github.com/Gotnochill/isro-nasa) using its README, or from its checkout:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

No observations are fabricated when the backend is offline. The viewer displays an actionable connection error. First archive queries can take 30–60 seconds or longer. The frontend allows up to three minutes for `/frames`.

## Stack and design

Next.js 16 App Router, React 19, Tailwind CSS 4, HeroUI 3, Framer Motion, and React Bits Animated Content (GSAP). Styling uses Tailwind utilities and HeroUI; the global stylesheet contains only imports and font token declarations. Space Grotesk is self-hosted with its OFL license. Geist and Geist Mono use Next's Google font integration.

Celestial black, indigo, lilac, and blush palette. Procedural SVG orbital artwork is decorative and never presented as telescope imagery. Reduced-motion preferences are respected. React Bits source and license are in `components/react-bits/`; adaptations move callback-ref updates into an effect and preserve readable server-rendered content before hydration.

## Backend source review

Reviewed the complete source, tests, README, demo script, environment example, and task status of `Gotnochill/isro-nasa` at commit `a8ccaa57cd5c2e119c971a569040f94794d065fc`.

- `app/main.py`: FastAPI `/frames`, `/frames/{id}.png`, `/health`; errors use `{detail}` with HTTP 400 or 502.
- `app/coords.py`: decimal degrees or explicit-unit sexagesimal parsing; both coordinates take priority over name; name resolution uses Astropy/Sesame.
- `app/irsa.py`: SIA search, detector filtering, chronological sort, at most eight evenly sampled observations, QR3 → QR2 fallback only when release is omitted and QR3 returns no rows.
- `app/frames.py`: disk caches for searches and PNGs, concurrent cutout downloads, failed-cutout count, MJD/UTC timestamps, actual query and wavelength metadata.
- `app/image.py`: IMAGE extension → percentile/asinh grayscale stretch → nearest-neighbor enlargement to at least 512 pixels on the short side.
- Tests cover coordinates, basic errors, PNG conversion, cutout URL creation, and epoch sampling. Planned difference, spectrum, and contamination-overlay endpoints do not exist yet.

### Frontend contract

`GET /api/frames` validates and forwards searches to `GET <backend>/frames`. Auto **omits** `release`; explicit releases are lowercase `qr2`/`qr3`. Colon or space sexagesimal inputs become explicit h/d/m/s notation before forwarding. A partial coordinate pair is rejected.

```json
{
  "query": { "ra": 133.795129, "dec": -7.245147, "size_deg": 0.1, "band": "D2", "release": "qr2" },
  "dropped": 0,
  "frames": [{
    "id": "0000000000000001",
    "obs_mjd": 60829.12,
    "obs_iso": "2025-06-03T02:52:48Z",
    "detector": "D2",
    "wavelength_um": [1.1, 1.62],
    "image_url": "/frames/0000000000000001.png"
  }]
}
```

The frontend validates the response, sorts by MJD, limits display to eight frames, and maps image IDs to a fixed-upstream PNG proxy. This supports relative or absolute backend image URLs without exposing the backend origin or requiring browser CORS configuration. No arbitrary URL fetching is allowed. Empty arrays are no-coverage results; `dropped` and browser image failures produce separate notices.

Shared URLs accept `ra`, `dec`, `name`, `size` (or legacy `fov`), `band`, and `release`. They hydrate the form and automatically search. WISE 0855 uses the challenge's exact coordinates and Auto release. Other presets use the backend-recommended object names.

Aladin Lite is embedded from CDS using the **returned** coordinates and field of view. It shows the DSS2 reference survey, not SPHEREx. Its external services and WebGL must be available. An external-map link is provided beside it.

### Scientific limits

The backend does not align observations to a common WCS, return FLAGS, or use a common intensity stretch. Apparent motion and flux changes can be artifacts; the UI explains these limitations. Keep the detector and wavelengths comparable. Quantitative variability, subtraction, stacking, spectra, and contamination overlays require backend support and are not simulated here.

## Verify

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts an isolated production server on port 3100 (keep this port free). Tests cover desktop/mobile layout, all five target links, coordinate priority, Auto omission, chronology, playback, timeline, clipboard sharing, fallback, no coverage, HTTP errors, and missing PNGs. These deterministic browser tests use explicit API fixtures; they do not claim live IRSA availability. Screenshots and traces are written to ignored `test-results/`.

## Credits

SPHEREx is a NASA-funded JPL / Caltech mission. Data: [IRSA](https://irsa.ipac.caltech.edu/Missions/spherex.html). Releases: [QR2 DOI](https://doi.org/10.26131/IRSA652), [QR3 DOI](https://doi.org/10.26131/IRSA662). Atlas: [Aladin Lite / CDS](https://aladin.cds.unistra.fr/AladinLite/). Animation: [React Bits](https://reactbits.dev/animations/animated-content). This is an independent community project, not an official NASA application.

### Live archive check

All five challenge fields were requested against the reviewed backend. The WISE 0855 request returned HTTP 502 (`IRSA search failed`); the four name-based targets returned HTTP 400 (`unknown name`). Direct diagnostics identified Sesame resolver timeouts and an unreachable IRSA SIA capabilities endpoint in this environment. Therefore, successful live image retrieval is not verified here. The backend's existing 11 tests passed; frontend contract and browser tests separately exercise successful responses using fixtures. No backend source was modified.
