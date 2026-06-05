# AMPA Arco de la Alameda — Diseño de la web

**Fecha:** 2026-06-05
**Autor:** Victor Lledó
**Estado:** Aprobado (pendiente de revisión final del documento)

## 1. Resumen ejecutivo

Sitio web estático en español para el AMPA Arco de la Alameda del CEIP Jesús María (Jaén). Construido con **Astro**, contenido en Markdown editado vía Git, desplegado en **Netlify** sobre el dominio `ampaarcodelaalameda.es`. Sin backend, sin base de datos, sin CMS, sin analítica, sin scripts de terceros en el MVP.

Objetivo del MVP: tener la web online esta semana con las dos próximas actividades destacadas (fiesta fin de curso del 22 de junio, mercadillo de juguetes del 10 de junio), las páginas de servicios (escuela de verano, extraescolares, ludoteca), página de socios y página de contacto. La sección de noticias queda estructurada técnicamente pero se rellena en una fase posterior.

## 2. Contexto

- El AMPA quiere una presencia web propia que transmita los valores del colegio: ecoescuela (con bandera verde de la Junta de Andalucía), colegio centenario, comunidad pequeña con buena convivencia, integración de múltiples culturas.
- Hasta ahora la comunicación se hace por Instagram (`@ampa_arco_de_la_alameda`), Facebook (`ampa.jesusmariajaen`) y grupos del cole. La web aporta un canal estable, indexable y compartible (URLs únicas para eventos).
- Mantenimiento previsto: una sola persona (Victor) edita el repo. Otras personas del AMPA no editan, le piden a Victor los cambios.

## 3. Objetivos y no-objetivos

### Objetivos

- **Diseño sencillo, claro y accesible.** Cumplir WCAG 2.1 AA y obtener 100/100 en accesibilidad de Lighthouse en las páginas principales.
- **Velocidad de carga.** < 200 KB por página, sub-segundo en CDN.
- **Tiempo de despliegue:** primer deploy a producción esta semana (semana del 8 de junio de 2026).
- **Coste recurrente mínimo:** dominio (~12 €/año), todo lo demás gratis.
- **Mantenibilidad a 5 años vista.** Stack estándar, dependencias mínimas, nada que requiera tocar el repo cada poco para evitar que se rompa.
- **Cero ansiedad operativa.** Sin servidor que mantener, sin BBDD, sin certificados que renovar a mano.

### No-objetivos (fuera de alcance)

- Multi-idioma (solo español).
- Login / área privada / contenido restringido a socios.
- CMS web para edición no técnica.
- Comentarios, foros, chat.
- E-commerce, pasarela de pago.
- Notificaciones push, PWA instalable.
- Buscador interno del sitio.
- Analítica con o sin cookies.
- Email del dominio (`@ampaarcodelaalameda.es`) — se mantiene el Gmail existente.
- Conversión de logos a SVG (mejora posterior; arrancamos con los JPEG existentes).

## 4. Decisiones clave

| Decisión | Elección | Por qué |
|---|---|---|
| Framework | Astro | Static-first, Content Collections tipadas, ecosistema moderno, sin JS en cliente por defecto |
| Estilos | CSS variables + scoped `<style>` por componente | Cero dependencias, longevidad, suficiente para el tamaño del sitio |
| Hosting | Netlify | Free tier, CI/CD desde Git, SSL automático, previews de PR |
| Repositorio | GitHub personal del autor (no en organización Woodsearch) | El proyecto es personal/comunitario, no de empresa |
| Dominio | `ampaarcodelaalameda.es` (DonDominio) | Identidad oficial AMPA |
| Edición | Markdown en repo, Git | Una sola persona técnica edita |
| Formularios | Enlaces externos a Google Forms | Sin scripts de Google en la web, RGPD-friendly |
| Analítica | Ninguna | Simplicidad, RGPD trivial |
| Idiomas | Solo español | Comunidad principalmente hispanohablante |
| Tipografía | Font stack del sistema | Sin tracking, instantáneo, RGPD-friendly |
| Logos en MVP | JPEG existentes (vía optimización de Astro) | Suficientes para desplegar; SVG queda como mejora posterior |

## 5. Arquitectura

