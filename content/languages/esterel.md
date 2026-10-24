---
title: "Esterel"
name: "Esterel"
homepage: "http://www-sop.inria.fr/meije/esterel/esterel-eng.html"
author: "Gérard Berry et al. (École des Mines de Paris & INRIA)"
paradigms:
  - "imperative"
  - "synchronous"
  - "reactive"
influenced:
  - "SyncCharts"
  - "Blech"
urls:
  - "https://en.wikipedia.org/wiki/Esterel"
  - "http://www1.cs.columbia.edu/~sedwards/cec/"
  - "https://docs.racket-lang.org/esterel/"
note: "Synchronous imperative language for reactive systems; replaces physical time with deterministic logical instants. Commercialized as Esterel Studio and commercialized as part of the SCADE lineage for safety-critical avionics; compiles to C or RTL (VHDL/Verilog)"
---

Esterel is a synchronous programming language for the development of complex reactive systems, developed from the early 1980s at École des Mines de Paris and INRIA (France) by a team led by Gérard Berry (Berry, Rigault, Marmorat, Gonthier per Eich's tweet — Berry as lead designer).

It replaces physical time with a "multiform notion of time": a program is a totally ordered sequence of logical instants (ticks), and computation within a tick is assumed instantaneous — the same abstraction as digital circuits. This makes concurrency deterministic (no interleaving races) and programs amenable to formal verification and certified code generation.

Programs communicate only through broadcast signals that are either present or absent in each instant, with instantaneous semantics within the same cycle. Preemption constructs (`suspend`, `await`, `every`) are first-class, suiting control-dominated designs. Compilers generate C code or RTL hardware descriptions (VHDL/Verilog).

It was commercialized as Esterel Studio (Esterel Technologies, later Synfora); an IEEE standardization attempt (P1778) was dissolved in 2011, and its lineage lives on in the SCADE suite for safety-critical avionics and embedded control. A provisional version has also been implemented in Racket, and the open-source Columbia Esterel Compiler exists.