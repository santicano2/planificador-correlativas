# Desarrollo

Documentación técnica para correr el proyecto, entender la estructura y contribuir.

## Requisitos

- Node.js 24 LTS (probado con 24.12)
- npm

## Cómo correrlo

```bash
npm install
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | Corre ESLint |
| `npm run typecheck` | Verifica los tipos con `tsc --noEmit` |
| `npm test` | Corre los tests una vez |
| `npm run test:watch` | Corre los tests en modo watch |
| `npm run check` | Ejecuta lint, typecheck y tests |

`dev` y `build` copian automáticamente el worker de PDF.js a `public/pdf.worker.min.mjs` mediante `scripts/copy-pdf-worker.mjs`. El archivo generado está ignorado por Git.

## Stack

- Next.js 16 con App Router
- TypeScript en modo estricto (`strict` + `noUncheckedIndexedAccess`)
- Tailwind CSS 4
- Vitest 5
- `pdfjs-dist` para extraer texto de PDFs en el navegador
- Zod para validar datos persistidos

## Estructura

```text
src/
  app/                     # App Router de Next.js
  components/
    dashboard/             # Tablero, progreso y control de estados
    import/                # Flujo de importación y revisión
  lib/
    study-plan/
      types.ts             # Tipos del dominio
      status.ts            # Jerarquía y resolución de estados
      availability.ts      # Disponibilidad de materias
      progress.ts          # Resumen de progreso
      dashboard.ts         # Modelo del tablero y poda de progreso
      validation.ts        # Validación de planes
      index.ts             # API pública del módulo
    pdf/
      types.ts             # Tipos de extracción y parseo
      extract-text.ts      # Extracción de texto con pdfjs-dist
      parse-plan.ts        # Parser de texto a borrador de plan
      parse-plan.test.ts   # Tests contra un fixture real
      __fixtures__/        # Fragmentos de texto del PDF de ejemplo
    import/
      draft-plan.ts        # Borrador editable y conversión al dominio
    storage/
      study-plan-storage.ts # Persistencia del plan con Zod y localStorage
      study-progress-storage.ts # Persistencia del progreso por materia
      use-study-plan-storage.ts # Hook de React sobre el storage del plan
      use-study-progress-storage.ts # Hook de React sobre el progreso
scripts/
  copy-pdf-worker.mjs      # Copia el worker de PDF.js a public/
public/
  examples/                # PDF de ejemplo para probar el flujo
```

Los tests están colocados junto a cada módulo (`*.test.ts`).

## Modelo de datos

```json
{
  "career": "Licenciatura en Sistemas",
  "university": "Universidad Nacional de Ejemplo",
  "planYear": 2014,
  "subjects": [
    {
      "id": "1",
      "code": "1",
      "name": "Programación de Computadoras",
      "year": 1,
      "term": "annual",
      "requiresRegularized": [],
      "requiresApproved": []
    }
  ]
}
```

- `id`: identificador estable para referencias internas.
- `code`: código de la materia en el plan (opcional).
- `year`: año de la carrera.
- `term`: `"1"`, `"2"` o `"annual"` (opcional).
- `requiresRegularized`: ids que deben estar regulares o aprobados.
- `requiresApproved`: ids que deben estar aprobados con final.

### Estados

| Estado | Significado |
| --- | --- |
| `pending` | Pendiente |
| `in_progress` | Cursando |
| `regularized` | Cursada aprobada, final pendiente |
| `approved` | Final aprobado o materia promocionada |

Jerarquía: `pending < in_progress < regularized < approved`. Una materia regularizada satisface requisitos de cursada; solo una aprobada satisface requisitos de final.

## Lógica de dominio

- `getSubjectAvailability(subject, progress)`: devuelve `available` o `blocked` con los requisitos faltantes.
- `getProgressSummary(plan, progress)`: calcula total, aprobadas, restantes, porcentaje y conteo por estado.
- `buildDashboard(plan, progress)`: arma las filas del tablero con estado, disponibilidad y nombres de correlativas faltantes.
- `pruneProgress(plan, progress)`: conserva solo los estados de materias que siguen existiendo en el plan.
- `validateStudyPlan(plan)`: detecta correlativas inexistentes, ids duplicados y ciclos.

## Tablero de materias

El tablero vive en `src/components/dashboard/` y usa `buildDashboard` para combinar el plan con el progreso. Las materias se agrupan por año y se pueden buscar o filtrar por año, estado y disponibilidad.

Cada fila muestra el estado actual, el cuatrimestre y, cuando corresponde, qué correlativa falta regularizar o aprobar. La disponibilidad es informativa: la app no impide marcar un estado aunque las correlativas no estén cumplidas, porque el usuario puede tener equivalencias o datos que el plan no refleja.

## Importación desde PDF

La extracción se hace en el cliente:

1. El usuario elige o arrastra un PDF.
2. `pdfjs-dist` extrae los fragmentos de texto con sus coordenadas.
3. Los fragmentos se agrupan en filas y columnas.
4. El parser detecta años, materias, régimen de cursada y correlativas.
5. El resultado es un borrador que el usuario revisa y corrige antes de guardar.
6. El plan final se valida con `validateStudyPlan` y se persiste en `localStorage`.

Limitaciones conocidas:

- PDFs escaneados (imágenes) no se pueden leer sin OCR.
- Los formatos de plan varían entre universidades; el parser se ajusta a los casos probados.
- El archivo debe tener texto seleccionable, pesar menos de 15 MB y tener como máximo 40 páginas.
- La revisión manual es parte del flujo, no un caso de error.

### Persistencia

`src/lib/storage/study-plan-storage.ts` guarda el plan con la clave `planificador-correlativas:study-plan:v1`. Al leer, valida la estructura con Zod y devuelve `null` si el dato está corrupto o no existe. `use-study-plan-storage.ts` expone el plan con `useSyncExternalStore`, por lo que el estado se mantiene sincronizado entre pestañas y no hay desajustes de hidratación.

`src/lib/storage/study-progress-storage.ts` guarda el progreso por materia con la clave `planificador-correlativas:study-progress:v1`. Al leer, valida los estados con Zod y devuelve `{}` si el dato es inválido. `use-study-progress-storage.ts` sigue el mismo patrón de `useSyncExternalStore`.

Al guardar un plan nuevo, el progreso se poda con `pruneProgress` para conservar solo las materias que siguen existiendo. Al borrar el plan se borran también el progreso y la vista vuelve al inicio.

## Decisiones técnicas

- **Lógica pura y aislada:** las reglas de negocio no dependen de React, del navegador ni de `localStorage`.
- **Uniones discriminadas:** la disponibilidad se modela como `available | blocked`, así TypeScript obliga a manejar los faltantes solo cuando existen.
- **Sin backend:** la app es estática; los PDFs y los datos quedan en el dispositivo.
- **Extracción local:** PDF.js corre en el navegador con un worker copiado a `public/`; el archivo nunca se sube.
- **La revisión es parte del producto:** el parser propone un borrador y la persona confirma o corrige antes de guardar.
- **Progreso separado del plan:** el plan describe la carrera y el progreso guarda decisiones del usuario; mantenerlos en claves distintas permite reimportar o editar el plan sin mezclar datos.
- **Validación en dos capas:** Zod valida la estructura persistida y la lógica de dominio valida la integridad de las correlativas.
- **Tests primero:** cada regla de negocio nueva se implementa con un test que falla antes.
