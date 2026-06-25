# PMVM / R3SET — alegerezcoach.com

## Proyecto
Sitio de coaching fitness de **Alejandro Gerez**. El dueño no es desarrollador — explicar pasos sin asumir conocimiento técnico.
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, next-intl (`es|en|pt`) → `src/app/[locale]/`. Supabase Auth/DB/RLS. `src/middleware.ts`: auth+i18n. `@/lib/supabase/client` | `server`. `NEXT_PUBLIC_SUPABASE_*`. `npm run dev|build|lint`

## Sitio en vivo
- Producción: https://www.alegerezcoach.com
- Landing page de trabajo: https://www.alegerezcoach.com/es/v4secret
- El `/es` indica el idioma (también `/en` y `/pt`). Vercel publica automáticamente 1-2 min después de un push.

## Archivos clave de la landing page
- **Página principal:** `src/app/[locale]/v4secret/page.tsx`
- **Datos de transformaciones de clientes:** `src/data/transformations.json`
- **Imágenes de clientes:** `public/images/transformations/<NombreCliente>/cambio1.png` y `cambio2.png`
- **Imágenes del coach:** `public/images/ale/`

## Cómo ver cambios localmente
```
npm run dev
```
Abrir en el navegador: http://localhost:3000/es/v4secret

## Cómo publicar cambios
```
git add src/app/[locale]/v4secret/page.tsx
git commit -m "descripción del cambio"
git push
```
Nunca tocar `.env.local` — tiene configuraciones sensibles del sistema.

## Estilo del sitio — NO CAMBIAR
- Fondo: `#0e0e0e`
- Color principal (verde lima): `#c1ed00`
- Color secundario (cyan): `#00e3fd`
- Tipografía en mayúsculas, estilo fitness/deportivo
- Solo tocar contenidos y textos, no el estilo general

## Lo que ya está construido en v4secret
- Navbar con texto "MÉTODO R3SET" en verde lima
- Hero con botón que va a la sección de precios
- Sección "Los tres pilares" (Psicología, Entrenamiento, Nutrición)
- Sección Coach con fotos reales de la transformación de Ale Gerez
- Galería de transformaciones de clientes (carousel)
- Pricing: Plan Base ($44.999/mes) y Mentoría 1 a 1 (precio a consultar)
- FAQ con 8 preguntas
- Contacto: WhatsApp + alegerezcoach@gmail.com
- Footer

## Lo que se puede cambiar
- Textos de cualquier sección
- Precios o características de los planes (en el array hardcodeado dentro de `page.tsx`, sección `#pricing`)
- Preguntas y respuestas del FAQ (en el array dentro de `page.tsx`, sección FAQ)
- Agregar fotos de clientes: subir imágenes a `public/images/transformations/<Nombre>/cambio1.png` y `cambio2.png`, luego agregar entrada en `src/data/transformations.json`

## Para agregar un cliente nuevo a las transformaciones
1. Crear carpeta `public/images/transformations/<NombreCliente>/`
2. Agregar `cambio1.png` (antes) y `cambio2.png` (después)
3. Agregar entrada en `src/data/transformations.json` con el formato existente (nombre, rutas de imagen, testimonial en `es`/`en`/`pt`)

## Approach
Think first. Read before write; concise output, thorough reasoning; edit files, don’t wholesale rewrite; don’t re-read unless changed; no filler; keep it simple; user instructions override this file.
