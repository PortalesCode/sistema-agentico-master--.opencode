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

function leerArchivo(raiz: string, subcarpeta: string, nombre: string): string {
  // El agente pasa el nombre sin extensión, la tool agrega .md
  const archivo = nombre.endsWith(".md") ? nombre : `${nombre}.md`
  const ruta = path.resolve(raiz, CONOCIMIENTO_DIR, subcarpeta, archivo)

  // Seguridad: evitar path traversal fuera de la subcarpeta
  const resolvedo = path.resolve(ruta)
  const base = path.resolve(raiz, CONOCIMIENTO_DIR, subcarpeta)
  if (!resolvedo.startsWith(base)) {
    return `Error: acceso denegado.`
  }

  if (!fs.existsSync(resolvedo)) {
    return `Error: no se encontró "${nombre}" en conocimientos.`
  }

  return fs.readFileSync(resolvedo, "utf-8")
}

// ─── Plugin ─────────────────────────────────────────────────
const conocimientoPlugin: Plugin = async () => {

  return {
    tool: {

      nucleo_conocimiento: tool({
        description: "Lee un conocimiento de la biblioteca de Núcleo.",
        args: {
          nombre: tool.schema.string().describe("Nombre del conocimiento (ej: agentes-efectivos)")
        },
        async execute(args, ctx) {
          return leerArchivo(resolverRaiz(ctx), "nucleo", args.nombre)
        }
      })

    }
  }
}

export default conocimientoPlugin
