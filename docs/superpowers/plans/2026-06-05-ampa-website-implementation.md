# AMPA Arco de la Alameda — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir y desplegar la web del AMPA Arco de la Alameda en `ampaarcodelaalameda.es` siguiendo el spec `2026-06-05-ampa-website-design.md`.

**Architecture:** Sitio estático Astro con Markdown + Content Collections, estilos en CSS variables con scoped styles por componente, sin JavaScript en cliente, sin analítica, sin scripts de terceros. Desplegado en Netlify desde repo de GitHub personal.

**Tech Stack:** Astro 5.x · TypeScript · CSS variables · Node.js ≥ 20 · Netlify · DonDominio (dominio `.es`).

**Spec de referencia:** `docs/superpowers/specs/2026-06-05-ampa-website-design.md`

---

## Notas globales para quien ejecute

- **Working directory:** `/Users/vlledo/Documents/AMPA/`. Todas las rutas relativas son a esta carpeta salvo que se diga lo contrario.
- **Comandos de verificación:** después de cualquier cambio de código se ejecuta `npm run build` (build completo de Astro) o `npm run dev` (servidor de desarrollo en `http://localhost:4321`). Astro valida frontmatter y TypeScript en build.
- **Commits frecuentes:** un commit por tarea como mínimo. Mensajes en imperativo en español.
- **No introducir JavaScript de cliente** salvo que el spec lo pida explícitamente. Esta web carga sin JS.
- **Estilos:** los componentes `.astro` llevan `<style>` scoped por defecto. Las variables globales viven en `src/styles/tokens.css` y se importan desde el layout base.

---

## Task 1: Inicializar repo git y preparar estructura del proyecto

**Files:**
- Create: `/Users/vlledo/Documents/AMPA/.gitignore`
- Move existing folders to `_source-archive/` (mantienen los materiales originales fuera del Astro project)

**Step 1: Inicializar git**

```bash
cd /Users/vlledo/Documents/AMPA
git init
git branch -M main
```

**Step 2: Mover carpetas de materiales originales a `_source-archive/`**

```bash
mkdir -p _source-archive
mv "Escuela de verano 25-26" _source-archive/
mv "Extraescolares 26-27" _source-archive/
mv "Ludoteca 26-27" _source-archive/
mv "Logos colegio Jesús María" _source-archive/
mv "Mercadillo de juguetes (próximo 10 de Junio)" _source-archive/
mv "Mercadillo de libros" _source-archive/
mv "Semana del arte" _source-archive/
mv "cartel fiesta fin de curso.jpeg" _source-archive/
mv "Hazte socio.jpeg" _source-archive/
mv "logo AMPA.jpeg" _source-archive/
```

**Step 3: Crear `.gitignore`**

Contenido del archivo:

```gitignore
# Node
node_modules/
dist/
.astro/

# Editores / SO
.DS_Store
.vscode/
.idea/
*.log

# Materiales originales (no van al repo)
_source-archive/

# Mockups de brainstorming
.superpowers/
```

**Step 4: Commit inicial con el spec y la estructura**

```bash
git add .gitignore docs/
git commit -m "chore: estructura inicial del repo con spec del proyecto"
```

**Step 5: Verificar estado**

Run: `git status`
Expected: clean working tree, branch `main`, los recursos en `_source-archive/` no aparecen tracked.

---

## Task 2: Scaffold del proyecto Astro

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/` (estructura mínima generada por Astro)

**Step 1: Crear proyecto Astro con la plantilla mínima**

Run:
```bash
cd /Users/vlledo/Documents/AMPA
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --skip-houston --yes
```

Esto crea `package.json`, `astro.config.mjs`, `tsconfig.json` y `src/pages/index.astro` por defecto.

**Step 2: Instalar dependencias**

Run:
```bash
npm install
```

Expected: instala Astro y sus deps en `node_modules/`. Sin warnings críticos.

**Step 3: Añadir `@astrojs/sitemap`**

Run:
```bash
npm install @astrojs/sitemap
```

**Step 4: Verificar build vacío**

Run:
```bash
npm run build
```

Expected: `Build complete!` con la página de bienvenida default de Astro generada en `dist/`.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: scaffold inicial de Astro con TypeScript estricto y sitemap"
```

---

## Task 3: Configurar `astro.config.mjs` y limpieza inicial

**Files:**
- Modify: `astro.config.mjs`
- Delete: `src/pages/index.astro` (lo reescribimos en una tarea posterior)
- Create: `public/robots.txt`

**Step 1: Reemplazar `astro.config.mjs`**

Contenido completo del archivo:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ampaarcodelaalameda.es',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  image: {
    // Astro maneja imágenes locales sin endpoints remotos
  },
});
```

**Step 2: Borrar el `index.astro` por defecto**

Run:
```bash
rm src/pages/index.astro
```

**Step 3: Crear `public/robots.txt`**

Contenido:

```
User-agent: *
Allow: /

Sitemap: https://ampaarcodelaalameda.es/sitemap-index.xml
```

**Step 4: Verificar que el build sigue funcionando (sin páginas todavía)**

Run:
```bash
npm run build
```

Expected: Build OK (puede avisar de "no pages found" — normal).

**Step 5: Commit**

```bash
git add astro.config.mjs public/robots.txt
git rm src/pages/index.astro
git commit -m "chore: configurar site URL, trailing slash y robots.txt"
```

---

## Task 4: Diseño — tokens, reset y estilos globales

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/reset.css`
- Create: `src/styles/global.css`

**Step 1: Crear `src/styles/tokens.css`**

Contenido completo:

```css
:root {
  /* Paleta extraída de los logos */
  --ampa-green: #60c030;
  --ampa-dark: #205040;
  --ampa-deep: #1a4030;
  --ampa-blue: #005090;
  --ampa-red: #f03030;
  --green-soft: #e8f5e2;

  /* Neutrales */
  --ink: #111418;
  --ink-soft: #4a5568;
  --bg: #fafbfc;
  --line: #e7ebef;
  --white: #ffffff;

  /* Tipografía */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;

  --fs-h1: 2rem;
  --fs-h2: 1.35rem;
  --fs-h3: 1.05rem;
  --fs-body: 1rem;
  --fs-small: 0.85rem;
  --fs-micro: 0.7rem;

  --lh-tight: 1.15;
  --lh-snug: 1.3;
  --lh-normal: 1.5;

  /* Espaciado (escala base 4px) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 2.5rem;
  --space-8: 3rem;
  --space-section: 3.125rem;
  --space-section-mobile: 2.25rem;

  /* Layout */
  --container-max: 1120px;
  --container-pad: 28px;
  --container-pad-mobile: 16px;
  --breakpoint-md: 760px;

  /* Bordes y radios */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 999px;

  /* Sombras (uso muy puntual) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
}
```

**Step 2: Crear `src/styles/reset.css`**

Contenido completo:

```css
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body, h1, h2, h3, h4, h5, h6, p, figure, blockquote, dl, dd {
  margin: 0;
}

ul, ol {
  margin: 0;
  padding: 0;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

button {
  font: inherit;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Step 3: Crear `src/styles/global.css`**

Contenido completo:

```css
@import './tokens.css';
@import './reset.css';

html {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: var(--lh-normal);
  color: var(--ink);
  background: var(--bg);
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

a {
  color: var(--ampa-blue);
  text-decoration: underline;
  text-underline-offset: 2px;
}

a:hover {
  text-decoration-thickness: 2px;
}

:focus-visible {
  outline: 3px solid var(--ampa-green);
  outline-offset: 2px;
  border-radius: 2px;
}

h1, h2, h3, h4 {
  line-height: var(--lh-snug);
  color: var(--ink);
}

h1 { font-size: var(--fs-h1); line-height: var(--lh-tight); font-weight: 700; }
h2 { font-size: var(--fs-h2); font-weight: 700; }
h3 { font-size: var(--fs-h3); font-weight: 700; }

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-pad);
}

