# Etapa 6: deploy en Vercel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar el planificador en Vercel desde GitHub, verificarlo en producción y documentar el deploy.

**Architecture:** Vercel importa `santicano2/planificador-correlativas`, construye con `npm run build` para ejecutar `prebuild` y copiar el worker de PDF.js, y publica los estáticos de Next.js. No hay backend, variables de entorno ni dominio propio.

**Tech Stack:** Next.js 16.4.3, React 19.3.0, Node.js 24, Vercel, GitHub.

---

### Task 1: Preflight local

**Files:**
- Verify: `package.json`
- Verify: `public/pdf.worker.min.mjs`

- [ ] **Step 1: Confirmar repo limpio y sincronizado**

Run:

```powershell
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: árbol limpio; el hash local coincide con `refs/heads/main` remoto.

- [ ] **Step 2: Verificar checks y build**

Run:

```powershell
npm run check
npm run build
```

Expected: 78 tests pasan y Next.js genera las páginas estáticas.

- [ ] **Step 3: Verificar el worker de PDF.js**

Run:

```powershell
Test-Path public/pdf.worker.min.mjs
```

Expected: `True`.

### Task 2: Crear el proyecto en Vercel

**Files:** ninguno.

- [ ] **Step 1: Importar el repositorio**

En Vercel: **Add New → Project → Import Git Repository → `santicano2/planificador-correlativas`**.

- [ ] **Step 2: Configurar el proyecto**

- Project Name: `planificador-correlativas`.
- Framework Preset: **Next.js**.
- Root Directory: `./`.
- Build Command: `npm run build`.
- Output Directory: dejar el valor automático de Next.js.
- Install Command: dejar `npm install`.
- Environment Variables: ninguna.
- Production Branch: `main`.

- [ ] **Step 3: Deploy**

Presionar **Deploy** y esperar a que el build termine en estado **Ready**.

Expected: URL de producción asignada, probablemente `https://planificador-correlativas.vercel.app`.

### Task 3: Verificar producción

**Files:** ninguno.

- [ ] **Step 1: Verificar endpoints**

Con la URL real asignada por Vercel:

```powershell
$base = "https://planificador-correlativas.vercel.app"
Invoke-WebRequest -Method Head "$base/" | Select-Object StatusCode
Invoke-WebRequest -Method Head "$base/icon.svg" | Select-Object StatusCode
Invoke-WebRequest -Method Head "$base/examples/plan-2014-sistemas.pdf" | Select-Object StatusCode
Invoke-WebRequest -Method Head "$base/pdf.worker.min.mjs" | Select-Object StatusCode
```

Expected: `200` en los cuatro endpoints. Si la URL asignada difiere, usar la URL real en `$base`.

- [ ] **Step 2: Revisar logs**

En Vercel: **Deployments → deployment actual → Build Logs**.

Expected: build exitoso; `prebuild` copia el worker; sin errores de TypeScript.

### Task 4: Smoke test de producción

**Files:** ninguno.

- [ ] **Step 1: Probar el flujo principal en desktop**

En la URL de producción, viewport 1440×1000:

- Abrir la app en incógnito.
- Importar `/examples/plan-2014-sistemas.pdf`.
- Revisar y guardar el plan.
- Verificar tablero, resumen y estados.
- Cambiar una materia a `regularized`.
- Recargar y confirmar persistencia.

Expected: el flujo completa sin errores y el estado persiste en `localStorage`.

- [ ] **Step 2: Probar grafo y edición**

- Abrir la pestaña **Grafo**.
- Seleccionar una materia con clic y con Enter/Espacio.
- Verificar panel de detalle, requisitos y materias que habilita.
- Cambiar el estado desde el panel.
- Cerrar con Escape.
- Abrir **Editar plan**, guardar sin cambios.
- Exportar un respaldo JSON.
- Restaurar el respaldo.

Expected: grafo, panel, edición y respaldo funcionan; sin errores en consola.

- [ ] **Step 3: Probar mobile**

Viewport 390×844:

- Verificar tablero y grafo.
- Confirmar scroll horizontal del grafo.
- Confirmar que el detalle aparece arriba del mapa.

Expected: sin overflow roto ni errores de consola.

### Task 5: Documentar y cerrar

**Files:**
- Modify: `README.md`
- Modify: `docs/DEVELOPMENT.md`

- [ ] **Step 1: Actualizar README**

- Agregar la URL real de producción como **Demo**.
- Cambiar el aviso **En desarrollo** por el estado publicado.
- Marcar `Etapa 6` como completada.

- [ ] **Step 2: Documentar el deploy**

En `docs/DEVELOPMENT.md`, agregar una sección **Deploy en Vercel** con:

- Repo y branch de producción.
- Configuración del proyecto: Next.js, root `.`, build `npm run build`.
- Por qué el build command debe ser `npm run build`: ejecuta `prebuild` y copia `public/pdf.worker.min.mjs`.
- Ausencia de variables de entorno.
- Previews automáticos y deploy en cada push a `main`.
- Rollback desde Vercel.
- Checklist de smoke test.

- [ ] **Step 3: Verificación final**

Run:

```powershell
npm run check
npm run build
git status --short --branch
```

Expected: checks y build pasan; solo quedan los cambios de documentación.

- [ ] **Step 4: Commit y push**

```powershell
git add README.md docs/DEVELOPMENT.md docs/superpowers/plans/2026-10-27-etapa-6-deploy-vercel.md
git commit -m "docs: document Vercel deployment"
git push origin main
```

Expected: Vercel inicia un redeploy automático y termina en **Ready**.

- [ ] **Step 5: Confirmar cierre**

- Abrir la URL final.
- Confirmar que el deployment corresponde al último commit.
- Reportar URL, checks y cualquier limitación.
