import type { Plugin } from "@opencode-ai/plugin"
import { appendFile, mkdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

// Plugin post-commit interno para commits realizados dentro de opencode.

const execFileAsync = promisify(execFile)

function isGitCommitCommand(command: string): boolean {
  return /\bgit\b[\s\S]*\bcommit\b/.test(command)
}

function isSuccessfulExecution(output: any): boolean {
  if (!output) return false
  if (typeof output.ok === "boolean") return output.ok
  if (typeof output.success === "boolean") return output.success

  const exitCode =
    output?.metadata?.exit ??
    output?.metadata?.status ??
    output.exitCode ??
    output.code ??
    output.status
  if (typeof exitCode === "number") return exitCode === 0

  if (output.error) return false
  return true
}

function graphContainsCommit(graphContent: string, headHash: string): boolean {
  if (!graphContent) return false

  try {
    const parsed = JSON.parse(graphContent) as {
      commits?: Array<{ hash?: string }>
    }

    if (Array.isArray(parsed.commits)) {
      return parsed.commits.some((entry) => entry?.hash === headHash)
    }
  } catch {
    // fallback a búsqueda textual si el JSON estuviera corrupto
  }

  return graphContent.includes(headHash)
}

async function writeLog(repoDir: string, message: string): Promise<void> {
  const stackDir = join(repoDir, ".opencode", "stack")
  const logPath = join(stackDir, "postcommit.log")
  await mkdir(stackDir, { recursive: true })
  await appendFile(logPath, `[plugin-postcommit] ${message}\n`, "utf8")
}

export default (async ({ directory }) => {
  return {
    "tool.execute.after": async (input: any, output: any) => {
      try {
        if (input.tool !== "bash") return

        const command = String(input.args?.command ?? "")
        if (!isGitCommitCommand(command)) return
        if (!isSuccessfulExecution(output)) return

        const repoDir = String(directory ?? process.cwd())

        const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: repoDir })
        const headHash = stdout.trim()
        if (!headHash) {
          await writeLog(repoDir, "HEAD no disponible tras commit exitoso")
          return
        }

        const graphPath = join(repoDir, ".opencode", "graph", "GRAPH.json")
        let graphContent = ""
        try {
          graphContent = await readFile(graphPath, "utf8")
        } catch {
          graphContent = ""
        }

        if (graphContainsCommit(graphContent, headHash)) {
          await writeLog(repoDir, `dedupe: commit ${headHash} ya registrado`)
          return
        }

        const prompt = `Procesa el commit ${headHash} y actualiza .opencode/graph/GRAPH.json y .opencode/graph/GRAVITY_STATE.json con hechos verificables.`
        await execFileAsync(
          "opencode",
          ["run", "--agent", "chronicle", "--dir", repoDir, "--format", "json", prompt],
          { cwd: repoDir },
        )

        await writeLog(repoDir, `chronicle ejecutado para ${headHash}`)
      } catch (error) {
        const repoDir = String(directory ?? process.cwd())
        const detail = error instanceof Error ? error.message : String(error)
        try {
          await writeLog(repoDir, `error: ${detail}`)
        } catch {
          // ignorar error de logging para no interrumpir la sesion
        }
        return
      }
    },
  }
}) satisfies Plugin
