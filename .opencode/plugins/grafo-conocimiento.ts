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

      // ── navegar_grafo ────────────────────────────────────────
      navegar_grafo: tool({
        description: "Navega desde un nodo específico de un grafo y devuelve sus conexiones.",
        args: {
          archivo: tool.schema.string().describe("Nombre del archivo .json del grafo (ej: sistemas-cognitivos.json)"),
          nodo_id: tool.schema.string().describe("ID del nodo desde el cual navegar")
        },
        async execute(args, ctx) {
          const raiz = resolverRaiz(ctx)
          const grafo = leerGrafo(raiz, args.archivo)
          if (!grafo) return `Error: no se encontró el grafo "${args.archivo}" en ${GRAFOS_DIR}/`

          const nodo = grafo.nodos?.find((n: any) => n.id === args.nodo_id)
          if (!nodo) return `Error: nodo "${args.nodo_id}" no encontrado en ${args.archivo}`

          const conexiones = grafo.aristas?.filter(
            (a: any) => a.desde === args.nodo_id || a.hacia === args.nodo_id
          ) || []

          const resultado = {
            nodo,
            conexiones_salientes: conexiones.filter((a: any) => a.desde === args.nodo_id),
            conexiones_entrantes: conexiones.filter((a: any) => a.hacia === args.nodo_id)
          }

          return JSON.stringify(resultado, null, 2)
        }
      })

    }
  }
}

export default grafoConocimientoPlugin
