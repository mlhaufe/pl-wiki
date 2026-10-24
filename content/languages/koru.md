---
title: "Koru"
name: "Koru"
homepage: "https://www.korulang.org/"
author: "ungedenstad & contributors"
paradigms:
  - "systems"
  - "effect"
  - "continuation"
urls:
  - "https://github.com/korulang/koru"
  - "https://www.korulang.org/blog/introducing-koru"
  - "https://www.korulang.org/playground"
note: "Event continuation/effect language ('The Continuation Language') with phantom-obligation resource tracking, compile-time metaprogramming, no runtime, and three emitters: native via Zig, JavaScript, and C#"
---

Koru is an event continuation/effect language for uncompromising systems programming, billed as "The Continuation Language". Its core abstraction is the `tor` (from the agentive suffix in *actor*, *creator*; renamed from `event` in July 2026): a function-like unit that declares its named exits up front, and every caller must handle each one — no hidden exceptions, and partial handling is a compile error ("outcomes as control flow" vs. Rust's "errors as values").

Its signature safety mechanism is **phantom obligations**: the `!` suffix mints a compile-time obligation (e.g. `string<connected!>`), a `<!state>` parameter discharges it; un-discharged transactions fail to compile, and when exactly one tor can settle a resource, the compiler auto-inserts the discharge — all at zero runtime cost. The same phantom machinery yields taint tracking and units of measure "for free". Impurity is tracked transitively across the call graph, and host code (syscalls, C libraries, FFI) confined to a typed `proc` escape hatch.

Koru has **no runtime** (no VM, GC, or scheduler; a hello-world compiles to a ~4.8 KB static ELF, an HTTP server ships in a 14 KB Docker image) and leans on compile-time specialization: comptime metaprogramming via typed `ProgramAST`/`Source` parameters, a self-hostable compiler pipeline users can override (`std/compiler:coordinate` is `[comptime|abstract]`, "metacircular"), and templates instead of macros. Benchmarks are a prominent theme, e.g. a 35-line prime sieve outrunning hand-tuned Rust entries and the Orisha HTTP stack beating nginx in its own measurements. Pre-release (v0.1.x, npm-installable, MIT); the compiler self-hosts in Zig and emits native code via Zig, plus JavaScript and C# backends, the playground running the full pipeline client-side via WASM. It is AI-first in tooling and development (much of the language and its docs are AI-authored, e.g. via Claude).