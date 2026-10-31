# Stella Labs

> ⚠️ **Estado del proyecto:** este proyecto **aún está en desarrollo activo**.  
> Algunas funcionalidades, vistas y contenidos pueden cambiar sin previo aviso.

## Descripción

**Stella Labs** es una aplicación web desarrollada con **Astro** y **Tailwind CSS**, integrada con **Supabase** para backend (base de datos, auth y servicios) y preparada para despliegue en **Cloudflare**.

El objetivo es mantener una base moderna, rápida y escalable para continuar iterando funcionalidades de forma segura.

## Stack tecnológico

- **Astro** — framework principal del frontend.
- **Tailwind CSS** — sistema de estilos utility-first.
- **Supabase** — backend como servicio (DB/Auth/API/Storage).
- **Cloudflare** — infraestructura de despliegue y edge delivery.
- **Node.js + npm** — entorno de desarrollo y gestión de dependencias.

## Estructura del proyecto

Estructura base esperada del proyecto:

- `src/pages/` → rutas y páginas Astro
- `src/components/` → componentes reutilizables
- `src/layouts/` → layouts base
- `src/content/` → contenido estructurado (si aplica)
- `public/` → archivos estáticos
- `astro.config.*` → configuración de Astro
- `tailwind.config.*` / `postcss.config.*` → configuración de estilos
- `package.json` → scripts y dependencias

## Requisitos previos

- **Node.js** LTS
- **npm**
- Cuenta/proyecto de **Supabase**
- Cuenta/proyecto de **Cloudflare** (Workers)

## Instalación

1. Clonar repositorio:
   ```bash
   git clone https://github.com/alessgii/stella-labs.git
   cd stella-labs
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno (`.env`):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## Desarrollo local

Este proyecto usa servidor Astro en segundo plano:

```bash
astro dev --background
```

Comandos de control:

```bash
astro dev status
astro dev logs
astro dev stop
```

## Scripts comunes

```bash
npm run dev
npm run build
npm run preview
```

> Para trabajo diario del equipo, priorizar `astro dev --background` y sus comandos de gestión.

## Build y despliegue

1. Build de producción:
   ```bash
   npm run build
   ```

2. Previsualización local:
   ```bash
   npm run preview
   ```

3. Despliegue en Cloudflare Workers.

## Integraciones principales

### Supabase
- Autenticación de usuarios.
- Persistencia de datos.

### Cloudflare
- Hosting y distribución edge.
- Integración con Workers.
- Optimización de rendimiento y disponibilidad global.

## Estado funcional actual

- ✅ Base Astro inicializada
- ✅ Tailwind CSS integrado
- ✅ Integración backend con Supabase en progreso/activa
- ✅ Flujo de despliegue orientado a Cloudflare
- 🚧 Funcionalidades y contenido aún en construcción

## Roadmap

- [ ] Completar vistas y flujos principales
- [ ] Consolidar integraciones Supabase (auth/data/storage)
- [ ] Ajustar despliegue y variables por entorno en Cloudflare
- [ ] Mejorar accesibilidad, SEO y rendimiento final
- [ ] Añadir pruebas y validaciones adicionales

## Convenciones de trabajo

- Ramas por tarea: `feature/...`, `fix/...`, `chore/...`
- Commits atómicos y descriptivos
- Pull Requests con contexto técnico
- Validación local antes de merge

## Documentación de referencia

- Astro docs: https://docs.astro.build
- Routing/Middleware: https://docs.astro.build/en/guides/routing/
- Astro components: https://docs.astro.build/en/basics/astro-components/
- Framework components: https://docs.astro.build/en/guides/framework-components/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Styling/Tailwind: https://docs.astro.build/en/guides/styling/

---

**Nota:** Stella Labs continúa en fase de desarrollo; la documentación se actualizará conforme avance el proyecto.
