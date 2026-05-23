<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# Beauty Divina Turnos — Guía de Deploy

## PASO 1 — Instalar Node.js
Bajá e instalá desde https://nodejs.org (versión LTS)

---

## PASO 2 — Crear proyecto local

```bash
# Abrir terminal y ejecutar:
cd Desktop
npx create-next-app@14 beauty-divina-turnos --typescript --tailwind --app --no-eslint
cd beauty-divina-turnos
npm install @supabase/supabase-js
```

---

## PASO 3 — Copiar los archivos

Reemplazá estos archivos con los que te generé:

```
src/app/layout.tsx
src/app/globals.css
src/app/page.tsx
src/app/reservar/[slug]/page.tsx
src/app/panel/[slug]/page.tsx
src/lib/supabase.ts
src/lib/utils.ts
src/types/index.ts
```

---

## PASO 4 — Crear base de datos en Supabase

1. Ir a https://supabase.com → crear cuenta gratis
2. New Project → ponerle nombre → crear
3. Ir a SQL Editor → pegar TODO el contenido de `supabase/schema.sql` → Run
4. Verificar que aparezcan las tablas en Table Editor

---

## PASO 5 — Variables de entorno

1. En Supabase ir a Settings → API
2. Copiar **Project URL** y **anon public key**
3. Crear archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## PASO 6 — Probar local

```bash
npm run dev
# Abrir http://localhost:3000
```

- Reservas: http://localhost:3000/reservar/beauty-divina
- Panel:    http://localhost:3000/panel/beauty-divina  (PIN: 1234)

---

## PASO 7 — Subir a GitHub

1. Crear cuenta en https://github.com
2. New repository → nombre: beauty-divina-turnos → Create
3. En terminal:

```bash
git init
git add .
git commit -m "Beauty Divina Turnos v1"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/beauty-divina-turnos.git
git push -u origin main
```

---

## PASO 8 — Deploy en Vercel (GRATIS)

1. Ir a https://vercel.com → crear cuenta con GitHub
2. New Project → importar repo beauty-divina-turnos
3. En **Environment Variables** agregar las 2 variables del paso 5
4. Deploy → esperar 2 minutos

✅ Listo. Te dan una URL tipo:
- `https://beauty-divina-turnos.vercel.app/reservar/beauty-divina`
- `https://beauty-divina-turnos.vercel.app/panel/beauty-divina`

---

## PASO 9 — Agregar cliente nuevo

Para cada cliente nueva que vendas, en Supabase SQL Editor ejecutar:

```sql
-- 1. Crear negocio
INSERT INTO businesses (slug, name, description, phone, address, accent_color, panel_pin)
VALUES ('nombre-salon', 'Nombre del Salón', 'Descripción', '5491100000000', 'Dirección', '#ff6eb4', '5678');

-- 2. Ver el ID generado
SELECT id, slug FROM businesses WHERE slug = 'nombre-salon';

-- 3. Agregar profesional (reemplazar BIZ_ID)
INSERT INTO professionals (business_id, name, initials, specialty)
VALUES ('BIZ_ID', 'Nombre Prof', 'NP', 'Especialidad');

-- 4. Agregar servicios
INSERT INTO services (business_id, name, duration_minutes, price, category)
VALUES ('BIZ_ID', 'Nombre Servicio', 60, 3500, 'Categoría');
```

Sus links serán:
- Clientas: `tudominio.vercel.app/reservar/nombre-salon`
- Panel:    `tudominio.vercel.app/panel/nombre-salon`

---

## Dominio propio (opcional)

Comprar en https://nic.ar (~$2000 ARS/año)
Conectar en Vercel → Settings → Domains → agregar dominio

Ejemplo final: `beautydivina.com.ar/reservar/mi-estetica`
>>>>>>> 7a73ebe429bae40a7224901cd2c1cba3c0d95f79
