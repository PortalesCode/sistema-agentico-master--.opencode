---
description: Ejecuta mantenimiento idempotente del sistema
agent: nucleo
---
Ejecuta este flujo:

1. Delegar la ejecución al subagente `iniciador-especializado`.
2. El subagente debe validar git/hooks, escanear tecnologías y aplicar mantenimiento idempotente.
3. Mantener salida breve y sin ruido innecesario.