```
┌─────────────────┐    git push    ┌────────────────┐    build    ┌────────────┐
│ Editor en local │ ─────────────▶ │ Repo GitHub    │ ──────────▶ │ Netlify    │
│ (Markdown +     │                │ (rama main)    │             │ deploy CDN │
│  componentes)   │                │                │             │            │
└─────────────────┘                └────────────────┘             └─────┬──────┘
                                                                        │
                                                                        ▼
                                                      ┌──────────────────────────────┐
                                                      │ ampaarcodelaalameda.es        │
                                                      │ (HTML estático en CDN global) │
                                                      └──────────────────────────────┘
```

- Sitio 100% estático. Cero servidores propios, cero backend.
- Build automático cada push a `main`. Previews automáticos por PR.
- Netlify gestiona SSL, dominio personalizado, redirects y headers.

## 6. Modelo de contenido

Astro Content Collections, definidas en `src/content/config.ts` con esquemas Zod.

### 6.1 `events`

Cada archivo `.md` es un evento. Ej. `src/content/events/fiesta-fin-curso-2026/index.md`.

```yaml
---
title: string                  # "Fiesta fin de curso"
slug: string                   # "fiesta-fin-curso-2026" (URL)
date: datetime                 # ISO 8601 con hora y zona horaria
location: string               # "CEIP Jesús María"
poster: image                  # ruta relativa al cartel
posterAlt: string              # alt text obligatorio
featured: boolean              # destaca en portada
shortDescription: string       # 1 línea para tarjetas y tira secundaria
---
Cuerpo en Markdown — descripción completa del evento.
```

**Reglas:**
- Eventos con `date` futura aparecen en portada (si `featured: true`) y en la sección "Próximos eventos" de `/eventos/`.
- Eventos con `date` pasada aparecen en `/eventos/` bajo "Eventos anteriores" pero conservan su URL única.
- La portada muestra hasta 2 eventos `featured: true` con fecha futura, ordenados por proximidad.

### 6.2 `services`

Un archivo por servicio. Ej. `src/content/services/escuela-de-verano/index.md`.

```yaml
---
title: string                  # "Escuela de verano"
slug: string                   # "escuela-de-verano"
season: string                 # "Verano 2026", "Curso 26-27"
shortDescription: string       # 1 línea para tarjeta
heroImage: image | null
heroImageAlt: string | null
formUrl: string | null         # URL externa Google Form (mutex con formPdf)
formPdf: file | null           # PDF descargable (mutex con formUrl)
documents:                     # opcional, lista de adjuntos extra
  - { label: string, file: file }
order: number                  # orden de aparición en home y /servicios/
---
Cuerpo en Markdown — info completa del servicio, fechas, horarios, etc.
```

**Reglas:**
- La página renderiza un botón principal "Apuntarse" cuyo destino depende de qué campo esté presente:
  - `formUrl` → enlace externo (`target="_blank"`, `rel="noopener"`).
  - `formPdf` → descarga del PDF.
- Si no hay ninguno de los dos, no se renderiza el botón principal y la página muestra "Próximamente disponible la inscripción".
- `documents` se renderiza como lista descargable con icono según extensión y tamaño del archivo.

### 6.3 `pages`

Páginas estáticas que tienen poco más que título + cuerpo Markdown: Hazte socio, Contacto, Aviso legal.

```yaml
---
title: string
slug: string
description: string            # meta description
---
Cuerpo en Markdown.
```

### 6.4 `posts` (preparada pero vacía en MVP)

```yaml
---
title: string
slug: string
date: datetime
cover: image | null
coverAlt: string | null
excerpt: string
tags: string[]
---
Cuerpo en Markdown.
```

En fase 2 se activa en navegación. En MVP la colección existe pero el listado `/noticias/` muestra el placeholder "próximamente".

## 7. Estructura del repositorio

