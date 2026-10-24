---
title: "Fai"
name: "Fai"
homepage: "https://github.com/Krzysztof-Cieslak/fai"
author: "Krzysztof Cieślak"
paradigms:
  - "functional"
  - "effect"
influences:
  - "ML"
  - "F#"
  - "Elm"
  - "Koka"
urls:
  - "https://github.com/Krzysztof-Cieslak/fai"
  - "https://github.com/Krzysztof-Cieslak/fai/blob/main/llms.txt"
note: "Small, strict, pure, statically typed functional language in the ML/F#/Elm family with row-based effects and capabilities (Koka-inspired), executable contracts (example/forall), Perceus-style ref-counting, and an incremental Rust compiler emitting native code via Cranelift; designed for fast edit→check→test loops by humans and AI agents"
---

Fai is a small, strict, pure, statically typed functional language in the ML / F# / Elm family, described as a "programming language for AI age". It takes its surface from the ML tradition and F# in particular: significant indentation, `let` bindings, `match` with exhaustiveness checking, discriminated unions, structural records, F#-style type variables (`'a`), and `|>` pipelines. Every exported value requires an explicit type signature, giving modules a readable interface, while type inference keeps local code concise.

Its type system is built around **visible capabilities and effects** (row-based, inspired by Koka): the clock, randomness, environment, file system, console, and network are explicit capabilities passed as ordinary values from `main`, and a function's effect row appears after `/` in its type — a function type without an effect annotation is pure. Holding a capability is pure; invoking its methods incurs effects.

Contracts are executable: `example` and `forall` declarations are real type-checked code living next to functions (checked by `fai check` / `fai test`, the latter running property tests with shrinking). The compiler is written in Rust (93% of the repo) on a demand-driven [Salsa](https://github.com/salsa-rs/salsa) query engine with definition-level incremental work and a per-workspace daemon; native code comes from Cranelift (AOT for executables, JIT for `fai run`/`test`), and memory management is Perceus-style reference counting with reuse analysis — no manual frees, no tracing collector. Tooling (`fai` CLI, LSP, canonical formatter, `llms.txt` agent guide, versioned JSON diagnostics) centers on tight edit→check→test loops for humans and AI agents. Early release (v0.1.0, MIT), benchmarked against Rust and OCaml.