---
name: conocimiento
description: Instrucciones para navegar el sistema de grafos de conocimiento
license: MIT
---

# Sistema de Conocimiento

Este skill explica cómo usar las tools del plugin `grafo-conocimiento` para acceder a conocimiento estructurado en grafos.

## Tools disponibles

### `leer_grafo("archivo.json")`
Carga un grafo completo y devuelve todos sus nodos y aristas.
- Uso: cuando necesitás el conocimiento completo de un dominio
- Ej: `leer_grafo("sistemas-cognitivos.json")`

### `navegar_grafo("archivo.json", "id-del-nodo")`
Parte de un nodo específico y devuelve sus conexiones (entrantes y salientes).
- Uso: cuando ya sabés qué concepto te interesa y querés ver sus relaciones
- Ej: `navegar_grafo("sistemas-cognitivos.json", "graphs")`

## Formato de los grafos

Cada grafo sigue esta estructura:
- `nodos[]`: cada nodo tiene `id`, `tipo`, `descripcion`, y campos opcionales según el dominio
- `aristas[]`: cada arista conecta un nodo `desde` otro `hacia` con un `tipo` de relación

## Reglas de uso (obligatorio)

1. **Consumo interno.** Los grafos son documentación para vos. No le expliques al usuario la estructura de nodos, aristas, conexiones ni ningún detalle interno del grafo. Vos procesalo y usalo para responder mejor.

2. **Bajo demanda.** No cargues un grafo si no lo necesitás. El menú que ves al inicio es solo orientativo. Si el tema que está preguntando el usuario no está en los grafos, no los toques.

3. **Usá la tool justa.** Si solo necesitás un concepto puntual, `navegar_grafo`. Si necesitás el dominio completo, `leer_grafo`.

4. **No le muestres el JSON crudo al usuario.** Lo que devuelven las tools es para que vos lo proceses internamente. Respondé con tu criterio, no con datos en bruto.