```
ampa-arco-alameda/
├── public/
│   ├── favicon.ico
│   ├── favicon-32.png
│   ├── apple-touch-icon.png
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── logo-ampa.jpg
│   │   └── logo-ceip-jesus-maria.jpg
│   ├── components/
│   │   ├── BaseHead.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── TopBar.astro
│   │   ├── HeroEvent.astro
│   │   ├── SecondaryEvent.astro
│   │   ├── EventCard.astro
│   │   ├── ServiceCard.astro
│   │   ├── ServiceGrid.astro
│   │   ├── SociosCTA.astro
│   │   ├── NewsTeaser.astro
│   │   ├── Button.astro
│   │   ├── PosterImage.astro
│   │   ├── DocumentLink.astro
│   │   └── icons/
│   │       ├── IconCalendar.astro
│   │       ├── IconLocation.astro
│   │       ├── IconArrow.astro
│   │       ├── IconFacebook.astro
│   │       └── IconInstagram.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── content/
│   │   ├── config.ts
│   │   ├── events/
│   │   │   ├── fiesta-fin-curso-2026/
│   │   │   │   ├── index.md
│   │   │   │   └── cartel.jpeg
│   │   │   └── mercadillo-juguetes-2026/
│   │   │       ├── index.md
│   │   │       └── cartel.jpeg
│   │   ├── services/
│   │   │   ├── escuela-de-verano/
│   │   │   │   ├── index.md
│   │   │   │   ├── cartel.jpeg
│   │   │   │   ├── instrucciones-pago.jpeg
│   │   │   │   └── ficha.pdf
│   │   │   ├── extraescolares/
│   │   │   │   ├── index.md
│   │   │   │   └── cartel.jpeg
│   │   │   └── ludoteca/
│   │   │       ├── index.md
│   │   │       └── formulario-inscripcion.pdf
│   │   ├── pages/
│   │   │   ├── hazte-socio.md
│   │   │   ├── contacto.md
│   │   │   └── aviso-legal.md
│   │   └── posts/                       # vacío en MVP
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   ├── eventos/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── servicios/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── hazte-socio.astro
│   │   ├── contacto.astro
│   │   ├── aviso-legal.astro
│   │   └── noticias/
│   │       └── index.astro              # placeholder "fase 2"
│   └── styles/
│       ├── tokens.css
│       ├── reset.css
│       └── global.css
├── astro.config.mjs
├── netlify.toml
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## 8. Rutas

| Ruta | Generada por | Notas |
|---|---|---|
| `/` | `pages/index.astro` | Portada |
| `/eventos/` | `pages/eventos/index.astro` | Próximos + anteriores |
| `/eventos/<slug>/` | `pages/eventos/[slug].astro` | Una por evento |
| `/servicios/` | `pages/servicios/index.astro` | Listado |
| `/servicios/<slug>/` | `pages/servicios/[slug].astro` | Una por servicio |
| `/hazte-socio/` | `pages/hazte-socio.astro` | Estática |
| `/contacto/` | `pages/contacto.astro` | Estática |
| `/aviso-legal/` | `pages/aviso-legal.astro` | Estática |
| `/noticias/` | `pages/noticias/index.astro` | Placeholder en MVP |
| `/404` | `pages/404.astro` | Página de error |

## 9. Composición de la portada

Bloques de arriba abajo:

1. **Barra superior** (verde oscuro `--ampa-dark`): tres anclajes (CEIP Jesús María · Jaén / 🌿 Ecoescuela · Bandera Verde / Colegio centenario) + Federada FAMPA Los Olivos.
2. **Header**: logo AMPA + nombre + subtítulo "CEIP Jesús María · Jaén" + nav (Inicio · Servicios · Noticias · Hazte socio · Contacto).
3. **Hero**: evento principal (`featured: true` más próximo). Kicker + título + meta-row (fecha/lugar) + lead + 2 CTAs (Ver detalles / Otros eventos) + cartel a la derecha.
4. **Tira de evento secundario**: segundo evento destacado en formato compacto (date-chip + título + descripción + flecha).
5. **Servicios** (3 cards): Escuela de verano · Extraescolares · Ludoteca. Cada card: imagen + label de temporada + título + descripción + link "Apuntarse".
6. **CTA Hazte socio** (bloque verde oscuro): título + copy + botón verde lima "Quiero asociarme".
7. **Últimas noticias**: placeholder "fase 2" en MVP.
8. **Footer**: 4 columnas (AMPA con dirección y email · Nuestro colegio con logo CEIP · Federada a FAMPA · Síguenos con iconos RRSS) + línea legal.

## 10. Sistema visual

### 10.1 Paleta (extraída de los logos reales)

| Token | Hex | Uso |
|---|---|---|
| `--ampa-green` | `#60c030` | Verde lima vibrante. Acentos: subrayado nav activo, decoraciones, botón socios |
| `--ampa-dark` | `#205040` | Verde oscuro del wordmark AMPA. Cabeceras, botones primarios, barra superior |
| `--ampa-deep` | `#1a4030` | Variante más profunda para fondos grandes |
| `--ampa-blue` | `#005090` | Azul royal AMPA. Enlaces en texto |
| `--ampa-red` | `#f03030` | Rojo AMPA. Reservado para alertas/urgencia, uso muy puntual |
| `--green-soft` | `#e8f5e2` | Verde tinte muy claro. Fondos de tarjetas, hover sutil |
| `--ink` | `#111418` | Texto principal |
| `--ink-soft` | `#4a5568` | Texto secundario, metadatos |
| `--bg` | `#fafbfc` | Fondo general (off-white) |
| `--line` | `#e7ebef` | Separadores, bordes de tarjetas |

