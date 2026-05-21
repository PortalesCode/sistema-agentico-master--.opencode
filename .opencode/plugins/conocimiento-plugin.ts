import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import * as path from "path"
import * as fs from "fs"

// ─── Config ────────────────────────────────────────────────
const CONOCIMIENTO_DIR = ".opencode/conocimiento"

// ─── Utilidades ─────────────────────────────────────────────
function resolverRaiz(ctx: any): string {
  return path.resolve(ctx.directory || ctx.worktree || process.cwd())
}

function leerArchivo(raiz: string, subcarpeta: string, rutaRelativa: string): string | null {
  const ruta = path.resolve(raiz, CONOCIMIENTO_DIR, subcarpeta, rutaRelativa)

  // Seguridad: evitar path traversal fuera de la subcarpeta
  const resolvedo = path.resolve(ruta)
  const base = path.resolve(raiz, CONOCIMIENTO_DIR, subcarpeta)
  if (!resolvedo.startsWith(base)) {
    return null
  }

  if (!fs.existsSync(resolvedo)) {
    return null
  }

  return fs.readFileSync(resolvedo, "utf-8")
}

function extraerSecciones(contenido: string): { titulo: string; desde: number; hasta: number }[] {
  const lineas = contenido.split("\n")
  const secciones: { titulo: string; desde: number; hasta: number }[] = []
  let actual: { titulo: string; desde: number } | null = null

  for (let i = 0; i < lineas.length; i++) {
    const match = lineas[i].match(/^## (.+)/)
    if (match) {
      if (actual) {
        secciones.push({ ...actual, hasta: i })
      }
      actual = { titulo: match[1].trim(), desde: i }
    }
  }
  if (actual) {
    secciones.push({ ...actual, hasta: lineas.length })
  }

  return secciones
}

function buscarSeccion(contenido: string, seccion: string): string | null {
  const secciones = extraerSecciones(contenido)
  const lineas = contenido.split("\n")

  const matchExacto = secciones.find(
    (s) => s.titulo.toLowerCase() === seccion.toLowerCase()
  )
  if (matchExacto) {
    return lineas.slice(matchExacto.desde, matchExacto.hasta).join("\n")
  }

  // Fallback: match parcial si no encuentra exacto
  const matchParcial = secciones.find(
    (s) => s.titulo.toLowerCase().includes(seccion.toLowerCase()) ||
                seccion.toLowerCase().includes(s.titulo.toLowerCase())
  )
  if (matchParcial) {
    return lineas.slice(matchParcial.desde, matchParcial.hasta).join("\n")
  }

  return null
}

function listarSecciones(contenido: string): string {
  const secciones = extraerSecciones(contenido)
  if (secciones.length === 0) {
    return "El archivo no tiene secciones (##)."
  }
  return secciones.map((s) => `## ${s.titulo}`).join("\n")
}

// ─── Plugin ─────────────────────────────────────────────────
const conocimientoPlugin: Plugin = async () => {

  return {
    tool: {

      nucleo_conocimiento: tool({
        description: "Lee conocimiento. Usá 'tema' para el archivo completo, 'tema/seccion' para una sección específica (##), o 'tema/' para listar secciones disponibles.",
        args: {
          nombre: tool.schema.string().describe("Nombre del conocimiento, opcionalmente con /seccion (ej: trading-estrategias, trading-estrategias/gestion-riesgo, trading-estrategias/)")
        },
        async execute(args, ctx) {
          const raiz = resolverRaiz(ctx)
          const entrada = args.nombre

          // Separar nombre de archivo y sección por la primera /
          const slashIdx = entrada.indexOf("/")
          const nombreArchivo = slashIdx === -1 ? entrada : entrada.substring(0, slashIdx)
          const seccion = slashIdx === -1 ? undefined : entrada.substring(slashIdx + 1)

          // Cargar archivo
          const archivo = nombreArchivo.endsWith(".md") ? nombreArchivo : `${nombreArchivo}.md`
          const contenido = leerArchivo(raiz, "nucleo", archivo)

          if (contenido === null) {
            return `Error: no se encontró "${nombreArchivo}" en conocimientos.`
          }

          // Sin sección → archivo completo (backward compatible)
          if (seccion === undefined) {
            return contenido
          }

          // / solitario → listar secciones
          if (seccion === "") {
            return listarSecciones(contenido)
          }

          // Buscar sección específica
          const resultado = buscarSeccion(contenido, seccion)
          if (resultado === null) {
            const disponibles = listarSecciones(contenido)
            return `Error: no se encontró la sección "${seccion}". Secciones disponibles:\n${disponibles}`
          }

          return resultado
        }
      })

    }
  }
}

export default conocimientoPlugin