@media (max-width: 760px) {
  .container {
    padding: 0 var(--container-pad-mobile);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  padding: var(--space-3) var(--space-4);
  background: var(--ampa-dark);
  color: var(--white);
  transform: translateY(-150%);
  z-index: 100;
}

.skip-link:focus {
  transform: translateY(0);
}
```

**Step 4: Verificar build**

Run: `npm run build`
Expected: build OK (los CSS no se usan todavía pero deben validar como archivos).

**Step 5: Commit**

```bash
git add src/styles/
git commit -m "feat: sistema de design tokens, reset y estilos globales"
```

---

## Task 5: `BaseLayout` mínimo

**Files:**
- Create: `src/layouts/BaseLayout.astro`

**Step 1: Crear `src/layouts/BaseLayout.astro`**

Contenido completo:

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
}

const { title, description, ogImage, noIndex = false } = Astro.props;
const siteUrl = Astro.site?.toString() ?? 'https://ampaarcodelaalameda.es/';
const canonical = new URL(Astro.url.pathname, siteUrl).toString();
const defaultOg = new URL('/og-default.jpg', siteUrl).toString();
const ogImageUrl = ogImage ? new URL(ogImage, siteUrl).toString() : defaultOg;
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noIndex && <meta name="robots" content="noindex" />}

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImageUrl} />
    <meta property="og:locale" content="es_ES" />
    <meta property="og:site_name" content="AMPA Arco de la Alameda" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageUrl} />

    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  </head>
  <body>
    <a href="#contenido" class="skip-link">Saltar al contenido principal</a>
    <slot name="header" />
    <main id="contenido">
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

**Step 2: Crear una página de prueba `src/pages/index.astro` para validar el layout**

Contenido temporal:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="AMPA Arco de la Alameda" description="Web del AMPA del CEIP Jesús María, Jaén.">
  <h1>AMPA Arco de la Alameda</h1>
  <p>Página en construcción.</p>
</BaseLayout>
```

**Step 3: Lanzar dev y verificar**

Run: `npm run dev`
Open: `http://localhost:4321`
Expected:
- Página con título "AMPA Arco de la Alameda" en `<title>`
- `<html lang="es">` en el HTML inspeccionable
- Skip link visible al pulsar Tab
- Sin errores en consola del navegador

Detener el dev con Ctrl+C.

**Step 4: Verificar build**

Run: `npm run build`
Expected: build OK.

**Step 5: Commit**

```bash
git add src/layouts/ src/pages/index.astro
git commit -m "feat: BaseLayout con SEO básico, OG tags y skip link"
```

---

## Task 6: Componentes de chrome — `TopBar`, `Header`, `Footer`

**Files:**
- Create: `src/components/TopBar.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/assets/logo-ampa.jpeg` (copiar desde `_source-archive/`)
- Create: `src/assets/logo-ceip-jesus-maria.jpg` (copiar desde `_source-archive/`)

**Step 1: Copiar logos a `src/assets/`**

```bash
mkdir -p src/assets
cp "_source-archive/logo AMPA.jpeg" "src/assets/logo-ampa.jpeg"
cp "_source-archive/Logos colegio Jesús María/Logo CEIP Jesus Maria.jpg" "src/assets/logo-ceip-jesus-maria.jpg"
```

**Step 2: Crear `src/components/TopBar.astro`**

```astro
---
---
<div class="topbar">
  <div class="container topbar-inner">
    <ul class="anchors">
      <li><span aria-hidden="true">🏫</span> CEIP Jesús María · Jaén</li>
      <li class="lime"><span aria-hidden="true">🌿</span> Ecoescuela · Bandera Verde</li>
      <li>Colegio centenario</li>
    </ul>
    <div class="fampa">Federada FAMPA Los Olivos</div>
  </div>
</div>

<style>
  .topbar {
    background: var(--ampa-dark);
    color: var(--white);
    font-size: var(--fs-micro);
    padding: 7px 0;
  }
  .topbar-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
  }
  .anchors {
    list-style: none;
    display: flex;
    gap: var(--space-5);
    flex-wrap: wrap;
  }
  .anchors .lime { color: var(--ampa-green); font-weight: 600; }
  .fampa { white-space: nowrap; opacity: 0.95; }

  @media (max-width: 760px) {
    .fampa { display: none; }
    .anchors { gap: var(--space-3); font-size: 0.65rem; }
  }
</style>
```

**Step 3: Crear `src/components/Header.astro`**

```astro
---
import { Image } from 'astro:assets';
import logoAmpa from '../assets/logo-ampa.jpeg';

const currentPath = Astro.url.pathname;
const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios/' },
  { label: 'Eventos', href: '/eventos/' },
  { label: 'Noticias', href: '/noticias/' },
  { label: 'Hazte socio', href: '/hazte-socio/' },
  { label: 'Contacto', href: '/contacto/' },
];
---
<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="brand" aria-label="AMPA Arco de la Alameda, ir a inicio">
      <Image src={logoAmpa} alt="" width={48} height={48} class="logo" />
      <div class="brand-text">
        <span class="brand-title">AMPA Arco de la Alameda</span>
        <span class="brand-sub">CEIP Jesús María · Jaén</span>
      </div>
    </a>
    <nav aria-label="Navegación principal">
      <ul>
        {navItems.map(item => (
          <li>
            <a
              href={item.href}
              class:list={[{ active: isActive(item.href) || (item.href === '/' && currentPath === '/') }]}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  </div>
</header>

<style>
  .site-header {
    background: var(--white);
    border-bottom: 1px solid var(--line);
    padding: var(--space-4) 0;
  }
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    text-decoration: none;
    color: var(--ink);
  }
  .logo {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: contain;
    background: var(--white);
    flex-shrink: 0;
  }
  .brand-text { display: flex; flex-direction: column; line-height: 1.1; }
  .brand-title { font-weight: 700; font-size: 1rem; }
  .brand-sub { color: var(--ink-soft); font-size: var(--fs-small); margin-top: 2px; }
  nav ul { list-style: none; display: flex; gap: var(--space-5); }
  nav a {
    color: var(--ink);
    text-decoration: none;
    font-size: 0.9rem;
    padding: var(--space-1) 0;
    border-bottom: 2px solid transparent;
  }
  nav a.active {
    color: var(--ampa-dark);
    font-weight: 700;
    border-bottom-color: var(--ampa-green);
  }

  @media (max-width: 760px) {
    .header-inner { flex-direction: column; align-items: flex-start; }
    nav ul { gap: var(--space-3); flex-wrap: wrap; }
    .brand-sub { display: none; }
  }
</style>
```

**Step 4: Crear `src/components/Footer.astro`**

```astro
---
import { Image } from 'astro:assets';
import logoCeip from '../assets/logo-ceip-jesus-maria.jpg';

const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="col">
        <h2 class="col-title">AMPA Arco de la Alameda</h2>
        <address>
          Alameda de Adolfo Suárez, 1<br />
          CP 23003 · Jaén<br />
          <a href="mailto:ampacolegiojesusmaria@gmail.com">ampacolegiojesusmaria@gmail.com</a>
        </address>
      </div>

      <div class="col">
        <h2 class="col-title">Nuestro colegio</h2>
        <div class="school">
          <Image src={logoCeip} alt="Logo CEIP Jesús María" width={64} height={80} class="school-logo" />
          <div>
            <strong>CEIP Jesús María</strong><br />
            <span class="muted">Jaén · Ecoescuela</span>
          </div>
        </div>
      </div>

      <div class="col">
        <h2 class="col-title">Federada a</h2>
        <p>
          <a href="https://fampalosolivos.org/" rel="noopener" target="_blank">
            FAMPA Los Olivos ↗
          </a>
        </p>
        <p class="muted">Federación provincial de AMPAs</p>
      </div>

      <div class="col">
        <h2 class="col-title">Síguenos</h2>
        <ul class="social">
          <li>
            <a
              href="https://www.facebook.com/ampa.jesusmariajaen/?locale=es_LA"
              rel="noopener"
              target="_blank"
              aria-label="Facebook del AMPA"
            >Facebook ↗</a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/ampa_arco_de_la_alameda/"
              rel="noopener"
              target="_blank"
              aria-label="Instagram del AMPA"
            >Instagram ↗</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="legal">
      <div>© {year} AMPA Arco de la Alameda</div>
      <div><a href="/aviso-legal/">Aviso legal</a></div>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    background: #f3f5f7;
    border-top: 1px solid var(--line);
    padding: var(--space-7) 0;
    font-size: var(--fs-small);
    color: var(--ink-soft);
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
    gap: var(--space-6);
  }
  .col-title {
    font-size: var(--fs-small);
    color: var(--ink);
    font-weight: 700;
    margin-bottom: var(--space-3);
  }
  address { font-style: normal; line-height: 1.6; }
  .school { display: flex; align-items: center; gap: var(--space-3); }
  .school-logo { width: 56px; height: auto; border-radius: var(--radius-sm); }
  .muted { color: var(--ink-soft); }
  .social { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); }
  .legal {
    margin-top: var(--space-6);
    padding-top: var(--space-5);
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-3);
    font-size: var(--fs-micro);
  }

  @media (max-width: 760px) {
    .footer-grid { grid-template-columns: 1fr 1fr; gap: var(--space-5); }
  }
  @media (max-width: 480px) {
    .footer-grid { grid-template-columns: 1fr; }
  }
</style>
```

**Step 5: Conectar TopBar, Header y Footer en el `index.astro` temporal**

Reemplazar `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TopBar from '../components/TopBar.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---
<BaseLayout title="AMPA Arco de la Alameda" description="Web del AMPA del CEIP Jesús María, Jaén.">
  <Fragment slot="header">
    <TopBar />
    <Header />
  </Fragment>
  <div class="container" style="padding-top: 2rem; padding-bottom: 2rem;">
    <h1>AMPA Arco de la Alameda</h1>
    <p>Página en construcción.</p>
  </div>
  <Fragment slot="footer">
    <Footer />
  </Fragment>
</BaseLayout>
```

**Step 6: Verificar visualmente**

Run: `npm run dev`
Open: `http://localhost:4321`
Expected:
- Barra superior verde con los 3 anclajes
- Header con logo AMPA, nombre y navegación
- Footer con las 4 columnas y logo del cole
- Sin errores en consola

**Step 7: Verificar build y commit**

Run: `npm run build`
Expected: build OK.

```bash
git add src/components/ src/assets/ src/pages/index.astro
git commit -m "feat: TopBar, Header con nav activa y Footer con logo del cole"
```

---

## Task 7: Schemas de Content Collections

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/events/.gitkeep`
- Create: `src/content/services/.gitkeep`
- Create: `src/content/pages/.gitkeep`
- Create: `src/content/posts/.gitkeep`

**Step 1: Crear `src/content/config.ts`**

Contenido completo:

```ts
import { defineCollection, z, reference } from 'astro:content';

const events = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      location: z.string(),
      poster: image(),
      posterAlt: z.string().min(1, 'El alt del cartel es obligatorio'),
      featured: z.boolean().default(false),
      shortDescription: z.string(),
    }),
});

const services = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        season: z.string(),
        shortDescription: z.string(),
        heroImage: image().optional(),
        heroImageAlt: z.string().optional(),
        formUrl: z.string().url().optional(),
        formPdf: z.string().optional(),
        documents: z
          .array(
            z.object({
              label: z.string(),
              file: z.string(),
            })
          )
          .default([]),
        order: z.number().default(99),
      })
      .refine(
        (data) => !(data.formUrl && data.formPdf),
        { message: 'formUrl y formPdf son mutuamente excluyentes' }
      )
      .refine(
        (data) => !data.heroImage || data.heroImageAlt,
        { message: 'heroImageAlt es obligatorio cuando hay heroImage' }
      ),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      excerpt: z.string(),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { events, services, pages, posts };
```

**Step 2: Crear archivos `.gitkeep` en las carpetas vacías para que git las trackee**

```bash
mkdir -p src/content/events src/content/services src/content/pages src/content/posts
touch src/content/events/.gitkeep
touch src/content/services/.gitkeep
touch src/content/pages/.gitkeep
touch src/content/posts/.gitkeep
```

**Step 3: Verificar que Astro reconoce las colecciones**

Run: `npm run astro -- sync`
Expected: genera `.astro/` con tipos. Sin errores.

**Step 4: Verificar build**

Run: `npm run build`
Expected: build OK (las colecciones están vacías, eso es válido).

**Step 5: Commit**

```bash
git add src/content/
git commit -m "feat: schemas Zod para colecciones events, services, pages y posts"
```

---

## Task 8: Componentes átomo — `Button` e iconos

**Files:**
- Create: `src/components/Button.astro`
- Create: `src/components/icons/IconCalendar.astro`
- Create: `src/components/icons/IconLocation.astro`
- Create: `src/components/icons/IconArrow.astro`
- Create: `src/components/icons/IconDownload.astro`
- Create: `src/components/icons/IconExternal.astro`

**Step 1: Crear `src/components/Button.astro`**

```astro
---
interface Props {
  href: string;
  variant?: 'primary' | 'ghost' | 'inverse' | 'accent';
  external?: boolean;
  download?: boolean;
  ariaLabel?: string;
}

const {
  href,
  variant = 'primary',
  external = false,
  download = false,
  ariaLabel,
} = Astro.props;

const rel = external ? 'noopener' : undefined;
const target = external ? '_blank' : undefined;
const downloadAttr = download ? '' : undefined;
---
<a
  href={href}
  class:list={['btn', `btn-${variant}`]}
  rel={rel}
  target={target}
  download={downloadAttr}
  aria-label={ariaLabel}
>
  <slot />
</a>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 10px 18px;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: var(--radius-sm);
    text-decoration: none;
    border: 1px solid transparent;
    transition: background-color 0.15s ease;
  }
  .btn-primary { background: var(--ampa-dark); color: var(--white); }
  .btn-primary:hover { background: var(--ampa-deep); }
  .btn-ghost { background: transparent; color: var(--ampa-dark); border-color: var(--ampa-dark); }
  .btn-ghost:hover { background: var(--green-soft); }
  .btn-inverse { background: var(--white); color: var(--ampa-deep); }
  .btn-inverse:hover { background: var(--green-soft); }
  .btn-accent { background: var(--ampa-green); color: var(--ampa-deep); }
  .btn-accent:hover { filter: brightness(0.95); }
