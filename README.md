# Vozant Frontend

This folder contains the Vozant frontend: a React + Vite single page app with a landing page and a prediction page for car price appraisal. The UI focuses on a luxury editorial feel while keeping the prediction workflow clear and fast.

## Highlights

- Landing page hero with CTA and feature cards
- Prediction form with custom selects, validation, and smart defaults
- Results with price range, market analysis, and vehicle profile
- Image carousel with fallback assets and a zoomable modal
- Language (EN/TR) and theme (light/dark) toggles stored in localStorage
- Local cache for generated info cards to reduce repeated requests

## Tech Stack

- React 19 + TypeScript
- Vite for dev/build
- Tailwind via CDN (configured in `index.html`)
- Google Gemini client for market analysis text

## Project Structure

- `frontend/App.tsx` - App shell, header, page routing, theme/language state
- `frontend/components/LandingPage.tsx` - Hero, CTA, and feature cards
- `frontend/components/PredictionPage.tsx` - Form, results, carousel, modal
- `frontend/services/api.ts` - Backend API calls
- `frontend/services/geminiService.ts` - Gemini calls and caching
- `frontend/basic/` - Fallback images for the prediction carousel
- `frontend/main_page/` - Landing page imagery
- `frontend/types.ts` - Shared types

## Data Flow

1. The user fills the prediction form.
2. The app calls backend endpoints via `api.ts`:
   - `POST /predict` for price estimate
   - `GET /options` for dropdown data
   - `POST /generate-images` for generated visuals
   - `POST /car-info` for a vehicle profile text
3. The frontend also uses Gemini directly (via `geminiService.ts`) to produce a short market analysis. Results are cached in memory and localStorage.

## Environment Variables

Create `frontend/.env.local` as needed:

```
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_key
```

Notes:
- `VITE_API_URL` defaults to `http://localhost:8000` if not set.
- `geminiService.ts` also checks `VITE_API_KEY` as a fallback.

## Scripts

```
npm install
npm run dev
npm run build
npm run preview
```

## Asset Notes

- `frontend/basic` contains local fallback images used when the backend does not return generated images.
- `frontend/main_page` contains the landing page background and CTA imagery.
- Fonts are defined in `frontend/index.html` and applied via Tailwind font classes.

## Troubleshooting

- If images do not appear, hard refresh the page (Ctrl+F5) to clear the cache.
- If the prediction page shows empty results, verify the backend is running and `VITE_API_URL` is correct.
- If market analysis is blank, confirm `VITE_GEMINI_API_KEY` is set.
