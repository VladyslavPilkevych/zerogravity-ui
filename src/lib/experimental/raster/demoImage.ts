const POSTER = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="450" viewBox="0 0 720 450">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#141a3a"/>
      <stop offset="0.55" stop-color="#4a3070"/>
      <stop offset="1" stop-color="#d8615c"/>
    </linearGradient>
    <linearGradient id="disc" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe9c2"/>
      <stop offset="1" stop-color="#f4a04f"/>
    </linearGradient>
  </defs>
  <rect width="720" height="450" fill="url(#sky)"/>
  <circle cx="486" cy="168" r="112" fill="url(#disc)"/>
  <circle cx="486" cy="168" r="150" fill="#ffd9a0" opacity="0.16"/>
  <path d="M0 330 C130 286 236 322 348 340 C470 360 586 320 720 336 V450 H0Z" fill="#2b1f45"/>
  <path d="M0 372 C150 344 300 378 452 388 C566 396 640 380 720 386 V450 H0Z" fill="#171233"/>
  <g fill="#f6e7d2" opacity="0.9">
    <circle cx="96" cy="72" r="5"/>
    <circle cx="168" cy="130" r="3"/>
    <circle cx="60" cy="176" r="3.4"/>
    <circle cx="238" cy="66" r="2.6"/>
  </g>
  <path d="M604 450 L604 300 L648 300 L648 450Z" fill="#0d0a1e"/>
  <path d="M76 450 L76 356 L104 356 L104 450Z" fill="#0d0a1e"/>
  <rect x="0" y="416" width="720" height="34" fill="#0b0818"/>
</svg>`

/**
 * A small inline poster used by the playground and stories. Being a data URI keeps
 * it same-origin, so canvas sampling never trips the tainted-canvas rule, and it
 * renders identically on every machine.
 */
export const RASTER_DEMO_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(POSTER)}`
