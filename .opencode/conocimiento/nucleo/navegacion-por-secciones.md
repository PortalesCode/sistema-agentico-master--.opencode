# Navegación por secciones en el plugin de conocimiento

Guía para usar correctamente la navegación por secciones del plugin.

## Uso básico

`nucleo_conocimiento("tema")` carga el archivo completo.
`nucleo_conocimiento("tema/")` lista las secciones disponibles.
`nucleo_conocimiento("tema/seccion")` carga solo esa sección.

El separador es `/`. Todo lo que está antes de la primera `/` es el nombre del archivo, todo lo que está después es la sección.

## Buscar secciones

La búsqueda hace matching exacto (case insensitive) primero. Si no encuentra, intenta matching parcial: busca si el texto está contenido en algún título de sección.

Ejemplo: si la sección se llama "Gestión de Riesgo", funciona tanto `nucleo_conocimiento("tema/gestion de riesgo")` como `nucleo_conocimiento("tema/gestion")`.

## Índice de secciones

Usando `tema/` (con slash pero sin sección), devuelve solo los headings `##` del archivo. Esto permite explorar la estructura antes de decidir qué cargar, minimizando el costo de tokens.

## Matching parcial

Si no hay un match exacto para la sección, la tool busca cualquier título que contenga el texto (o viceversa). Si hay múltiples matches parciales, solo devuelve el primero encontrado.

## Estructura esperada

Las secciones se definen con `##` (heading nivel 2). Headings nivel 1 (`#`) y nivel 3+ (`###`, `####`) no se consideran secciones navegables. Esto es intencional: los `###` son subsecciones dentro de una `##`, por lo que viajan con su padre.