</style>
```

**Step 2: Crear iconos SVG inline**

`src/components/icons/IconCalendar.astro`:

```astro
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
  <path d="M3 9H21" stroke="currentColor" stroke-width="2"/>
  <path d="M8 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M16 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```

`src/components/icons/IconLocation.astro`:

```astro
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <path d="M12 22S20 14.5 20 10A8 8 0 0 0 4 10C4 14.5 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
</svg>
```

`src/components/icons/IconArrow.astro`:

```astro
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

`src/components/icons/IconDownload.astro`:

```astro
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5 18V19A2 2 0 0 0 7 21H17A2 2 0 0 0 19 19V18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```

`src/components/icons/IconExternal.astro`:

```astro
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  <path d="M14 4H20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 4L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M19 14V19A1 1 0 0 1 18 20H5A1 1 0 0 1 4 19V6A1 1 0 0 1 5 5H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```

**Step 3: Verificar build**

Run: `npm run build`
Expected: build OK.

**Step 4: Commit**

```bash
git add src/components/Button.astro src/components/icons/
git commit -m "feat: componente Button con variantes y set de iconos SVG"
```

---

## Task 9: Componente `DocumentLink`

**Files:**
- Create: `src/components/DocumentLink.astro`

**Step 1: Crear `src/components/DocumentLink.astro`**

Este componente recibe la URL del archivo y muestra un link con icono y label. Para mostrar el tamaño del archivo necesitaríamos hacer `fetch` en build; por simplicidad inicial mostramos el tipo de archivo (PDF, IMG, DOC) en vez del tamaño, y el tamaño se añade después si interesa.

```astro
---
import IconDownload from './icons/IconDownload.astro';

interface Props {
  href: string;
  label: string;
}

const { href, label } = Astro.props;

function inferType(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'PDF';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'Imagen';
  if (['doc', 'docx'].includes(ext)) return 'Word';
  return ext.toUpperCase() || 'Archivo';
}

const fileType = inferType(href);
---
<a class="doc-link" href={href} download rel="noopener">
  <IconDownload />
  <span class="label">{label}</span>
  <span class="type">{fileType}</span>
</a>

<style>
  .doc-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    color: var(--ink);
    text-decoration: none;
    font-size: var(--fs-small);
    transition: border-color 0.15s ease;
  }
  .doc-link:hover { border-color: var(--ampa-dark); }
  .label { flex: 1; font-weight: 500; }
  .type {
    font-size: var(--fs-micro);
    color: var(--ink-soft);
    background: var(--bg);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-weight: 600;
  }
</style>
```

**Step 2: Verificar build**

Run: `npm run build`
Expected: OK.

**Step 3: Commit**

```bash
git add src/components/DocumentLink.astro
git commit -m "feat: componente DocumentLink para archivos descargables"
```

---

## Task 10: Componentes de tarjeta — `EventCard` y `ServiceCard`

**Files:**
- Create: `src/components/EventCard.astro`
- Create: `src/components/ServiceCard.astro`

**Step 1: Crear `src/components/EventCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';

interface Props {
  event: CollectionEntry<'events'>;
}

const { event } = Astro.props;
const { title, date, location, poster, posterAlt, shortDescription } = event.data;
const url = `/eventos/${event.slug}/`;

const day = date.getDate();
const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).replace('.', '');
const fullDate = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);
---
<article class="event-card">
  <a href={url} class="event-link" aria-label={`Ver detalles de ${title}`}>
    <div class="poster">
      <Image src={poster} alt={posterAlt} width={400} height={533} />
    </div>
    <div class="body">
      <div class="date-chip" aria-hidden="true">
        <span class="d">{day}</span>
        <span class="m">{month}</span>
      </div>
      <h3>{title}</h3>
      <p class="meta"><time datetime={date.toISOString()}>{fullDate}</time> · {location}</p>
      <p class="lead">{shortDescription}</p>
    </div>
  </a>
</article>

<style>
  .event-card {
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--white);
    transition: border-color 0.15s ease;
  }
  .event-card:hover { border-color: var(--ampa-dark); }
  .event-link { display: block; color: inherit; text-decoration: none; }
  .poster { aspect-ratio: 3/4; background: var(--green-soft); overflow: hidden; }
  .poster :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .body { padding: var(--space-4); position: relative; }
  .date-chip {
    position: absolute;
    top: -28px;
    left: var(--space-4);
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-3);
    text-align: center;
    box-shadow: var(--shadow-sm);
  }
  .date-chip .d { display: block; font-size: 1.4rem; font-weight: 800; color: var(--ampa-dark); line-height: 1; }
  .date-chip .m { display: block; font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft); margin-top: 2px; }
  h3 { margin-top: var(--space-4); }
  .meta { color: var(--ink-soft); font-size: var(--fs-small); margin-top: var(--space-2); }
  .lead { margin-top: var(--space-3); color: var(--ink-soft); }
</style>
```

**Step 2: Crear `src/components/ServiceCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';

interface Props {
  service: CollectionEntry<'services'>;
}

const { service } = Astro.props;
const { title, season, shortDescription, heroImage, heroImageAlt } = service.data;
const url = `/servicios/${service.slug}/`;
---
<article class="service-card">
  <a href={url} class="service-link">
    <div class="img">
      {heroImage && heroImageAlt
        ? <Image src={heroImage} alt={heroImageAlt} width={520} height={293} />
        : <div class="placeholder" aria-hidden="true">{title}</div>
      }
    </div>
    <div class="body">
      <span class="label">{season}</span>
      <h3>{title}</h3>
      <p>{shortDescription}</p>
      <span class="cta">Más información</span>
    </div>
  </a>
</article>

<style>
  .service-card {
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--white);
    transition: border-color 0.15s ease;
  }
  .service-card:hover { border-color: var(--ampa-dark); }
  .service-link { display: block; color: inherit; text-decoration: none; }
  .img {
    aspect-ratio: 16/9;
    background: var(--green-soft);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .img :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .placeholder { color: var(--ampa-dark); font-weight: 600; font-size: var(--fs-small); }
  .body { padding: var(--space-4); }
  .label {
    font-size: var(--fs-micro);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ampa-dark);
    font-weight: 800;
  }
  h3 { margin-top: var(--space-2); }
  p { margin-top: var(--space-2); color: var(--ink-soft); font-size: var(--fs-small); }
  .cta {
    display: inline-block;
    margin-top: var(--space-3);
    font-size: var(--fs-small);
    font-weight: 600;
    color: var(--ink);
    border-bottom: 2px solid var(--ampa-green);
    padding-bottom: 2px;
  }
</style>
```

**Step 3: Verificar build**

Run: `npm run build`
Expected: OK.

**Step 4: Commit**

```bash
git add src/components/EventCard.astro src/components/ServiceCard.astro
git commit -m "feat: tarjetas reutilizables EventCard y ServiceCard"
```

---

## Task 11: Componentes de portada — `HeroEvent`, `SecondaryEvent`, `ServiceGrid`, `SociosCTA`, `NewsTeaser`

**Files:**
- Create: `src/components/HeroEvent.astro`
- Create: `src/components/SecondaryEvent.astro`
- Create: `src/components/ServiceGrid.astro`
- Create: `src/components/SociosCTA.astro`
- Create: `src/components/NewsTeaser.astro`

**Step 1: Crear `src/components/HeroEvent.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import Button from './Button.astro';
import IconCalendar from './icons/IconCalendar.astro';
import IconLocation from './icons/IconLocation.astro';

interface Props {
  event: CollectionEntry<'events'>;
}

const { event } = Astro.props;
const { title, date, location, poster, posterAlt, shortDescription } = event.data;
const fullDate = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);
const url = `/eventos/${event.slug}/`;
---
<section class="hero" aria-labelledby="hero-title">
  <div class="container hero-grid">
    <div class="hero-text">
      <span class="kicker">Próximo evento</span>
      <h1 id="hero-title">{title}</h1>
      <div class="meta-row">
        <span class="meta-item">
          <IconCalendar />
          <time datetime={date.toISOString()}>{fullDate} h</time>
        </span>
        <span class="meta-item">
          <IconLocation />
          {location}
        </span>
      </div>
      <p class="lead">{shortDescription}</p>
      <div class="cta-row">
        <Button href={url}>Ver detalles</Button>
        <Button href="/eventos/" variant="ghost">Otros eventos</Button>
      </div>
    </div>
    <div class="hero-poster">
      <Image src={poster} alt={posterAlt} width={520} height={693} />
    </div>
  </div>
</section>

<style>
  .hero { background: var(--white); padding: var(--space-7) 0; }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: var(--space-7);
    align-items: center;
  }
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--ampa-dark);
    font-size: var(--fs-micro);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: var(--space-3);
  }
  .kicker::before { content: ''; width: 22px; height: 2px; background: var(--ampa-green); }
  h1 { max-width: 14ch; }
  .meta-row { display: flex; flex-wrap: wrap; gap: var(--space-5); margin-top: var(--space-4); color: var(--ink-soft); }
  .meta-item { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--fs-small); }
  .lead { margin-top: var(--space-4); max-width: 42ch; color: var(--ink-soft); }
  .cta-row { display: flex; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-5); }
  .hero-poster { border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--line); background: var(--green-soft); }
  .hero-poster :global(img) { width: 100%; height: auto; display: block; }

  @media (max-width: 760px) {
    .hero-grid { grid-template-columns: 1fr; gap: var(--space-5); }
  }
</style>
```

**Step 2: Crear `src/components/SecondaryEvent.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import IconArrow from './icons/IconArrow.astro';

interface Props {
  event: CollectionEntry<'events'>;
}

const { event } = Astro.props;
const { title, date, shortDescription } = event.data;
const url = `/eventos/${event.slug}/`;

const day = date.getDate();
const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date).replace('.', '');
---
<section class="secondary" aria-labelledby="secondary-title">
  <div class="container">
    <a href={url} class="secondary-link">
      <div class="date-chip" aria-hidden="true">
        <span class="d">{day}</span>
        <span class="m">{month}</span>
      </div>
      <div class="text">
        <h2 id="secondary-title">{title}</h2>
        <p>{shortDescription}</p>
      </div>
      <span class="arrow"><IconArrow /></span>
    </a>
  </div>
</section>

<style>
  .secondary { background: var(--bg); border-top: 1px solid var(--line); padding: var(--space-5) 0; }
  .secondary-link {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-5);
    align-items: center;
    color: inherit;
    text-decoration: none;
  }
  .date-chip {
    background: var(--white);
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-4);
    text-align: center;
    min-width: 70px;
  }
  .date-chip .d { display: block; font-size: 1.6rem; font-weight: 800; color: var(--ampa-dark); line-height: 1; }
  .date-chip .m { display: block; font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft); margin-top: 2px; }
  h2 { font-size: var(--fs-h3); margin: 0; }
  p { margin-top: 4px; color: var(--ink-soft); font-size: var(--fs-small); }
  .arrow { color: var(--ampa-dark); }
</style>
```

