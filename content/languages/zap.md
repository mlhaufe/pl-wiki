---
title: "Zap"
name: "Zap"
homepage: "https://github.com/dockyard/zap"
author: "Brian Cardarella (DockYard)"
kind: "language"
status: "experimental"
year: 2025
paradigms:
  - "concurrent"
  - "functional"
typing: "static"
type_system:
  - "inferred"
memory:
  - "arc"
  - "arena"
execution:
  - "native"
concurrency:
  - "actors"
  - "isolation"
features:
  - "macros"
  - "pattern-matching"
influences:
  - "Elixir"
  - "Erlang"
  - "Zig"
relations:
  - name: "Elixir"
    kind: "influenced-by"
  - name: "Erlang"
    kind: "implemented-in"
  - name: "Zig"
    kind: "implemented-in"
note: "Early-stage functional language compiling to native code through Zig's ZIR pipeline; struct-centered organization, protocols, compile-time macros, and an optional BEAM-style concurrency runtime"
---
