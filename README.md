# AMPA Arco de la Alameda — web

Sitio web del AMPA Arco de la Alameda del CEIP Jesús María (Jaén).

## Stack

- [Astro 6](https://astro.build) (sitio estático, sin JS en cliente)
- TypeScript estricto
- CSS variables + scoped styles por componente
- Despliegue: Netlify
- Dominio: `ampaarcodelaalameda.es` (DonDominio)

## Requisitos

- Node.js ≥ 20
- npm ≥ 10

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # genera dist/
npm run preview      # previsualiza dist/ localmente
npx astro sync       # regenera tipos de las content collections
```

## Estructura

```
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
```

## Cómo añadir contenido

### Un nuevo evento

1. Crea `src/content/events/<slug>/index.md` con su frontmatter.
2. Pon el cartel como `src/content/events/<slug>/cartel.jpeg`.
3. `npm run dev` y verifica que aparece en `/eventos/`.
4. Si `featured: true` y `date` es futura, aparece en portada.

Esquema del frontmatter de un evento:

```yaml
---
title: ...
date: 2026-MM-DDTHH:MM:SS+02:00
location: ...
poster: ./cartel.jpeg
posterAlt: Texto descriptivo del cartel.
featured: true   # opcional, default false
shortDescription: ...
---
```

### Un nuevo servicio

1. Crea `src/content/services/<slug>/index.md`.
2. Si tienes formulario online, usa `formUrl`. Si es PDF descargable, usa `formPdf` apuntando a una ruta en `public/`.
3. Los PDFs y archivos descargables van en `public/servicios/<slug>/` (no en `src/content/`).

### Una página estática (Hazte socio, Contacto, etc.)

Edita directamente `src/pages/<archivo>.astro` con el componente `PageContent`.

## Despliegue

- `main` → producción en Netlify automática (cada `git push`).
- Pull requests → preview en URL única.

## Accesibilidad

- WCAG 2.1 AA como objetivo.
- Sin JS en cliente.
- Sin cookies, sin analítica.
- Verificar con Lighthouse y axe DevTools antes de publicar cambios grandes.
