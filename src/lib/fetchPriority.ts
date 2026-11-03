// Atributo `fetchpriority="high"` para la imagen que es el LCP de una página.
//
// React 18 no conoce `fetchPriority` en camelCase (avisa en consola); en
// minúscula pasa tal cual al HTML. Se esparce en la `<img>`:
// `<img {...HIGH_FETCH_PRIORITY} … />`.
export const HIGH_FETCH_PRIORITY = { fetchpriority: 'high' } as Readonly<Record<string, string>>;
