import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import * as path from "path"
import * as fs from "fs"

// ─── Config ────────────────────────────────────────────────
const GRAFOS_DIR = ".opencode/grafos"

// ─── Utilidades ─────────────────────────────────────────────
function resolverRaiz(ctxOrWorktree: any): string {
  if (typeof ctxOrWorktree === "string") return path.resolve(ctxOrWorktree)
  return path.resolve(ctxOrWorktree.directory || ctxOrWorktree.worktree || process.cwd())
}

function leerGrafo(raiz: string, archivo: string): any | null {
  const ruta = path.resolve(raiz, GRAFOS_DIR, archivo)
  if (!fs.existsSync(ruta)) return null
  try {
    return JSON.parse(fs.readFileSync(ruta, "utf-8"))
  } catch {
    return null
  }
}

// ─── Plugin (solo tools, sin hooks) ─────────────────────────
const grafoConocimientoPlugin: Plugin = async () => {

  return {
    tool: {

      // ── leer_grafo ──────────────────────────────────────────
      leer_grafo: tool({
        description: "Lee un archivo de grafo de conocimiento y devuelve sus nodos y aristas.",
        args: {
          archivo: tool.schema.string().describe("Nombre del archivo .json del grafo (ej: sistemas-cognitivos.json)")
        },
        async execute(args, ctx) {
          const raiz = resolverRaiz(ctx)
          const grafo = leerGrafo(raiz, args.archivo)
          if (!grafo) return `Error: no se encontró el grafo "${args.archivo}" en ${GRAFOS_DIR}/`
          return JSON.stringify(grafo, null, 2)
        }
      }),

    }
  }
}

export default grafoConocimientoPlugin
