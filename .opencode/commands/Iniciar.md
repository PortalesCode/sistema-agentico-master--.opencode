---
description: Diagnostica entorno, configura git/hooks y escanea tecnologías
agent: nucleo
---
Ejecuta este flujo:

1. Delegar la ejecución al subagente `iniciador-especializado`.
2. El subagente diagnostica git, identidad, hooks y escanea tecnologías.
3. Si es necesario, pregunta decisiones (inicializar git, configurar identidad).
4. Si detecta tecnologías nuevas, sugiere ejecutar /mantenimiento.
5. Mantener salida breve y sin ruido innecesario.
