import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import * as path from "path"
import * as fs from "fs"

// ─── Config ────────────────────────────────────────────────
const GRAFOS_DIR = ".opencode/grafos"
const INDICE_FILE = `${GRAFOS_DIR}/indice.json`

interface GrafoEntry {
  nombre: string
  descripcion: string
  archivo: string
  agentes_con_acceso: string[]
}

interface Indice {
  grafos: GrafoEntry[]
  agentes_por_defecto?: string[]
}

// ─── Utilidades ─────────────────────────────────────────────
function resolverRaiz(ctxOrWorktree: any): string {
  if (typeof ctxOrWorktree === "string") return path.resolve(ctxOrWorktree)
  return path.resolve(ctxOrWorktree.directory || ctxOrWorktree.worktree || process.cwd())
}

function leerIndice(raiz: string): Indice | null {
  const ruta = path.resolve(raiz, INDICE_FILE)
  if (!fs.existsSync(ruta)) return null
  try {
    return JSON.parse(fs.readFileSync(ruta, "utf-8"))
  } catch {
    return null
  }
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

function menuParaAgente(indice: Indice, agente: string): string {
  const accesibles = indice.grafos.filter(g =>
    g.agentes_con_acceso.includes(agente)
  )
  if (accesibles.length === 0) return ""

  const lineas = accesibles.map(g =>
    `  • ${g.nombre} → ${g.descripcion}`
  )

  return [
    "",
    "═══ Conocimiento interno ───────────────────────",
    ...lineas,
    "",
    "Asimilalo, no lo exhibas. Respondé como si el conocimiento fuera tuyo.",
    "No menciones el grafo ni su estructura. El usuario solo ve el resultado.",
    'Instrucciones detalladas: skill("conocimiento")',
    "══════════════════════════════════════════════════",
    ""
  ].join("\n")
}

// ─── Plugin ─────────────────────────────────────────────────
const grafoConocimientoPlugin: Plugin = async ({ worktree }) => {
  // Mapa compartido entre hooks: sessionID → nombre del agente
  const agentBySession = new Map<string, string>()

  return {

    // ── Hook 1: Detecta qué agente está activo ────────────
    "experimental.chat.messages.transform": async (_input, output) => {
      const messages = output.messages as any[]
      const lastUserMsg = messages.findLast(m => m.info?.role === "user")
      if (!lastUserMsg?.info?.agent) return
      agentBySession.set(lastUserMsg.info.sessionID, lastUserMsg.info.agent)
    },

    // ── Hook 2: Inyecta menú de conocimiento ──────────────
    "experimental.chat.system.transform": async (input, output) => {
      if (!input.sessionID || !worktree) return

      const agente = agentBySession.get(input.sessionID)
      if (!agente) return

      const indice = leerIndice(resolverRaiz(worktree))
      if (!indice) return

      const menu = menuParaAgente(indice, agente)
      if (!menu) return

      // Mergear en el primer system message (nunca push)
      if (output.system.length > 0) {
        output.system[0] += menu
      } else {
        output.system.push(menu)
      }
    },

    // ── Tools ─────────────────────────────────────────────
    tool: {

      // ── grafo_leer ───────────────────────────────────────
      leer_grafo: tool({
        description: "Lee un archivo de grafo de conocimiento y devuelve sus nodos y aristas.",
        args: {
          archivo: tool.schema.string().describe("Nombre del archivo .json del grafo (ej: trading.json)")
        },
        async execute(args, ctx) {
          const raiz = resolverRaiz(ctx)
          const grafo = leerGrafo(raiz, args.archivo)
          if (!grafo) return `Error: no se encontró el grafo "${args.archivo}" en ${GRAFOS_DIR}/`
          return JSON.stringify(grafo, null, 2)
        }
      }),

      // ── grafo_navegar ─────────────────────────────────────
      navegar_grafo: tool({
        description: "Navega desde un nodo específico de un grafo y devuelve sus conexiones.",
        args: {
          archivo: tool.schema.string().describe("Nombre del archivo .json del grafo (ej: trading.json)"),
          nodo_id: tool.schema.string().describe("ID del nodo desde el cual navegar")
        },
        async execute(args, ctx) {
          const raiz = resolverRaiz(ctx)
          const grafo = leerGrafo(raiz, args.archivo)
          if (!grafo) return `Error: no se encontró el grafo "${args.archivo}" en la ruta ${raiz}\\${GRAFOS_DIR}\\`

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
