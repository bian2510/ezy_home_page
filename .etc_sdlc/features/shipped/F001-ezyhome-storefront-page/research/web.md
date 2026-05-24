# Web Research — F001 EzyHome Storefront

## WhatsApp Checkout
- URL format: `https://wa.me/{NUMBER}?text={encodeURIComponent(message)}`
- No API key required; opens WhatsApp app directly on mobile
- Documented conversion: 5–15% vs 1–4% traditional e-commerce
- Source: https://quadlayers.com/how-to-create-a-whatsapp-link-wa-me-with-a-pre-filled-message/

## Cart Persistence (React + localStorage)
- Pattern: `useState` init from `localStorage.getItem` + `useEffect` on state change → `localStorage.setItem`
- Serialize with `JSON.stringify`; deserialize with `JSON.parse` inside try-catch
- Always handle storage exceptions (private browsing, quota exceeded)
- Source: https://coreui.io/answers/how-to-persist-state-with-localstorage-in-react/

## Mobile E-commerce Conversion
- Average mobile conversion rate 2025: 2.9% globally; 5%+ = strong performance
- Trust signals in first viewport → +22% conversion (reviews, secure badges, clear pricing)
- Mobile-first design with larger tap targets → +28% mobile conversion
- Source: https://www.skailama.com/blog/good-mobile-ecommerce-conversion-rate-2025

## Docker: React Vite Production
- Multi-stage build: Stage 1 `node:20-alpine` (pnpm build) → Stage 2 `nginx:stable-alpine` (serve dist/)
- nginx SPA routing: `try_files $uri /index.html`
- Cache headers: hashed Vite assets → `Cache-Control: immutable, max-age=31536000`; index.html → `no-cache`
- Non-root nginx user for security
- VITE_ prefix for browser-exposed env vars; pass as `--build-arg` in Docker
- Source: https://www.buildwithmatija.com/blog/production-react-vite-docker-deployment
