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
- Ej: `leer_grafo("sistema-agentico.json")`

### `navegar_grafo("archivo.json", "id-del-nodo")`
Parte de un nodo específico y devuelve sus conexiones (entrantes y salientes).
- Uso: cuando ya sabés qué concepto te interesa y querés ver sus relaciones
- Ej: `navegar_grafo("sistema-agentico.json", "nucleo")`

## Formato de los grafos

Cada grafo sigue esta estructura:
- `nodos[]`: cada nodo tiene `id`, `tipo`, `descripcion`, y campos opcionales según el dominio
- `aristas[]`: cada arista conecta un nodo `desde` otro `hacia` con un `tipo` de relación

## Menú disponible

El plugin inyecta automáticamente el menú de grafos disponibles para tu agente al inicio de la conversación. Si ves algo relevante, usá las tools para explorarlo.

## Reglas
- No cargues un grafo si no lo necesitás. El menú es solo orientativo.
- Usá `navegar_grafo` si solo querés un concepto puntual.
- Usá `leer_grafo` si necesitás el dominio completo.