**Step 3: Crear `src/components/ServiceGrid.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import ServiceCard from './ServiceCard.astro';

interface Props {
  services: CollectionEntry<'services'>[];
  showHeader?: boolean;
}

const { services, showHeader = true } = Astro.props;
---
<section class="services" aria-labelledby={showHeader ? 'services-title' : undefined}>
  <div class="container">
    {showHeader && (
      <div class="section-header">
        <h2 id="services-title">Servicios del AMPA</h2>
        <a href="/servicios/">Ver todos →</a>
      </div>
    )}
    <div class="grid">
      {services.map(service => <ServiceCard service={service} />)}
    </div>
  </div>
</section>

<style>
  .services { padding: var(--space-section) 0; background: var(--white); border-top: 1px solid var(--line); }
  .section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-5); }
  .section-header a { color: var(--ampa-blue); font-size: var(--fs-small); font-weight: 600; text-decoration: none; }
  .section-header a:hover { text-decoration: underline; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }

  @media (max-width: 760px) {
    .services { padding: var(--space-section-mobile) 0; }
    .grid { grid-template-columns: 1fr; }
  }
</style>
```

**Step 4: Crear `src/components/SociosCTA.astro`**

```astro
---
import Button from './Button.astro';
---
<section class="socios" aria-labelledby="socios-title">
  <div class="container">
    <div class="inner">
      <div>
        <h2 id="socios-title">Hazte socio del AMPA</h2>
        <p>Cuanto más somos, más cosas podemos hacer por nuestros peques y por el cole. Hazte socio y forma parte de la comunidad Arco de la Alameda.</p>
      </div>
      <div>
        <Button href="/hazte-socio/" variant="accent">Quiero asociarme</Button>
      </div>
    </div>
  </div>
</section>

<style>
  .socios { background: var(--ampa-dark); color: var(--white); padding: var(--space-section) 0; position: relative; overflow: hidden; }
  .socios::after {
    content: '';
    position: absolute;
    right: -40px; bottom: -40px;
    width: 160px; height: 160px;
    background: var(--ampa-green);
    opacity: 0.18;
    border-radius: 50%;
  }
  .inner {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-5);
    align-items: center;
    position: relative;
    z-index: 1;
  }
  h2 { color: var(--white); margin-bottom: var(--space-2); }
  p { margin: 0; opacity: 0.92; max-width: 50ch; }

  @media (max-width: 760px) {
    .socios { padding: var(--space-section-mobile) 0; }
    .inner { grid-template-columns: 1fr; }
  }
</style>
```

**Step 5: Crear `src/components/NewsTeaser.astro`**

```astro
---
---
<section class="news" aria-labelledby="news-title">
  <div class="container">
    <div class="section-header">
      <h2 id="news-title">Últimas noticias</h2>
    </div>
    <div class="empty">
      Esta sección llegará en una próxima fase. Mientras tanto, síguenos en
      <a href="https://www.instagram.com/ampa_arco_de_la_alameda/" rel="noopener" target="_blank">Instagram</a>
      y
      <a href="https://www.facebook.com/ampa.jesusmariajaen/?locale=es_LA" rel="noopener" target="_blank">Facebook</a>.
    </div>
  </div>
</section>

<style>
  .news { padding: var(--space-section) 0; background: var(--white); border-top: 1px solid var(--line); }
  .section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-5); }
  .empty {
    background: var(--bg);
    border: 1px dashed var(--line);
    border-radius: var(--radius-md);
    padding: var(--space-6);
    text-align: center;
    color: var(--ink-soft);
    font-size: var(--fs-small);
  }
  .empty a { color: var(--ampa-blue); }
  @media (max-width: 760px) { .news { padding: var(--space-section-mobile) 0; } }
</style>
```

**Step 6: Verificar build**

Run: `npm run build`
Expected: OK.

**Step 7: Commit**

```bash
git add src/components/HeroEvent.astro src/components/SecondaryEvent.astro src/components/ServiceGrid.astro src/components/SociosCTA.astro src/components/NewsTeaser.astro
git commit -m "feat: bloques de portada (HeroEvent, SecondaryEvent, ServiceGrid, SociosCTA, NewsTeaser)"
```

---

## Task 12: Composición de la portada

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Reemplazar contenido de `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import TopBar from '../components/TopBar.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import HeroEvent from '../components/HeroEvent.astro';
import SecondaryEvent from '../components/SecondaryEvent.astro';
import ServiceGrid from '../components/ServiceGrid.astro';
import SociosCTA from '../components/SociosCTA.astro';
import NewsTeaser from '../components/NewsTeaser.astro';

const now = new Date();

const allEvents = await getCollection('events', ({ data }) => data.featured && data.date >= now);
const featured = allEvents.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
const heroEvent = featured[0];
const secondaryEvent = featured[1];

const allServices = await getCollection('services');
const services = allServices.sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout
  title="AMPA Arco de la Alameda · CEIP Jesús María, Jaén"
  description="Web del AMPA del CEIP Jesús María en Jaén. Eventos, servicios y comunidad."
>
  <Fragment slot="header">
    <TopBar />
    <Header />
  </Fragment>

  {heroEvent && <HeroEvent event={heroEvent} />}
  {!heroEvent && (
    <section class="container" style="padding: 3rem 28px;">
      <h1>AMPA Arco de la Alameda</h1>
      <p>No hay eventos destacados próximos en este momento.</p>
    </section>
  )}

  {secondaryEvent && <SecondaryEvent event={secondaryEvent} />}

  <ServiceGrid services={services} />

  <SociosCTA />

  <NewsTeaser />

  <Fragment slot="footer">
    <Footer />
  </Fragment>
</BaseLayout>
```

**Step 2: Verificar build**

Run: `npm run build`
Expected: OK (sin contenido de eventos/servicios la portada cae al fallback "No hay eventos destacados").

**Step 3: Visual smoke test**

Run: `npm run dev`
Open: `http://localhost:4321`
Expected: Header + bloque "No hay eventos próximos" + sección de servicios vacía + bloque socios + footer.

**Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: composición de la portada con secciones dinámicas"
```

---

## Task 13: Páginas de eventos — listado y detalle

**Files:**
- Create: `src/pages/eventos/index.astro`
- Create: `src/pages/eventos/[...slug].astro`

**Step 1: Crear `src/pages/eventos/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TopBar from '../../components/TopBar.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import EventCard from '../../components/EventCard.astro';

const now = new Date();
const allEvents = await getCollection('events');

const upcoming = allEvents
  .filter(e => e.data.date >= now)
  .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());

const past = allEvents
  .filter(e => e.data.date < now)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---
<BaseLayout
  title="Eventos · AMPA Arco de la Alameda"
  description="Próximos eventos y actividades del AMPA Arco de la Alameda."
>
  <Fragment slot="header">
    <TopBar />
    <Header />
  </Fragment>

  <div class="container page">
    <h1>Eventos</h1>

    <section aria-labelledby="upcoming-title">
      <h2 id="upcoming-title">Próximos eventos</h2>
      {upcoming.length === 0 ? (
        <p class="muted">No hay eventos próximos publicados.</p>
      ) : (
        <div class="grid">
          {upcoming.map(event => <EventCard event={event} />)}
        </div>
      )}
    </section>

    {past.length > 0 && (
      <section aria-labelledby="past-title">
        <h2 id="past-title">Eventos anteriores</h2>
        <div class="grid">
          {past.map(event => <EventCard event={event} />)}
        </div>
      </section>
    )}
  </div>

  <Fragment slot="footer">
    <Footer />
  </Fragment>
</BaseLayout>

