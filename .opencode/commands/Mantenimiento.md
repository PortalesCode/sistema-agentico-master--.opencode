---
description: Investiga tecnologías del proyecto, crea y actualiza conocimiento para Núcleo
agent: nucleo
---
Ejecuta este flujo:

1. Delegar la ejecución al subagente `operador-de-mantenimiento`.
2. El subagente debe leer tecnologías detectadas, investigar en web, crear conocimiento estructurado en conocimiento/nucleo/ y registrar en la tabla de nucleo.md.
3. No ejecutar si no hay tecnologías detectadas aún (ejecutar /Iniciar primero).
4. Mantener salida breve y sin ruido innecesario.
