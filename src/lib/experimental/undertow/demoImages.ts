/**
 * Two inline posters for the docs and stories. Data URIs keep them same-origin,
 * so the canvas is never tainted, and they render identically everywhere.
 * The pair is deliberately opposite — warm daylight over cold night — so the
 * reveal is unmistakable wherever the pointer goes.
 */

const wrap = (body: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">${body}</svg>`,
    )}`

export const UNDERTOW_DEMO_FRONT = wrap(`
  <defs>
    <linearGradient id="d" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#8fd3f4"/>
      <stop offset="0.6" stop-color="#c8e9c0"/>
      <stop offset="1" stop-color="#f6e7b8"/>
    </linearGradient>
    <linearGradient id="dh" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7cc47f"/>
      <stop offset="1" stop-color="#4f9663"/>
    </linearGradient>
  </defs>
  <rect width="960" height="600" fill="url(#d)"/>
  <circle cx="742" cy="132" r="66" fill="#fff3c4"/>
  <circle cx="742" cy="132" r="104" fill="#fff3c4" opacity="0.28"/>
  <g fill="#ffffff" opacity="0.86">
    <ellipse cx="196" cy="150" rx="78" ry="34"/>
    <ellipse cx="252" cy="132" rx="56" ry="30"/>
    <ellipse cx="556" cy="212" rx="64" ry="26"/>
  </g>
  <path d="M0 402 C170 350 318 396 470 418 C632 442 796 396 960 414 V600 H0Z" fill="url(#dh)"/>
  <path d="M0 470 C190 436 372 480 566 490 C712 498 842 476 960 484 V600 H0Z" fill="#3d7a52"/>
  <g fill="#f6c9d8">
    <circle cx="120" cy="524" r="11"/><circle cx="284" cy="548" r="9"/>
    <circle cx="470" cy="530" r="10"/><circle cx="806" cy="540" r="9"/>
  </g>
`)

export const UNDERTOW_DEMO_BACK = wrap(`
  <defs>
    <linearGradient id="n" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#0b1030"/>
      <stop offset="0.6" stop-color="#241a4a"/>
      <stop offset="1" stop-color="#4a2350"/>
    </linearGradient>
    <linearGradient id="nh" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b2350"/>
      <stop offset="1" stop-color="#0d1130"/>
    </linearGradient>
  </defs>
  <rect width="960" height="600" fill="url(#n)"/>
  <circle cx="742" cy="132" r="58" fill="#eef2ff"/>
  <circle cx="716" cy="116" r="52" fill="#241a4a"/>
  <circle cx="742" cy="132" r="112" fill="#dfe6ff" opacity="0.14"/>
  <g fill="#eef2ff">
    <circle cx="120" cy="90" r="3.2"/><circle cx="238" cy="164" r="2.4"/>
    <circle cx="386" cy="72" r="3"/><circle cx="512" cy="150" r="2.2"/>
    <circle cx="88" cy="232" r="2.6"/><circle cx="626" cy="86" r="2.8"/>
    <circle cx="884" cy="228" r="2.4"/><circle cx="322" cy="256" r="2"/>
  </g>
  <path d="M0 402 C170 350 318 396 470 418 C632 442 796 396 960 414 V600 H0Z" fill="url(#nh)"/>
  <path d="M0 470 C190 436 372 480 566 490 C712 498 842 476 960 484 V600 H0Z" fill="#080b22"/>
  <g fill="#ffd98a" opacity="0.9">
    <circle cx="120" cy="524" r="4"/><circle cx="284" cy="548" r="3.4"/>
    <circle cx="470" cy="530" r="3.6"/><circle cx="806" cy="540" r="3.2"/>
  </g>
`)
