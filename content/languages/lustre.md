---
title: "Lustre"
name: "Lustre"
homepage: "https://www-verimag.imag.fr/SYNCHRONE/"
author: "Nicolas Halbwachs et al. (Verimag)"
paradigms:
  - "declarative"
  - "dataflow"
  - "synchronous"
influenced:
  - "SCADE"
  - "Lucid Synchrone"
urls:
  - "https://en.wikipedia.org/wiki/Lustre_(programming_language)"
  - "https://www-verimag.imag.fr/~halbwach/newbook.pdf"
note: "Formally defined synchronous dataflow language for reactive systems developed at Verimag since the early 1980s; core of the SCADE industrial suite used in safety-critical aircraft, helicopter, and nuclear plant control software"
---

Lustre is a formally defined, declarative, synchronous dataflow programming language for programming reactive systems. It began as a research project in the early 1980s at the Verimag laboratory in Grenoble, France (Caspi, Halbwachs, Raymond, Pilaud, Plaice); a formal presentation appeared in the 1991 Proceedings of the IEEE ("The Synchronous Data Flow Programming Language LUSTRE").

A Lustre program is a set of `node` definitions described by equations over infinite flows; equation order is irrelevant (declarative semantics). Temporal operators such as `pre` (previous flow value) and `->` (initial value) express delay, while synchronous, clocked evaluation keeps everything deterministic — the property that makes generated code certifiable for safety-critical domains.

In 1993 it progressed to practical industrial use as the core language of the SCADE environment developed by Esterel Technologies, and it is now used for critical control software in aircraft (Airbus), helicopters (Eurocopter), and nuclear power plants.