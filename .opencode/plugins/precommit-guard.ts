import type { Plugin } from "@opencode-ai/plugin"

/**
 * Plugin mínimo pre-commit (runtime opencode)
 * - Intercepta comandos git commit ejecutados vía tool bash.
 * - Punto de control para validar condiciones antes de commitear.
 */
export default (async () => {
  return {
    "tool.execute.before": async (input: any) => {
      if (input.tool !== "bash") return
      const cmd = String(input.args?.command ?? "")
      if (!cmd.includes("git commit")) return

      // TODO: validar precondiciones (ejemplo)
      // 1) si aplica, exigir que Documentador haya corrido
      // 2) validar formato de commit message
      // 3) bloquear con throw Error("...") si falta algo crítico
    },
  }
}) satisfies Plugin