Contrastes verificados (sobre blanco): `--ampa-dark` 9.5:1 · `--ampa-blue` 9.0:1 · `--ink` 18:1 · `--ink-soft` 7.5:1. Todos cumplen AA holgadamente. `--ampa-green` no se usa para texto pequeño (solo decoración / texto grande de botón).

### 10.2 Tipografía

Font stack del sistema:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
```

Escala (rem, base 16px):

- `h1`: 2rem, peso 700, line-height 1.1
- `h2`: 1.35rem, peso 700, line-height 1.2
- `h3`: 1.05rem, peso 700, line-height 1.3
- body: 1rem, peso 400, line-height 1.5
- small / meta: 0.85rem
- micro / labels: 0.7rem uppercase letter-spacing 0.14em

### 10.3 Layout

- Ancho máximo del contenido: 1120px centrado.
- Padding lateral responsive: 28px en escritorio, 16px en móvil.
- Espaciado vertical entre secciones: 50px escritorio, 36px móvil.
- Breakpoint principal: 760px.

## 11. Assets

- **Logos:** JPEG existentes en `src/assets/`. Astro los optimiza en build (WebP/AVIF + dimensiones responsive).
- **Carteles e imágenes:** ubicadas dentro de la carpeta de su entrada de contenido. Optimización automática.
- **PDFs:** dentro de la carpeta del servicio. Servidos tal cual.
- **Favicons:** generados una vez a partir del logo AMPA (32×32, 180×180 apple-touch). En `public/`.
- **OG image por defecto:** generada manualmente una vez (logo AMPA + nombre + tagline sobre fondo verde). Eventos sobrescriben con su cartel.

## 12. Despliegue

### 12.1 Netlify

- Repo en **GitHub personal del autor** (no en la organización Woodsearch).
- Repo conectado a Netlify.
- Build command: `astro build`. Publish directory: `dist`.
- Variables de entorno: ninguna en MVP.
- Headers en `netlify.toml`:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: interest-cohort=()`
  - `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'`
- Cache: `Cache-Control: public, max-age=31536000, immutable` para `/_astro/*` (versionados). HTML sin cache largo.

### 12.2 Dominio

Pasos (a ejecutar después de tener el sitio funcionando en la URL temporal de Netlify):

1. Comprar `ampaarcodelaalameda.es` en **DonDominio**.
2. En Netlify, añadir custom domain `ampaarcodelaalameda.es` (apex) y `www.ampaarcodelaalameda.es`.
3. Configurar DNS en el registrador siguiendo las instrucciones de Netlify (apuntar A record del apex a la IP de Netlify o usar nameservers de Netlify).
4. Esperar propagación DNS y verificar emisión automática de certificado SSL Let's Encrypt.
5. Configurar redirect `www` → apex (o al revés) en `netlify.toml`.

## 13. Accesibilidad

Objetivo: **WCAG 2.1 nivel AA**, **100/100** en Lighthouse Accessibility.

Compromisos por defecto:

- HTML semántico (`header`, `nav`, `main`, `article`, `footer`, `section` con `aria-label` cuando aplique).
- Un `<h1>` por página, jerarquía de headings respetada (sin saltos).
- `<html lang="es">`.
- Skip link "Saltar al contenido principal" como primer foco tabulable.
- Estados `:focus-visible` con outline visible siempre (nunca `outline: none`).
- Alt text obligatorio en imágenes (forzado por el esquema de contenido).
- Tamaño base 16px, line-height ≥ 1.5 en cuerpo.
- Contraste de texto AA (verificado, ver §10.1).
- `prefers-reduced-motion` respetado para cualquier transición.
- Sin overlays, pop-ups ni modales que tapen contenido.
- Iconos decorativos con `aria-hidden="true"`. Iconos informativos con label.

