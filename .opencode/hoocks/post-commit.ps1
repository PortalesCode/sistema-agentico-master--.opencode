# Hook post-commit robusto para Windows.
# Entry point único para disparar Chronicle vía opencode run.

param(
  [Parameter(Mandatory = $true)]
  [string]$RepoRoot
)

$ErrorActionPreference = "Stop"

$stackDir = Join-Path $RepoRoot ".opencode\stack"
$lockPath = Join-Path $stackDir ".postcommit.lock"
$logPath = Join-Path $stackDir "postcommit.log"

try {
  if (-not (Test-Path -LiteralPath $stackDir)) {
    New-Item -ItemType Directory -Path $stackDir -Force | Out-Null
  }

  # Anti-recursión simple
  if (Test-Path -LiteralPath $lockPath) {
    exit 0
  }

  New-Item -ItemType File -Path $lockPath -Force | Out-Null

  # Verificar opencode disponible
  $hasOpencode = Get-Command opencode -ErrorAction SilentlyContinue
  if (-not $hasOpencode) {
    "[$(Get-Date -Format o)] opencode no encontrado en PATH." | Out-File -FilePath $logPath -Append -Encoding utf8
    exit 0
  }

  $prompt = "Procesa el último commit (HEAD) y actualiza .opencode/graph/GRAPH.json y .opencode/graph/GRAVITY_STATE.json. No tocar stack, intent ni idea graphs."
  "[$(Get-Date -Format o)] RepoRoot=$RepoRoot" | Out-File -FilePath $logPath -Append -Encoding utf8
  Push-Location -LiteralPath $RepoRoot
  try {
    # Limpiar variables GIT_* heredadas del hook para evitar contexto sucio
    $gitEnvBackup = @{}
    Get-ChildItem Env: | Where-Object { $_.Name -like 'GIT_*' } | ForEach-Object {
      $gitEnvBackup[$_.Name] = $_.Value
      Remove-Item -LiteralPath ("Env:" + $_.Name) -ErrorAction SilentlyContinue
    }

    try {
      & opencode run --agent chronicle --dir $RepoRoot --format json $prompt --print-logs --log-level DEBUG *>> $logPath
    }
    finally {
      foreach ($k in $gitEnvBackup.Keys) {
        Set-Item -LiteralPath ("Env:" + $k) -Value $gitEnvBackup[$k]
      }
    }
  }
  finally {
    Pop-Location
  }
  exit 0
}
catch {
  "[$(Get-Date -Format o)] ERROR post-commit: $($_.Exception.Message)" | Out-File -FilePath $logPath -Append -Encoding utf8
  exit 0
}
finally {
  if (Test-Path -LiteralPath $lockPath) {
    Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
  }
}
