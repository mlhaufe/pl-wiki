---
title: "Goose"
name: "Goose"
homepage: "https://github.com/aardappel/goose"
author: "Wouter van Oortmerssen"
paradigms:
  - "systems"
  - "imperative"
influences:
  - "C"
  - "Rust"
  - "Lobster"
urls:
  - "https://github.com/aardappel/goose"
  - "https://github.com/aardappel/goose/blob/master/docs/tutorial.md"
  - "https://github.com/aardappel/goose/blob/master/docs/reference.md"
note: "Memory-safe systems language with no heap, GC, or lifetime annotations — every dynamic value lives inline on compiler-assigned data stacks; compiles to a single C file, with claims of out-running C++ and safe Rust in its own benchmark suite"
---

Goose (aardappel/goose) is a memory-safe systems language with no heap allocator, garbage collector, reference counting, or lifetime annotations, by Wouter van Oortmerssen (creator of Lobster), implemented almost entirely with AI (Claude Fable) from his human language design. Its headline idea is a single memory model: a program has the native call stack, static data, and N data stacks the compiler assigns statically (large address-space reservations with bump pointers) — scope exit is the free, and freeing a deeply nested million-element structure is one store.

Safety with zero annotation overhead: every reference/slice has an inferred static root (the variable bounding its target's lifetime), the compiler rejects references that could outlive their owners, and there are no aliasing or exclusivity rules, no `unsafe`, and bounds checking whose provably-redundant checks are removed. Because nothing ever moves, references survive growable-array growth; C-style syntax hides ML-flavored features — whole-program compilation, monomorphized generics, compile-time function values (no closures/funptrs), ADTs with two storage modes (fixed vs. variable-size "variable-mode" enums), narrow typed relative references (`T&<u32>`) that make structures position-independent so "your data is already a file format" (`from_bytes` verifies before it becomes a value), in-place construction guarantees, `return E from f` multi-frame statically-checked returns, and share-nothing threads compiled as separate programs crossing flat values through typed queues.

Goose compiles to one plain C file (runs wherever C does, calls C via `extern fn`; bundled TinyCC backend runs programs in-process with no build step, other backends target MSVC/clang/gcc). The author's benchmark suite claims ~3.3× idiomatic C++, ~1.1–1.3× hand-optimized C++ and safe Rust, at 25–50% less memory — losses included and documented. Apache-2.0; prebuilt releases for Windows/Linux/macOS (v2026.3), VS Code extension and LSP included. Notable trade-offs: no escaping closures or dynamic dispatch beyond ADT tags, sequential (non-indexable) arrays of variable-size elements, and whole-program compilation only.