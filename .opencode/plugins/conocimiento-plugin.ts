import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import * as path from "path"
import * as fs from "fs"

// ─── Config ────────────────────────────────────────────────
const CONOCIMIENTO_DIR = ".opencode/conocimiento"

// ─── Utilidades ─────────────────────────────────────────────
function resolverRaiz(ctxOrWorktree: any): string {
  if (typeof ctxOrWorktree === "string") return path.resolve(ctxOrWorktree)
  return path.resolve(ctxOrWorktree.directory || ctxOrWorktree.worktree || process.cwd())
}

// ─── Plugin (solo tools, sin hooks) ─────────────────────────
const conocimientoPlugin: Plugin = async () => {

  return {
    tool: {

      leer_conocimiento: tool({
        description: "Lee un archivo de conocimiento de .opencode/conocimiento/ y devuelve su contenido.",
        args: {
          archivo: tool.schema.string().describe("Nombre del archivo .md (ej: trading.md)")
        },
        async execute(args, ctx) {
          const raiz = resolverRaiz(ctx)
          const ruta = path.resolve(raiz, CONOCIMIENTO_DIR, args.archivo)

          // Seguridad: evitar path traversal fuera de conocimiento/
          const resolvedo = path.resolve(ruta)
          if (!resolvedo.startsWith(path.resolve(raiz, CONOCIMIENTO_DIR))) {
            return `Error: acceso denegado. Solo se puede leer archivos dentro de ${CONOCIMIENTO_DIR}/`
          }

          if (!fs.existsSync(resolvedo)) {
            return `Error: no se encontró "${args.archivo}" en ${CONOCIMIENTO_DIR}/`
          }

          return fs.readFileSync(resolvedo, "utf-8")
        }
      })

    }
  }
}

export default conocimientoPlugin