Verificación: axe DevTools + Lighthouse antes de cada deploy. Cualquier issue de accesibilidad bloquea el merge.

## 14. SEO básico

- `@astrojs/sitemap` para sitemap XML generado en build.
- `robots.txt` permitiendo todo.
- Meta description por página (de frontmatter o de la primera frase del cuerpo).
- Open Graph + Twitter Card meta tags por página (título, descripción, og:image).
- JSON-LD `Event` Schema.org en páginas de evento (fecha, lugar, organizador).
- JSON-LD `Organization` Schema.org en home (nombre AMPA, dirección, contacto, RRSS).

## 15. Contenido del MVP

Material a poblar antes del primer deploy a producción:

- 2 eventos: `fiesta-fin-curso-2026`, `mercadillo-juguetes-2026`. Los carteles están en el directorio del proyecto. Texto de cada evento a redactar.
- 3 servicios: `escuela-de-verano` (cartel, instrucciones de pago, ficha PDF, URL del formulario pendiente), `extraescolares` (cartel, URL formulario pendiente), `ludoteca` (PDF de inscripción, sin cartel todavía).
- Página `hazte-socio` (texto + cartel "Hazte socio.jpeg" + URL formulario pendiente).
- Página `contacto` (dirección, email, mapa estático o enlace a Google Maps).
- Página `aviso-legal` (texto estándar para AMPA, sin tracking ni recogida de datos = breve).
- Footer con enlaces RRSS confirmados (Facebook + Instagram), FAMPA Los Olivos, logo CEIP.

## 16. Fuera del MVP (fase 2 y posteriores)

- **Sección de noticias activa** (posts en `src/content/posts/`) con listado paginado, página de detalle, tags, RSS feed.
- **Conversión de logos a SVG** y rediseño del set de favicons.
- **Búsqueda interna** del sitio (Pagefind, integración con Astro) cuando haya volumen suficiente.
- **Analítica privacy-friendly** (Plausible o Umami self-hosted) si se necesita conocer uso.
- **Apartado de ventajas para socios** dentro de `/hazte-socio/`.
- **Galería fotográfica** de actividades pasadas.
- **Posible feed automático de Instagram** (requiere integración con API de Meta o servicio de terceros, evaluar coste/privacidad).
- **Email del dominio** si el AMPA quiere migrar de Gmail.

## 17. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Logos en JPEG se ven mal en pantallas retina | Astro genera variantes 2x automáticamente; aceptable hasta migrar a SVG |
| Cambio de Google Forms a otra herramienta más adelante | URLs externas aisladas en frontmatter, cambio trivial |
| Crecimiento de contenido satura la nav | Estructura permite añadir sub-páginas; rediseño de nav cuando crezca |
| Persona única manteniendo el sitio | Repo es estándar, README claro, otra persona técnica podría retomar |
| Dominio `.es` requiere documentación específica | DonDominio gestiona; coste e identificación a verificar al comprar |
| Caída de Netlify (raro, pero pasa) | SLA del free tier es razonable; sitio estático mueve fácilmente a Cloudflare Pages / Vercel si hace falta |

## 18. Definición de "listo" para el primer deploy

El MVP se considera listo cuando:

- [ ] El sitio se despliega correctamente en una URL temporal de Netlify (`*.netlify.app`).
- [ ] Las páginas listadas en §7 están todas creadas y enlazadas.
- [ ] Los 2 eventos del MVP están publicados con cartel, fecha y descripción.
- [ ] Los 3 servicios están publicados con su CTA correspondiente (formUrl o formPdf).
- [ ] Las páginas estáticas (Hazte socio, Contacto, Aviso legal) están publicadas.
- [ ] Lighthouse Accessibility = 100 en home, `/servicios/escuela-de-verano/`, `/eventos/fiesta-fin-curso-2026/` y `/hazte-socio/`.
- [ ] Lighthouse Performance ≥ 95 en las mismas páginas.
- [ ] Navegación por teclado completa funciona en todo el sitio.
- [ ] Sitemap.xml y robots.txt accesibles en raíz.
- [ ] Dominio `ampaarcodelaalameda.es` comprado y apuntando al deploy.
- [ ] Redirect `www` → apex (o viceversa) verificado.
- [ ] Certificado SSL emitido y válido.
- [ ] README del repo documenta cómo añadir un evento, un servicio y una página estática.
