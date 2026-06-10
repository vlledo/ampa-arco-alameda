# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Sitio web estático del AMPA Arco de la Alameda (CEIP Jesús María, Jaén). Astro 6, TypeScript estricto, sin JS en cliente, sin cookies ni analítica. Despliegue automático en Netlify desde `main`. Dominio en producción: `https://ampaarcodelaalameda.es/`.

## Comandos

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # genera dist/
npm run preview      # sirve dist/ localmente
npx astro sync       # regenera tipos de las content collections (correr tras cambiar schemas o añadir entries)
```

No hay test runner, ni linter, ni formatter configurados. La verificación es `astro build` (falla si un schema de content collection no valida).

Node **≥ 22.12** es obligatorio (Astro 6 lo requiere). Fijado en `.nvmrc` y en `netlify.toml` (`NODE_VERSION = "22"`).

## Arquitectura

### Routing y layout

- `src/pages/` define rutas. Rutas dinámicas: `src/pages/eventos/[...slug].astro` y `src/pages/servicios/[...slug].astro` con `getStaticPaths()` sobre las colecciones correspondientes.
- `src/layouts/BaseLayout.astro` es el único layout. Recibe `title`, `description`, `ogImage?`, `noIndex?` y expone slots `header` / `footer` (default `<slot />` para `<main>`). Todas las páginas pasan `TopBar + Header` por `header` y `Footer` por `footer`.
- `trailingSlash: 'always'` y `build.format: 'directory'` en `astro.config.mjs` — todas las URLs internas terminan en `/`.

### Content collections (Astro 6)

Schemas en **`src/content.config.ts`** (en la raíz de `src/`, no `src/content/config.ts` — Astro 6 prefiere esa ubicación). Cuatro colecciones: `events`, `services`, `pages`, `posts`. `posts` está vacía (fase 2).

Particularidades del loader **glob** de Astro 6:

- Las entries se referencian con `entry.id` (**no** `entry.slug`).
- Se renderizan con `await render(entry)` importado de `astro:content` (**no** `entry.render()`).
- Archivos en `<slug>/index.md` resuelven a `entry.id === '<slug>'`.

Reglas de schema que vale la pena conocer:
- `events`: `featured` controla si aparece en portada; `isHero` fuerza qué evento ocupa el hero (si no hay ninguno con `isHero`, gana el más próximo de los `featured`).
- `services`: `formUrl` y `formPdf` son **mutuamente excluyentes** (refine en el schema). Si hay `heroImage`, `heroImageAlt` es obligatorio.

### Imágenes

- Carteles que se renderizan como hero/poster van **dentro** de `src/content/<col>/<slug>/` y se declaran en frontmatter con el helper `image()` — Astro los optimiza.
- PDFs y descargables van en **`public/<seccion>/<slug>/`** — NO dentro de `src/content/`. Astro no procesa lo que está en `public/`; se sirve tal cual.
- `src/styles/reset.css` tiene `img { max-width: 100%; height: auto; }`. **No quitar `height: auto`** — sin él, las imágenes con `width`/`height` explícitos (que añade `<Image>`) salen deformadas.

### Estilos

- Design tokens (paleta AMPA, escalas tipográficas, espaciado, layout) en `src/styles/tokens.css`. Usar variables CSS, no hardcodear colores ni tamaños.
- `:where(a)` en `src/styles/global.css` baja la especificidad del estilo global de enlace para que los `.btn` ganen sin `!important`.
- En `PageContent.astro` el selector `.content :global(a:not(.btn))` es intencional — sin el `:not(.btn)`, los botones dentro de páginas estáticas heredan el azul de link y rompen contraste.
- Breakpoint móvil único: `760px` (variable `--breakpoint-md`).

### Páginas estáticas (Hazte socio, Contacto, etc.)

Son `.astro` puros en `src/pages/`. Para el contenido de cuerpo usan el componente `PageContent` con los selectores `:global(...)` mencionados arriba.

## Convenciones de contenido

- **Eventos pasados se conservan**: `getStaticPaths` recorre toda la colección, así que `/eventos/<slug>/` sigue resolviendo aunque la fecha haya pasado. La plantilla de detalle muestra un badge "Evento anterior" y el listado los agrupa al final. Decisión deliberada para que los links compartidos en WhatsApp/redes no rompan.
- **Añadir un evento**: `src/content/events/<slug>/index.md` + `cartel.jpeg` en la misma carpeta. Si `featured: true` y `date` futura → aparece en portada.
- **Añadir un servicio**: `src/content/services/<slug>/index.md`. Si hay PDF de inscripción → `public/servicios/<slug>/` y referencia desde `formPdf`. Si hay formulario online → `formUrl`.

## Despliegue (Netlify)

- `main` → producción automática. PRs → preview URL.
- `netlify.toml` define headers de seguridad (HSTS, CSP estricta, Permissions-Policy) y caching (`/_astro/*` immutable). Tocar la CSP con cuidado: el sitio actual no carga recursos externos, así que `default-src 'self'` funciona — añadir orígenes solo si se introduce contenido externo.
- Redirect `www → apex` configurado en el mismo archivo.

## Carpetas ignoradas por git

- `docs/` — specs y planes de implementación, solo locales.
- `_source-archive/` — materiales fuente sin procesar (JPEG originales, PDFs sin renombrar, fotos, vídeos). Copiar/renombrar a `src/content/` o `public/` al añadir contenido; no referenciar desde código.
- `.superpowers/` — mockups de brainstorming.
