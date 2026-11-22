# trianon-concept

Concept non ufficiale di nuovo sito + app per il Teatro Trianon Viviani (Napoli). Demo per proposta commerciale.

## Struttura
```
docs/                 web app (GitHub Pages + webDir Capacitor)
  index.html          shell + CSS
  app.js              router hash SPA, pagine, booking flow, PWA
  data.js             dati stagione 2026|2027 (fonte teatrotrianon.org, 22/11/2026)
  sw.js               service worker (network-first, offline fallback)
  manifest.webmanifest, icons/
  v1.html             concept v1 (single page)
assets/               sorgenti icone/splash per @capacitor/assets
capacitor.config.json appId org.concept.trianonviviani, webDir docs
.github/workflows/apk.yml  build APK manuale (workflow_dispatch) → artifact + Release
```

## Stack
Vanilla HTML/CSS/JS, zero build. Capacitor 7 (Android). Persistenza demo: localStorage (`t2_*`).

## Route
`#/` · `#/stagione` · `#/spettacolo/:id` · `#/biglietti[?show=&date=]` · `#/biglietti/abbonamenti` · `#/news[/:slug|/bandi]` · `#/esperienze` · `#/chi-siamo[/torre]` · `#/direzione-artistica` · `#/visita` · `#/mio`

## Dati
- Reali: titoli/date/artisti, 5€ studenti, orari botteghino, contatti, storia, direzione artistica (Pierpaolo Sepe, sintesi), presidente (Clementina Chieffo), bandi.
- Demo/esempio: orario 21:00, prezzi intero/ridotto (25/20 platea, 18/15 galleria), mappa posti e occupazione (pseudo-random deterministica), QR (non valido), esperienze (format proposti).

## Comandi
```
python3 -m http.server -d docs 8080     # preview locale
gh workflow run apk.yml                 # build APK (~4-6 min)
```

## Vincoli
- Fascia "Concept dimostrativo" obbligatoria in tutte le versioni.
- Nessun pagamento/invio reale.
- Actions: solo trigger manuale.
