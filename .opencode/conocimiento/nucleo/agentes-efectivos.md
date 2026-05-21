# Agentes Efectivos

Guía para diseñar agentes opencode que realmente funcionen.

## Principios

- **Un propósito, un agente.** Cada agente debe resolver un problema específico. Si hace más de una cosa, dividilo.
- **Modo primary solo uno.** Un solo agente primary por proyecto. Los demás son subagentes invocados con Task().
- **Permisos mínimos.** Arrancá restrictivo y abrí permisos solo cuando el agente los necesite. Un agente que solo revisa código no necesita `write` ni `bash`.
- **El .md es el prompt.** Todo lo que el agente necesita saber va en su archivo .md. No confíes en hooks ni en inyecciones dinámicas —el .md es el único canal garantizado en cada iteración.

## Estructura recomendada

```
.opencode/agents/
  nucleo.md            ← primary, orquesta todo
  investigador.md      ← subagente, solo lee
  maestro-git.md       ← subagente, solo git
  documentador.md      ← subagente, solo escribe docs
```

## Anti-patrones

- **Hooks para inyectar instrucciones.** El hook `experimental.chat.system.transform` tiene un bug conocido (#17100) que descarta las mutaciones. No confíes en él.
- **Skills que duplican el .md.** Si la información ya está en `nucleo.md`, no crees un skill aparte. Un solo lugar de verdad.
- **Tools que hacen lo mismo.** Si una tool nativa (read, glob) ya resuelve el problema, no crees una tool custom al pedo.
