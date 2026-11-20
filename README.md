# Antica Osteria dell'Orsa · bozza sito 3D

Concept "Sotto l'Orsa Maggiore": il nome dell'osteria diventa un cielo notturno sopra la piazzetta di Savigliano.
All'apertura alcune stelle si radunano nella costellazione dell'Orsa e le linee si disegnano; scorrendo, il cielo
si condensa nella sagoma di un orso che cammina (il Grande Carro è la sua coda e la schiena), poi diventa la piastra
rovente con la costata della Madama la Piemonteisa, poi un calice di Barbera, e torna cielo. Un solo sistema di
particelle con shader custom. Il menu è una carta astronomica, e a destra le sette stelle del Grande Carro si
accendono con lo scroll. Three.js / React Three Fiber, GSAP ScrollTrigger, Lenis.

Design DNA: blu notte, bronzo e miele (dal logo), crema, rosso Barbera. Young Serif + Hanken Grotesk.

```
cd sorgente
npm ci
npm run dev     # sviluppo
npm run build   # crea dist/index.html, file unico autonomo
```
Su mobile meno particelle e forme più piccole sopra i testi; con prefers-reduced-motion niente 3D, cielo statico e
disegni fissi. Il rendering si mette in pausa quando la carta copre lo schermo.

Il file `index.html` nella radice è la build pronta per GitHub Pages.