<style>
  .page { padding: var(--space-7) var(--container-pad); }
  h1 { margin-bottom: var(--space-6); }
  h2 { margin-top: var(--space-7); margin-bottom: var(--space-5); }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); margin-top: var(--space-4); }
  .muted { color: var(--ink-soft); }
  @media (max-width: 760px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
```

**Step 2: Crear `src/pages/eventos/[...slug].astro`**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TopBar from '../../components/TopBar.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import Button from '../../components/Button.astro';
import IconCalendar from '../../components/icons/IconCalendar.astro';
import IconLocation from '../../components/icons/IconLocation.astro';

export async function getStaticPaths() {
  const events = await getCollection('events');
  return events.map(event => ({
    params: { slug: event.slug },
    props: { event },
  }));
}

interface Props { event: CollectionEntry<'events'>; }
const { event } = Astro.props;
const { Content } = await event.render();
const { title, date, location, poster, posterAlt, shortDescription } = event.data;
const fullDate = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);
const isPast = date < new Date();
---
<BaseLayout
  title={`${title} · AMPA Arco de la Alameda`}
  description={shortDescription}
  ogImage={poster.src}
>
  <Fragment slot="header">
    <TopBar />
    <Header />
  </Fragment>

  <article class="event">
    <div class="container event-grid">
      <div class="event-text">
        <a href="/eventos/" class="back">← Todos los eventos</a>
        {isPast && <p class="badge">Evento anterior</p>}
        <h1>{title}</h1>
        <div class="meta">
          <span class="meta-item"><IconCalendar /><time datetime={date.toISOString()}>{fullDate}</time></span>
          <span class="meta-item"><IconLocation />{location}</span>
        </div>
        <div class="content">
          <Content />
        </div>
        <div class="actions">
          <Button href="/eventos/" variant="ghost">Ver otros eventos</Button>
        </div>
      </div>
      <div class="event-poster">
        <Image src={poster} alt={posterAlt} width={640} height={853} />
      </div>
    </div>
  </article>

  <script type="application/ld+json" set:html={JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    startDate: date.toISOString(),
    location: { '@type': 'Place', name: location, address: { '@type': 'PostalAddress', addressLocality: 'Jaén', addressCountry: 'ES' } },
    description: shortDescription,
    organizer: { '@type': 'Organization', name: 'AMPA Arco de la Alameda' },
    eventStatus: 'https://schema.org/EventScheduled',
  })} />

  <Fragment slot="footer">
    <Footer />
  </Fragment>
</BaseLayout>

<style>
  .event { padding: var(--space-7) 0; background: var(--white); }
  .event-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: var(--space-7); align-items: start; }
  .back { color: var(--ampa-blue); font-size: var(--fs-small); }
  .badge { display: inline-block; background: var(--green-soft); color: var(--ampa-dark); padding: 4px 10px; border-radius: var(--radius-pill); font-size: var(--fs-micro); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: var(--space-3); }
  h1 { margin-top: var(--space-4); }
  .meta { display: flex; flex-wrap: wrap; gap: var(--space-5); margin-top: var(--space-4); color: var(--ink-soft); }
  .meta-item { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--fs-small); }
  .content { margin-top: var(--space-5); }
  .content :global(p) { margin-bottom: var(--space-4); line-height: var(--lh-normal); }
  .content :global(h2) { margin-top: var(--space-6); }
  .content :global(ul), .content :global(ol) { padding-left: var(--space-5); margin-bottom: var(--space-4); }
  .actions { margin-top: var(--space-6); }
  .event-poster { border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--line); }
  .event-poster :global(img) { width: 100%; height: auto; display: block; }

  @media (max-width: 760px) {
    .event-grid { grid-template-columns: 1fr; }
  }
</style>
```

**Step 3: Verificar build**

Run: `npm run build`
Expected: OK. Si no hay eventos en la colección, `[...slug].astro` no genera páginas (eso es correcto).

**Step 4: Commit**

```bash
git add src/pages/eventos/
git commit -m "feat: páginas de eventos (índice y detalle con JSON-LD)"
```

---

## Task 14: Páginas de servicios — listado y detalle

**Files:**
- Create: `src/pages/servicios/index.astro`
- Create: `src/pages/servicios/[...slug].astro`

**Step 1: Crear `src/pages/servicios/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TopBar from '../../components/TopBar.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import ServiceCard from '../../components/ServiceCard.astro';

const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout
  title="Servicios · AMPA Arco de la Alameda"
  description="Escuela de verano, extraescolares y ludoteca del AMPA Arco de la Alameda."
>
  <Fragment slot="header">
    <TopBar />
    <Header />
  </Fragment>

  <div class="container page">
    <h1>Servicios del AMPA</h1>
    <p class="lead">Estos son los servicios que ofrece el AMPA durante el curso y los meses de verano. Cada uno tiene su propia página con detalles, documentos e instrucciones para apuntarse.</p>
    <div class="grid">
      {services.map(service => <ServiceCard service={service} />)}
    </div>
  </div>

  <Fragment slot="footer">
    <Footer />
  </Fragment>
</BaseLayout>

<style>
  .page { padding: var(--space-7) var(--container-pad); }
  .lead { color: var(--ink-soft); max-width: 60ch; margin-top: var(--space-3); margin-bottom: var(--space-6); }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
  @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
</style>
```

**Step 2: Crear `src/pages/servicios/[...slug].astro`**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TopBar from '../../components/TopBar.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import Button from '../../components/Button.astro';
import DocumentLink from '../../components/DocumentLink.astro';
import IconExternal from '../../components/icons/IconExternal.astro';

export async function getStaticPaths() {
  const services = await getCollection('services');
  return services.map(service => ({
    params: { slug: service.slug },
    props: { service },
  }));
}

interface Props { service: CollectionEntry<'services'>; }
const { service } = Astro.props;
const { Content } = await service.render();
const { title, season, shortDescription, heroImage, heroImageAlt, formUrl, formPdf, documents } = service.data;
---
<BaseLayout
  title={`${title} · AMPA Arco de la Alameda`}
  description={shortDescription}
>
  <Fragment slot="header">
    <TopBar />
    <Header />
  </Fragment>

  <article class="service">
    <div class="container">
      <a href="/servicios/" class="back">← Todos los servicios</a>
      <span class="label">{season}</span>
      <h1>{title}</h1>
      <p class="lead">{shortDescription}</p>

      <div class="layout">
        <div class="main">
          {heroImage && heroImageAlt && (
            <div class="hero-image">
              <Image src={heroImage} alt={heroImageAlt} width={900} height={506} />
            </div>
          )}
          <div class="content">
            <Content />
          </div>
        </div>

        <aside class="sidebar">
          {formUrl && (
            <div class="action-card">
              <h2>Inscripción</h2>
              <p>Apúntate rellenando el formulario online.</p>
              <Button href={formUrl} external>
                Apuntarse <IconExternal />
              </Button>
            </div>
          )}
          {formPdf && (
            <div class="action-card">
              <h2>Inscripción</h2>
              <p>Descarga, rellena y entrega el formulario.</p>
              <Button href={formPdf} download>Descargar formulario</Button>
            </div>
          )}
          {!formUrl && !formPdf && (
            <div class="action-card muted">
              <h2>Inscripción</h2>
              <p>Próximamente disponible.</p>
            </div>
          )}

          {documents.length > 0 && (
            <div class="action-card">
              <h2>Documentos</h2>
              <ul class="docs">
                {documents.map(doc => (
                  <li><DocumentLink href={doc.file} label={doc.label} /></li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  </article>

  <Fragment slot="footer">
    <Footer />
  </Fragment>
</BaseLayout>

<style>
  .service { padding: var(--space-7) 0; background: var(--white); }
  .back { color: var(--ampa-blue); font-size: var(--fs-small); }
  .label { display: inline-block; margin-top: var(--space-4); font-size: var(--fs-micro); letter-spacing: 0.14em; text-transform: uppercase; color: var(--ampa-dark); font-weight: 800; }
  h1 { margin-top: var(--space-2); }
  .lead { color: var(--ink-soft); max-width: 60ch; margin-top: var(--space-3); }
  .layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-7); margin-top: var(--space-6); }
  .hero-image { border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--line); }
  .hero-image :global(img) { width: 100%; height: auto; display: block; }
  .content { margin-top: var(--space-5); }
  .content :global(p) { margin-bottom: var(--space-4); line-height: var(--lh-normal); }
  .content :global(h2) { margin-top: var(--space-5); margin-bottom: var(--space-3); }
  .content :global(ul), .content :global(ol) { padding-left: var(--space-5); margin-bottom: var(--space-4); }
  .sidebar { display: flex; flex-direction: column; gap: var(--space-4); }
  .action-card { border: 1px solid var(--line); border-radius: var(--radius-md); padding: var(--space-5); background: var(--white); }
  .action-card.muted { background: var(--bg); }
  .action-card h2 { font-size: var(--fs-h3); margin-bottom: var(--space-2); }
  .action-card p { color: var(--ink-soft); font-size: var(--fs-small); margin-bottom: var(--space-4); }
  .docs { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); }

  @media (max-width: 760px) {
    .layout { grid-template-columns: 1fr; }
  }
</style>
```

**Step 3: Verificar build**

Run: `npm run build`
Expected: OK.

**Step 4: Commit**

```bash
git add src/pages/servicios/
git commit -m "feat: páginas de servicios (índice y detalle con sidebar de inscripción)"
```

---

## Task 15: Páginas estáticas — Hazte socio, Contacto, Aviso legal, 404, Noticias placeholder

**Files:**
- Create: `src/pages/hazte-socio.astro`
- Create: `src/pages/contacto.astro`
- Create: `src/pages/aviso-legal.astro`
- Create: `src/pages/noticias/index.astro`
- Create: `src/pages/404.astro`
- Create: `src/components/PageContent.astro`

**Step 1: Crear `src/components/PageContent.astro`** (layout reusable para páginas estáticas)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TopBar from './TopBar.astro';
import Header from './Header.astro';
import Footer from './Footer.astro';

interface Props {
  title: string;
  description: string;
  pageTitle: string;
}

const { title, description, pageTitle } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <Fragment slot="header">
    <TopBar />
    <Header />
  </Fragment>

  <article class="static-page">
    <div class="container">
      <h1>{pageTitle}</h1>
      <div class="content">
        <slot />
      </div>
    </div>
  </article>

  <Fragment slot="footer">
    <Footer />
  </Fragment>
</BaseLayout>

<style>
  .static-page { padding: var(--space-7) 0; background: var(--white); }
  .content { max-width: 65ch; margin-top: var(--space-5); }
  .content :global(p) { margin-bottom: var(--space-4); line-height: var(--lh-normal); }
  .content :global(h2) { margin-top: var(--space-6); margin-bottom: var(--space-3); }
  .content :global(h3) { margin-top: var(--space-5); margin-bottom: var(--space-2); }
  .content :global(ul), .content :global(ol) { padding-left: var(--space-5); margin-bottom: var(--space-4); }
  .content :global(li) { margin-bottom: var(--space-2); }
  .content :global(a) { color: var(--ampa-blue); }
</style>
```

**Step 2: Crear `src/pages/hazte-socio.astro`** (placeholder, contenido real en Task 18)

```astro
---
import PageContent from '../components/PageContent.astro';
---
<PageContent
  title="Hazte socio · AMPA Arco de la Alameda"
  description="Únete al AMPA Arco de la Alameda del CEIP Jesús María de Jaén."
  pageTitle="Hazte socio"
>
  <p>Contenido en construcción.</p>
</PageContent>
```

**Step 3: Crear `src/pages/contacto.astro`** (placeholder)

```astro
---
import PageContent from '../components/PageContent.astro';
---
<PageContent
  title="Contacto · AMPA Arco de la Alameda"
  description="Datos de contacto del AMPA Arco de la Alameda."
  pageTitle="Contacto"
>
  <p>Contenido en construcción.</p>
</PageContent>
```

**Step 4: Crear `src/pages/aviso-legal.astro`** (placeholder)

```astro
---
import PageContent from '../components/PageContent.astro';
---
<PageContent
  title="Aviso legal · AMPA Arco de la Alameda"
  description="Aviso legal y política de privacidad del AMPA Arco de la Alameda."
  pageTitle="Aviso legal y privacidad"
>
  <p>Contenido en construcción.</p>
</PageContent>
```

**Step 5: Crear `src/pages/noticias/index.astro`**

```astro
---
import PageContent from '../../components/PageContent.astro';
---
<PageContent
  title="Noticias · AMPA Arco de la Alameda"
  description="Noticias y actividades del AMPA Arco de la Alameda."
  pageTitle="Noticias"
>
  <p>Estamos preparando esta sección. Pronto encontrarás aquí convocatorias de asambleas, crónicas de actividades y comunicados del AMPA.</p>
  <p>Mientras tanto, puedes seguirnos en
    <a href="https://www.instagram.com/ampa_arco_de_la_alameda/" rel="noopener" target="_blank">Instagram</a>
    y
    <a href="https://www.facebook.com/ampa.jesusmariajaen/?locale=es_LA" rel="noopener" target="_blank">Facebook</a>.
  </p>
</PageContent>
```

**Step 6: Crear `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import TopBar from '../components/TopBar.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import Button from '../components/Button.astro';
---
<BaseLayout
  title="Página no encontrada · AMPA Arco de la Alameda"
  description="La página que buscas no existe."
  noIndex
>
  <Fragment slot="header">
    <TopBar />
    <Header />
  </Fragment>

  <div class="container error">
    <p class="code">404</p>
    <h1>No encontramos esta página</h1>
    <p>Quizá el enlace ha cambiado o la página ya no existe. Puedes volver a la portada o consultar los servicios y eventos disponibles.</p>
    <div class="actions">
      <Button href="/">Volver a inicio</Button>
      <Button href="/servicios/" variant="ghost">Ver servicios</Button>
    </div>
  </div>

  <Fragment slot="footer">
    <Footer />
  </Fragment>
</BaseLayout>

<style>
  .error { padding: var(--space-7) var(--container-pad); text-align: center; max-width: 60ch; margin: 0 auto; }
  .code { font-size: 4rem; font-weight: 800; color: var(--ampa-dark); line-height: 1; margin-bottom: var(--space-3); }
  h1 { margin-bottom: var(--space-4); }
  .actions { display: flex; justify-content: center; gap: var(--space-3); margin-top: var(--space-5); flex-wrap: wrap; }
</style>
```

**Step 7: Verificar build**

Run: `npm run build`
Expected: OK. Páginas accesibles localmente.

**Step 8: Commit**

```bash
git add src/components/PageContent.astro src/pages/hazte-socio.astro src/pages/contacto.astro src/pages/aviso-legal.astro src/pages/noticias/ src/pages/404.astro
git commit -m "feat: páginas estáticas (hazte-socio, contacto, aviso-legal, noticias, 404)"
```

---

## Task 16: Poblar eventos del MVP

**Files:**
- Create: `src/content/events/fiesta-fin-curso-2026/index.md` + `cartel.jpeg`
- Create: `src/content/events/mercadillo-juguetes-2026/index.md` + `cartel.jpeg`

**Step 1: Copiar los carteles al lugar correspondiente**

```bash
mkdir -p src/content/events/fiesta-fin-curso-2026
mkdir -p src/content/events/mercadillo-juguetes-2026
cp "_source-archive/cartel fiesta fin de curso.jpeg" "src/content/events/fiesta-fin-curso-2026/cartel.jpeg"
cp "_source-archive/Mercadillo de juguetes (próximo 10 de Junio)/Mercadillo de juguetes cartel.jpeg" "src/content/events/mercadillo-juguetes-2026/cartel.jpeg"
```

**Step 2: Crear `src/content/events/fiesta-fin-curso-2026/index.md`**

```markdown
---
title: Fiesta fin de curso
date: 2026-06-22T19:00:00+02:00
location: CEIP Jesús María, Jaén
poster: ./cartel.jpeg
posterAlt: Cartel de la fiesta fin de curso del 22 de junio de 2026 a partir de las 19:00 en el CEIP Jesús María.
featured: true
shortDescription: Cerramos el curso con barra, música, juegos y actuaciones del alumnado. Os esperamos a todas las familias.
---

Cerramos el curso 25-26 con la fiesta más esperada del año.

## Programa

- **Barra con bebidas y bocadillos** — solo se admiten pagos en **efectivo**.
- **Animación a cargo de Geminela** — DJ y actividades para los peques.
- **Juegos y actividades para niños** organizados por el AMPA.
- **Actuaciones de fin de curso** del alumnado del cole.

## Detalles

- **Cuándo:** 22 de junio de 2026, a partir de las 19:00 h.
- **Dónde:** CEIP Jesús María, Alameda de Adolfo Suárez, 1 — Jaén.
- **Para quién:** todas las familias del cole, socios y no socios.

Si quieres echar una mano antes, durante o después de la fiesta, escríbenos a [ampacolegiojesusmaria@gmail.com](mailto:ampacolegiojesusmaria@gmail.com) o díselo a cualquier miembro de la junta del AMPA.

¡Nos vemos en la fiesta!
```

**Step 3: Crear `src/content/events/mercadillo-juguetes-2026/index.md`**

```markdown
---
title: Mercadillo de juguetes
date: 2026-06-10T16:30:00+02:00
location: CEIP Jesús María, Jaén
poster: ./cartel.jpeg
posterAlt: Cartel del mercadillo de juguetes del 10 de junio.
featured: true
shortDescription: Damos una nueva vida a los juguetes. Trae los tuyos y llévate otros.
---

Iniciativa de economía circular del AMPA: los juguetes que ya no usas en casa pueden hacer feliz a otra familia, y viceversa.

## Cómo participa el alumnado

- Cada peque puede traer juguetes en buen estado.
- Por cada juguete entregado, recibe un "punto" que cambia por otro juguete del mercadillo.

## Detalles

- **Cuándo:** 10 de junio de 2026.
- **Dónde:** patio del CEIP Jesús María.

Para resolver cualquier duda escríbenos a [ampacolegiojesusmaria@gmail.com](mailto:ampacolegiojesusmaria@gmail.com).
```

**Step 4: Verificar build**

Run: `npm run build`
Expected: build OK. Se generan `/eventos/fiesta-fin-curso-2026/` y `/eventos/mercadillo-juguetes-2026/`.

**Step 5: Verificar visualmente**

Run: `npm run dev`
Open: `http://localhost:4321`
Expected:
- Portada: hero con la fiesta + tira secundaria con el mercadillo.
- `/eventos/`: lista los 2 eventos en "Próximos eventos".
- `/eventos/fiesta-fin-curso-2026/`: detalle con cartel grande.

**Step 6: Commit**

```bash
git add src/content/events/
git commit -m "content: eventos MVP (fiesta fin de curso 22-jun, mercadillo juguetes 10-jun)"
```

---

## Task 17: Poblar servicios del MVP

**Files:**
- Create: `src/content/services/escuela-de-verano/index.md` + assets
- Create: `src/content/services/extraescolares/index.md` + assets
- Create: `src/content/services/ludoteca/index.md` + assets

**Step 1: Copiar assets**

```bash
mkdir -p src/content/services/escuela-de-verano
mkdir -p src/content/services/extraescolares
mkdir -p src/content/services/ludoteca

cp "_source-archive/Escuela de verano 25-26/Escuela de verano cartel.jpeg" "src/content/services/escuela-de-verano/cartel.jpeg"
cp "_source-archive/Escuela de verano 25-26/Escuela de verano instrucciones pago.jpeg" "src/content/services/escuela-de-verano/instrucciones-pago.jpeg"
cp "_source-archive/Escuela de verano 25-26/FICHA ESCUELA DE VERANO COLEGIO JESÚS MARÍA.pdf" "src/content/services/escuela-de-verano/ficha.pdf"

cp "_source-archive/Extraescolares 26-27/Extraescolares cartel.jpeg" "src/content/services/extraescolares/cartel.jpeg"

cp "_source-archive/Ludoteca 26-27/Formulario de Inscripción LUDOTECA.pdf" "src/content/services/ludoteca/formulario-inscripcion.pdf"
```

**Step 2: Crear `src/content/services/escuela-de-verano/index.md`**

```markdown
---
title: Escuela de verano
season: Verano 2026
shortDescription: Apunta a los peques durante los meses de verano. Inscripción abierta.
heroImage: ./cartel.jpeg
heroImageAlt: Cartel de la escuela de verano del AMPA.
formUrl: https://forms.google.com/CAMBIAR-CUANDO-ESTE-DISPONIBLE
documents:
  - { label: "Ficha de inscripción", file: "/servicios/escuela-de-verano/ficha.pdf" }
  - { label: "Instrucciones de pago", file: "/servicios/escuela-de-verano/instrucciones-pago.jpeg" }
order: 1
---

La escuela de verano es un servicio del AMPA para que las familias podamos conciliar durante las semanas de junio y julio en las que el cole cierra.

## Qué se hace

Actividades temáticas, juegos, talleres, salidas y mucha agua. El equipo de monitores se encarga de organizar el día a día para que los peques disfruten y aprendan.

## Cómo apuntarse

1. Rellena el formulario online.
2. Descarga la ficha y entrégala firmada según las instrucciones.
3. Sigue las instrucciones de pago.

Para cualquier duda escríbenos a [ampacolegiojesusmaria@gmail.com](mailto:ampacolegiojesusmaria@gmail.com).
```

> **Nota para Victor:** sustituye la URL del `formUrl` por la real cuando esté disponible. Hasta entonces, conserva el botón "Apuntarse" pero apunta a un Google Form de prueba o cambia `formUrl` por nada y la página mostrará el placeholder "Próximamente disponible la inscripción".

**Step 3: Crear `src/content/services/extraescolares/index.md`**

```markdown
---
title: Extraescolares
season: Curso 26-27
shortDescription: Actividades por la tarde durante el curso escolar para los peques del cole.
heroImage: ./cartel.jpeg
heroImageAlt: Cartel de las actividades extraescolares del AMPA para el curso 26-27.
formUrl: https://forms.google.com/CAMBIAR-CUANDO-ESTE-DISPONIBLE
order: 2
---

Las actividades extraescolares se desarrollan después del horario lectivo. La oferta varía cada curso en función de la demanda y de los monitores disponibles.

## Cómo apuntarse

Rellena el formulario online. Si la actividad alcanza el mínimo de inscripciones, el AMPA confirma plazas y comunica fechas de inicio.

Para cualquier duda escríbenos a [ampacolegiojesusmaria@gmail.com](mailto:ampacolegiojesusmaria@gmail.com).
```

**Step 4: Crear `src/content/services/ludoteca/index.md`**

```markdown
---
title: Ludoteca
season: Curso 26-27
shortDescription: Espacio de mañana antes del horario escolar.
formPdf: /servicios/ludoteca/formulario-inscripcion.pdf
order: 3
---

La ludoteca es el servicio del AMPA para las familias que necesitan dejar a los peques en el cole antes de que comience el horario lectivo.

## Horario

Las plazas son limitadas y se cubren por orden de inscripción.

## Cómo apuntarse

1. Descarga el formulario de inscripción.
2. Rellénalo y entrégalo en el AMPA o por email.
3. Recibirás confirmación de plaza por escrito.

Para cualquier duda escríbenos a [ampacolegiojesusmaria@gmail.com](mailto:ampacolegiojesusmaria@gmail.com).
```

**Step 5: Verificar que los archivos descargables son accesibles**

Astro sirve archivos en `src/content/<collection>/<entry>/<file>` con rutas como `/servicios/<slug>/<file>`. **IMPORTANTE:** Astro no copia automáticamente PDFs e imágenes de las colecciones a `dist/` a menos que se referencien como `image()` en el frontmatter o se importen explícitamente.

**Solución:** mover los PDFs e imágenes descargables a `public/servicios/<slug>/` para que sean servidos como estáticos sin procesamiento:

```bash
mkdir -p public/servicios/escuela-de-verano public/servicios/ludoteca
mv src/content/services/escuela-de-verano/ficha.pdf public/servicios/escuela-de-verano/ficha.pdf
mv src/content/services/escuela-de-verano/instrucciones-pago.jpeg public/servicios/escuela-de-verano/instrucciones-pago.jpeg
mv src/content/services/ludoteca/formulario-inscripcion.pdf public/servicios/ludoteca/formulario-inscripcion.pdf
```

(El cartel de escuela de verano y extraescolares se queda en `src/content/services/<slug>/cartel.jpeg` porque se usa como `heroImage` con Astro `image()`.)

**Step 6: Verificar build**

Run: `npm run build`
Expected: build OK. Inspeccionar `dist/`:
- `dist/servicios/escuela-de-verano/index.html`
- `dist/servicios/escuela-de-verano/ficha.pdf` (servido desde `public/`)
- `dist/servicios/ludoteca/index.html`
- `dist/servicios/ludoteca/formulario-inscripcion.pdf`

**Step 7: Verificar visualmente**

Run: `npm run dev`
- `/servicios/` lista los 3.
- `/servicios/escuela-de-verano/` muestra cartel, contenido, botón "Apuntarse" (formUrl) y 2 documentos descargables.
- `/servicios/ludoteca/` muestra placeholder de imagen, contenido y botón "Descargar formulario".

**Step 8: Commit**

```bash
git add src/content/services/ public/servicios/
git commit -m "content: servicios MVP (escuela de verano, extraescolares, ludoteca)"
```

---

## Task 18: Poblar páginas estáticas — Hazte socio, Contacto, Aviso legal

**Files:**
- Modify: `src/pages/hazte-socio.astro`
- Modify: `src/pages/contacto.astro`
- Modify: `src/pages/aviso-legal.astro`
- Create: `public/hazte-socio/cartel.jpeg`

**Step 1: Mover el cartel "Hazte socio" a `public/`**

```bash
mkdir -p public/hazte-socio
cp "_source-archive/Hazte socio.jpeg" "public/hazte-socio/cartel.jpeg"
```

**Step 2: Reescribir `src/pages/hazte-socio.astro`**

```astro
---
import PageContent from '../components/PageContent.astro';
import Button from '../components/Button.astro';
import IconExternal from '../components/icons/IconExternal.astro';

const formUrl = 'https://forms.google.com/CAMBIAR-CUANDO-ESTE-DISPONIBLE';
---
<PageContent
  title="Hazte socio · AMPA Arco de la Alameda"
  description="Únete al AMPA Arco de la Alameda del CEIP Jesús María de Jaén y forma parte de la comunidad."
  pageTitle="Hazte socio"
>
  <p class="intro">El AMPA Arco de la Alameda existe gracias a las familias que se asocian cada curso. Cuanta más gente forme parte, más cosas podemos hacer por los peques y por el cole.</p>

  <h2>¿Qué hacemos con tu cuota?</h2>
  <ul>
    <li>Organizamos la <strong>fiesta de fin de curso</strong> y otras actividades comunitarias.</li>
    <li>Apoyamos los proyectos del cole como <strong>ecoescuela</strong>.</li>
    <li>Subvencionamos parte de actividades extraescolares y materiales.</li>
    <li>Coordinamos servicios como la <strong>ludoteca</strong> y la <strong>escuela de verano</strong>.</li>
    <li>Representamos al AMPA en la <strong>FAMPA Los Olivos</strong> y en el Consejo Escolar.</li>
  </ul>

  <h2>Cómo asociarse</h2>
  <p>Rellena el formulario online y sigue las instrucciones de pago de la cuota anual.</p>

  <p>
    <Button href={formUrl} external>
      Quiero asociarme <IconExternal />
    </Button>
  </p>

  <h2>Más información</h2>
  <p>Para cualquier duda sobre la asociación escríbenos a <a href="mailto:ampacolegiojesusmaria@gmail.com">ampacolegiojesusmaria@gmail.com</a>.</p>

  <figure class="poster">
    <img src="/hazte-socio/cartel.jpeg" alt="Cartel del AMPA Arco de la Alameda invitando a hacerse socio." width="600" height="800" />
  </figure>
</PageContent>

<style>
  .intro { font-size: 1.1rem; color: var(--ink); }
  .poster { margin-top: var(--space-7); border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; max-width: 480px; }
  .poster img { width: 100%; height: auto; display: block; }
</style>
```

> **Nota:** sustituye `formUrl` por la URL real del formulario cuando esté lista.

**Step 3: Reescribir `src/pages/contacto.astro`**

```astro
---
import PageContent from '../components/PageContent.astro';
---
<PageContent
  title="Contacto · AMPA Arco de la Alameda"
  description="Datos de contacto del AMPA Arco de la Alameda en Jaén."
  pageTitle="Contacto"
>
  <p>Si quieres ponerte en contacto con el AMPA, escríbenos un email o pasa por el cole.</p>

  <h2>Email</h2>
  <p><a href="mailto:ampacolegiojesusmaria@gmail.com">ampacolegiojesusmaria@gmail.com</a></p>

  <h2>Dirección</h2>
  <address>
    AMPA Arco de la Alameda<br />
    CEIP Jesús María<br />
    Alameda de Adolfo Suárez, 1<br />
    23003 Jaén
  </address>

  <p>
    <a
      href="https://www.google.com/maps/search/?api=1&query=CEIP+Jes%C3%BAs+Mar%C3%ADa+Ja%C3%A9n"
      rel="noopener"
      target="_blank"
    >Ver en Google Maps ↗</a>
  </p>

  <h2>Redes sociales</h2>
  <ul>
    <li><a href="https://www.instagram.com/ampa_arco_de_la_alameda/" rel="noopener" target="_blank">Instagram</a></li>
    <li><a href="https://www.facebook.com/ampa.jesusmariajaen/?locale=es_LA" rel="noopener" target="_blank">Facebook</a></li>
  </ul>
</PageContent>

<style>
  address { font-style: normal; line-height: 1.6; }
</style>
```

**Step 4: Reescribir `src/pages/aviso-legal.astro`**

```astro
---
import PageContent from '../components/PageContent.astro';
---
<PageContent
  title="Aviso legal y privacidad · AMPA Arco de la Alameda"
  description="Aviso legal y política de privacidad de la web del AMPA Arco de la Alameda."
  pageTitle="Aviso legal y privacidad"
>
  <h2>Titularidad</h2>
  <p>Este sitio web es titularidad del <strong>AMPA Arco de la Alameda</strong>, asociación de madres y padres del CEIP Jesús María de Jaén.</p>

  <h2>Contacto</h2>
  <p>
    Email: <a href="mailto:ampacolegiojesusmaria@gmail.com">ampacolegiojesusmaria@gmail.com</a><br />
    Dirección: Alameda de Adolfo Suárez, 1 — 23003 Jaén
  </p>

  <h2>Finalidad de la web</h2>
  <p>Esta web es informativa y sin ánimo de lucro. Sirve para difundir las actividades, servicios y comunicaciones del AMPA Arco de la Alameda entre las familias del CEIP Jesús María.</p>

  <h2>Privacidad y cookies</h2>
  <p>Esta web <strong>no utiliza cookies de tracking ni de terceros</strong>, <strong>no recopila datos personales</strong> de las visitas y <strong>no usa herramientas de analítica</strong>.</p>
  <p>Los formularios de inscripción a actividades del AMPA están alojados en Google Forms y se acceden mediante enlace externo (se abren en una nueva pestaña). El tratamiento de los datos enviados a través de esos formularios se rige por las condiciones del servicio de Google y por el uso interno del AMPA exclusivamente para gestionar las inscripciones.</p>

  <h2>Enlaces externos</h2>
  <p>Esta web contiene enlaces a sitios externos (Google Forms, Instagram, Facebook, FAMPA Los Olivos, etc.). El AMPA no se responsabiliza del contenido ni de la política de privacidad de esos sitios.</p>

  <h2>Propiedad intelectual</h2>
  <p>Los textos, imágenes y materiales propios publicados en esta web pertenecen al AMPA Arco de la Alameda o a sus autores correspondientes. Los logotipos del CEIP Jesús María y de la FAMPA Los Olivos se utilizan con su consentimiento.</p>

  <h2>Modificaciones</h2>
  <p>El AMPA se reserva el derecho a modificar este aviso legal en cualquier momento. La versión vigente es la publicada en esta página.</p>
</PageContent>
```

**Step 5: Verificar build**

Run: `npm run build`
Expected: OK.

**Step 6: Verificar visualmente las 3 páginas**

Run: `npm run dev`
- `/hazte-socio/` con cartel y botón externo.
- `/contacto/` con email, dirección y link a Google Maps.
- `/aviso-legal/` con todas las secciones.

**Step 7: Commit**

```bash
git add src/pages/hazte-socio.astro src/pages/contacto.astro src/pages/aviso-legal.astro public/hazte-socio/
git commit -m "content: páginas hazte-socio, contacto y aviso legal"
```

---

## Task 19: Sitemap, favicons y OG image por defecto

**Files:**
- Create: `public/favicon.ico`
- Create: `public/favicon-32.png`
- Create: `public/apple-touch-icon.png`
- Create: `public/og-default.jpg`

**Step 1: Generar favicons a partir del logo del AMPA**

Usando herramientas locales: convertir `_source-archive/logo AMPA.jpeg` a los tamaños necesarios.

Si tienes ImageMagick:

```bash
mkdir -p public
convert "_source-archive/logo AMPA.jpeg" -resize 32x32 public/favicon-32.png
convert "_source-archive/logo AMPA.jpeg" -resize 180x180 public/apple-touch-icon.png
convert "_source-archive/logo AMPA.jpeg" -resize 32x32 -define icon:auto-resize=16,32,48 public/favicon.ico
```

Si no tienes ImageMagick, alternativa con `sips` (macOS nativo):

```bash
sips -z 32 32 "_source-archive/logo AMPA.jpeg" --out public/favicon-32.png
sips -z 180 180 "_source-archive/logo AMPA.jpeg" --out public/apple-touch-icon.png
cp public/favicon-32.png public/favicon.ico
```

**Step 2: Crear `public/og-default.jpg`**

Usar el logo del AMPA recortado/compuesto. Alternativa rápida (sips, fondo blanco con padding):

```bash
sips -z 630 1200 -p 630 1200 -s format jpeg --padColor FFFFFF "_source-archive/logo AMPA.jpeg" --out public/og-default.jpg
```

Esto produce una imagen 1200×630 con el logo centrado sobre blanco. Es aceptable como OG image inicial; se puede sustituir más tarde por un diseño custom.

**Step 3: Verificar build y sitemap**

Run: `npm run build`
Expected:
- `dist/sitemap-index.xml` y `dist/sitemap-0.xml` generados.
- `dist/favicon.ico`, `dist/favicon-32.png`, `dist/apple-touch-icon.png`, `dist/og-default.jpg` presentes.

**Step 4: Commit**

```bash
git add public/
git commit -m "feat: favicons, apple-touch-icon y og-image por defecto"
```

---

## Task 20: Configuración de Netlify

**Files:**
- Create: `netlify.toml`

**Step 1: Crear `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "interest-cohort=()"
    Content-Security-Policy = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[redirects]]
  from = "https://www.ampaarcodelaalameda.es/*"
  to = "https://ampaarcodelaalameda.es/:splat"
  status = 301
  force = true
```

**Step 2: Verificar build**

Run: `npm run build`
Expected: OK.

**Step 3: Commit**

```bash
git add netlify.toml
git commit -m "ops: configuración de Netlify (build, headers de seguridad, redirect www→apex)"
```

---

## Task 21: README y documentación interna

**Files:**
- Create: `README.md`

**Step 1: Crear `README.md`**

```markdown
# AMPA Arco de la Alameda — web

Sitio web del AMPA Arco de la Alameda del CEIP Jesús María (Jaén).

## Stack

- [Astro 5](https://astro.build) (sitio estático, sin JS en cliente)
- TypeScript estricto
- CSS variables + scoped styles por componente
- Despliegue: Netlify
- Dominio: `ampaarcodelaalameda.es` (DonDominio)

## Requisitos

- Node.js ≥ 20
- npm ≥ 10

## Desarrollo

\`\`\`bash
npm install
npm run dev          # http://localhost:4321
npm run build        # genera dist/
npm run preview      # previsualiza dist/ localmente
npm run astro sync   # regenera tipos de las content collections
\`\`\`

## Estructura

\`\`\`
src/
├── assets/          # Logos (procesados por Astro)
├── components/      # Componentes reutilizables (.astro)
├── content/         # Markdown + assets de contenido
│   ├── events/      # 1 archivo por evento
│   ├── services/    # 1 archivo por servicio
│   ├── pages/       # Páginas estáticas (no usadas en MVP)
│   └── posts/       # Vacío en MVP, activado en fase 2
├── layouts/         # BaseLayout
├── pages/           # Rutas del sitio
└── styles/          # Design tokens y reset
public/              # Archivos servidos tal cual (PDFs, favicons, og-image)
\`\`\`

## Cómo añadir contenido

### Un nuevo evento

1. Crea `src/content/events/<slug>/index.md` con su frontmatter.
2. Pon el cartel como `src/content/events/<slug>/cartel.jpeg`.
3. \`npm run dev\` y verifica que aparece en `/eventos/`.
4. Si `featured: true` y \`date\` es futura, aparece en portada.

Esquema del frontmatter de un evento:

\`\`\`yaml
---
title: ...
date: 2026-MM-DDTHH:MM:SS+02:00
location: ...
poster: ./cartel.jpeg
posterAlt: Texto descriptivo del cartel.
featured: true   # opcional, default false
shortDescription: ...
---
\`\`\`

### Un nuevo servicio

1. Crea `src/content/services/<slug>/index.md`.
2. Si tienes formulario online, usa \`formUrl\`. Si es PDF descargable, usa \`formPdf\` apuntando a una ruta en \`public/\`.
3. Los PDFs y archivos descargables van en \`public/servicios/<slug>/\` (no en \`src/content/\`).

### Una página estática (Hazte socio, Contacto, etc.)

Edita directamente `src/pages/<archivo>.astro` con el componente `PageContent`.

## Despliegue

- \`main\` → producción en Netlify automática (cada \`git push\`).
- Pull requests → preview en URL única.

## Accesibilidad

- WCAG 2.1 AA como objetivo.
- Sin JS en cliente.
- Sin cookies, sin analítica.
- Verificar con Lighthouse y axe DevTools antes de publicar cambios grandes.

## Documentos del proyecto

- Spec: \`docs/superpowers/specs/2026-06-05-ampa-website-design.md\`
- Plan: \`docs/superpowers/plans/2026-06-05-ampa-website-implementation.md\`
\`\`\`

**Step 2: Verificar build**

Run: `npm run build`
Expected: OK.

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README con stack, estructura y guía de contenido"
```

---

## Task 22: Verificación de accesibilidad

**Files:** sin archivos nuevos. Pasada de Lighthouse y axe DevTools.

**Step 1: Lanzar el preview de producción**

```bash
npm run build && npm run preview
```

Open: `http://localhost:4321`

**Step 2: Ejecutar Lighthouse en las siguientes URLs**

Para cada una, abrir Chrome DevTools → Lighthouse → ejecutar auditoría **Mobile** con todas las categorías:

- `http://localhost:4321/`
- `http://localhost:4321/eventos/`
- `http://localhost:4321/eventos/fiesta-fin-curso-2026/`
- `http://localhost:4321/servicios/`
- `http://localhost:4321/servicios/escuela-de-verano/`
- `http://localhost:4321/servicios/ludoteca/`
- `http://localhost:4321/hazte-socio/`
- `http://localhost:4321/contacto/`
- `http://localhost:4321/aviso-legal/`
- `http://localhost:4321/404`

Expected en cada una:
- Accessibility: **100**
- Best Practices: **100**
- SEO: **≥ 95**
- Performance: **≥ 95**

**Step 3: Ejecutar axe DevTools en las páginas anteriores**

Esperado: 0 issues críticas o serias.

**Step 4: Verificación manual de teclado**

En cada página:
- Tab → primer foco debe ser el skip link.
- Pulsar Enter → salta al `<main>`.
- Tab por header, contenido y footer. Todos los links/botones deben tener outline visible.
- Sin trampas de teclado (foco no se queda atascado).

**Step 5: Verificación de zoom**

Subir el zoom del navegador a 200% en la portada. El contenido debe seguir siendo legible y navegable sin scroll horizontal.

**Step 6: Si hay issues, arreglarlas**

Cualquier issue se arregla en commits separados antes de continuar. Documentar issues complejas como TODOs en el README si quedan pendientes.

**Step 7: Commit (si hubo cambios)**

```bash
git add .
git commit -m "fix(a11y): correcciones tras pasada de Lighthouse y axe"
```

---

## Task 23: Subir a GitHub personal y conectar con Netlify

**Files:** sin archivos nuevos. Operaciones de plataforma.

> **Importante:** Crear el repo en la cuenta personal de GitHub del autor, **no** en la organización Woodsearch.

**Step 1: Crear el repo en GitHub personal**

Opciones:
- En el navegador: ir a `https://github.com/new` (asegúrate de estar como cuenta personal, no en la organización Woodsearch). Nombre sugerido: `ampa-arco-alameda`. Visibilidad: **Public** o **Private** (a elección — `Public` da más facilidades para ser indexado y referenciado, `Private` mantiene control). Sin README, sin .gitignore, sin LICENSE (ya están).
- O con `gh` CLI:

```bash
gh repo create ampa-arco-alameda --public --source=. --remote=origin --description "Web del AMPA Arco de la Alameda — CEIP Jesús María, Jaén"
```

**Step 2: Push del repo local**

```bash
git remote -v   # confirmar que origin apunta a la cuenta personal
git push -u origin main
```

**Step 3: Conectar Netlify al repo**

En el navegador:
1. Login en Netlify → "Add new site" → "Import an existing project" → GitHub.
2. Autorizar Netlify a leer la cuenta personal (no la organización).
3. Seleccionar el repo `ampa-arco-alameda`.
4. Branch to deploy: `main`. Build command: `npm run build`. Publish directory: `dist`. (Netlify detecta `netlify.toml`, los settings deberían venir prerrellenados.)
5. Click "Deploy".

Expected: build OK en Netlify, sitio disponible en `<random-name>.netlify.app`.

**Step 4: Verificar el deploy**

Abrir la URL temporal de Netlify y comprobar que todas las páginas y assets cargan correctamente.

**Step 5: Renombrar el subdominio temporal (opcional)**

En Netlify → Site settings → Domain management → cambiar el subdominio a algo legible como `ampa-arco-alameda.netlify.app`.

---

## Task 24: Comprar dominio en DonDominio y configurar

**Files:** sin archivos nuevos. Operaciones de plataforma.

**Step 1: Comprar `ampaarcodelaalameda.es` en DonDominio**

Verificar disponibilidad y comprar a través de [https://www.dondominio.com](https://www.dondominio.com). Coste aproximado ~12 €/año.

**Step 2: Configurar DNS en DonDominio para apuntar a Netlify**

Hay dos opciones:

**Opción A — Usar Netlify DNS (recomendado, más simple):**
1. En Netlify → Site → Domain management → Add custom domain → `ampaarcodelaalameda.es`.
2. Netlify ofrece nameservers (`dns1.p<n>.nsone.net` y similares). Copiar los 4.
3. En DonDominio → panel del dominio → Cambiar servidores DNS → introducir los 4 nameservers de Netlify.
4. Esperar propagación (1-24h).

**Opción B — DNS en DonDominio, A record / CNAME a Netlify:**
1. En Netlify, identificar la IP del load balancer apex (típicamente `75.2.60.5`).
2. En DonDominio crear:
   - A record: `@` → `75.2.60.5`
   - CNAME: `www` → `<subdominio-netlify>.netlify.app`
3. En Netlify añadir el dominio custom `ampaarcodelaalameda.es` y `www.ampaarcodelaalameda.es`.

**Step 3: Verificar emisión de certificado SSL**

En Netlify → Domain management debe aparecer "Your site has HTTPS enabled" en verde. Si tarda más de 1h, click manual en "Verify DNS configuration" y "Provision certificate".

**Step 4: Verificar redirect www → apex**

Abrir `https://www.ampaarcodelaalameda.es` y comprobar que redirige a `https://ampaarcodelaalameda.es`. El redirect lo gestiona `netlify.toml`.

**Step 5: Comprobaciones finales en producción**

- Acceder a `https://ampaarcodelaalameda.es` y navegar por todas las secciones.
- Verificar que los formularios externos abren en pestaña nueva.
- Verificar que los PDFs descargan correctamente.
- Compartir el link en WhatsApp y comprobar que la OG image y descripción se ven correctamente (puede tardar unos minutos por caché de Meta).
- Ejecutar Lighthouse contra la URL pública (no solo local) y validar las métricas.

**Step 6: Sin commit necesario**

Esta tarea es operacional. El dominio queda configurado y el sitio está públicamente disponible.

---

## Self-Review

He revisado el plan contra el spec sección por sección:

- **§1-3 (Resumen / contexto / objetivos):** cubierto implícitamente — todo el plan ejecuta el spec.
- **§4 (Decisiones clave):** Astro vanilla (Task 2), CSS variables (Task 4), Netlify (Task 20), GitHub personal (Task 23), DonDominio (Task 24), JPEGs (Task 6 + 16-18), formularios externos (Task 14 + 17 + 18), sin analítica (no se añade código de tracking en ningún paso), español (Task 5 — `<html lang="es">`), font stack del sistema (Task 4 — `--font-sans`).
- **§5 (Arquitectura):** Task 1 (git) + Task 2 (Astro scaffold) + Task 23 (Netlify).
- **§6 (Modelo de contenido):** Task 7 — schemas para events, services, pages, posts.
- **§7 (Estructura repo):** se construye incrementalmente a lo largo de Tasks 4-15. La estructura final coincide con la del spec.
- **§8 (Rutas):** Task 12 (`/`), Task 13 (`/eventos/`, `/eventos/<slug>/`), Task 14 (`/servicios/`, `/servicios/<slug>/`), Task 15 (`/hazte-socio/`, `/contacto/`, `/aviso-legal/`, `/noticias/`, `/404`).
- **§9 (Composición portada):** Task 11 (componentes) + Task 12 (composición).
- **§10 (Sistema visual):** Task 4 (tokens.css + global.css). Paleta exacta del spec.
- **§11 (Assets):** Task 6 (logos), Task 16-18 (carteles, PDFs en public/), Task 19 (favicons + og).
- **§12 (Despliegue):** Task 20 (netlify.toml), Task 23 (Netlify), Task 24 (dominio).
- **§13 (Accesibilidad):** Task 22 (verificación). Compromisos por defecto cubiertos en Tasks 4-6 (skip-link, focus-visible, html lang, etc).
- **§14 (SEO):** Task 3 (sitemap), Task 5 (meta/OG), Task 13 (JSON-LD Event).
- **§15 (Contenido MVP):** Tasks 16, 17, 18.
- **§16 (Fuera del MVP):** correcto — el plan no implementa nada de la sección.
- **§17 (Riesgos):** mitigaciones contempladas a lo largo del plan.
- **§18 (Definición de listo):** verificado en Task 22 + 24.

**Placeholder scan:** los Markdown de contenido tienen `https://forms.google.com/CAMBIAR-CUANDO-ESTE-DISPONIBLE` como URL provisional explícita — es un valor que el ejecutor debe sustituir manualmente y está marcado como tal con nota. No es un "TBD" del plan.

**Type consistency:** los nombres de campos del esquema Zod (Task 7) se usan literalmente en los componentes (Tasks 10-11) y en los archivos de contenido (Tasks 16-18). Verificado.

Plan listo para ejecutar.

---

## Execution Handoff

Plan completo y guardado en `docs/superpowers/plans/2026-06-05-ampa-website-implementation.md`. Dos opciones de ejecución:

**1. Subagent-Driven (recomendado)** — Despacho un subagent fresco por tarea, reviso entre tareas, iteración rápida.

**2. Inline Execution** — Ejecuto las tareas en esta sesión usando executing-plans, ejecución por lotes con checkpoints de revisión.

¿Qué prefieres?
