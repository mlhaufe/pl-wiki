---
title: "JavaScript"
name: "JavaScript"
homepage: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
urls:
  - "https://nodejs.org/"
  - "https://v8.dev/"
  - "https://spidermonkey.dev/"
references:
  - url: "https://tc39.es/ecma262/"
    title: "ECMA-262 (ECMAScript Language Specification) — Ecma TC39 draft"
  - url: "https://ecma-international.org/publications-and-standards/standards/ecma-262/"
    title: "ECMA-262 — Ecma International (17th edition, June 2026)"
  - url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/JavaScript_technologies_overview"
    title: "JavaScript technologies overview — MDN"
  - url: "https://web.archive.org/web/20070916025300/http://wp.netscape.com/newsref/pr/newsrelease67.html"
    title: "Netscape and Sun announce JavaScript (press release, December 4, 1995)"
  - url: "https://web.archive.org/web/20020722222811/http://wp.netscape.com/eng/mozilla/3.0/handbook/javascript/getstart.htm"
    title: "Netscape JavaScript Guide 3.0 — Getting started (Navigator handbook)"
  - url: "https://web.archive.org/web/20080517011912/http://weblogs.mozillazine.org/roadmap/archives/2008/04/popularity.html"
    title: "Brendan Eich: Popularity — Scheme/Self/Java design recollections (2008)"
  - url: "https://brendaneich.github.io/Strange-Loop-2012/"
    title: "The State of JavaScript — Brendan Eich, Strange Loop 2012 (name timeline)"
  - url: "https://v8.dev/blog/trash-talk"
    title: "Trash talk: the Orinoco garbage collector — V8 blog"
logo: "/logos/javascript.jpg"
author: "Brendan Eich (Netscape)"
kind: "language"
status: "active"
year: 1995
paradigms:
  - "functional"
  - "imperative"
  - "object-oriented"
typing: "dynamic"
memory:
  - "gc"
  - "generational-gc"
  - "moving-gc"
execution:
  - "interpreted"
  - "jit"
  - "sandboxed"
concurrency:
  - "async/await"
  - "tasks"
features:
  - "closures"
  - "event-driven"
  - "first-class-functions"
  - "modules"
  - "prototypes"
  - "regex"
  - "strict-mode"
influences:
  - "C"
  - "Hypercard"
  - "Java"
  - "Scheme"
  - "Self"
influenced:
  - "ActionScript"
relations:
  - name: "ECMAScript"
    kind: "standardized-as"
note: "Netscape's browser scripting language: dynamically typed, prototype-based, garbage-collected. Standardized as ECMAScript (ECMA-262) and executed everywhere by engines like V8, SpiderMonkey, and JavaScriptCore, in browsers and Node.js."
---
## Overview

JavaScript is the scripting language of the web: engines execute it in every major browser, and hosts like [Node.js](https://nodejs.org/) carry it onto servers. Loosely typed and prototype-based, it is standardized by Ecma TC39 as ECMAScript (ECMA-262).

## Code

```javascript
// Prototype delegation — objects inherit from other objects, no classes needed.
const Counter = {
  count: 0,
  increment() {
    this.count += 1;
    return this.count;
  },
};

const widget = Object.create(Counter);
widget.increment(); // 1

// Functions are values (Scheme's legacy): pass them around, return them.
const twice = (fn, x) => fn(fn(x));
twice((n) => n + 1, 5); // 7

// async/await suspends execution until a promise settles:
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await delay(100);
```

Caption: `Object.create` builds delegation chains directly; functions flow as values; `await` suspends on a promise (top-level await requires modules).

## Distinctive traits

- Prototype-based objects: inheritance by delegation instead of class declarations; objects are open, expandable property bags.
- First-class functions and closures carry the Scheme lineage; they underpin callbacks, modules, and the async ecosystem.
- Loose dynamic typing: nothing declared, object references checked at runtime; type mismatches surface late.
- Garbage-collected automatically; V8's Orinoco collector is generational and moving, tuned to keep pauses short.
- Host environments inject their object models: browsers reflect the DOM into JS; Node.js hosts server-side code.

## Status

Active and standardizing briskly: ECMAScript 2026 (17th edition) published June 2026, with yearly releases and public development on Ecma TC39. Main engines: V8 (Chrome, Node.js), SpiderMonkey (Firefox), and JavaScriptCore (Safari).

## History

Prototype (Mocha) built in ten days in May 1995; shipped as LiveScript in the Navigator 2.0 beta, then renamed JavaScript after a Sun trademark agreement in December 1995 — the name from marketing, the semantics from Scheme and [Self](/languages/self). ECMA-262 first edition followed in 1997; the stalled ES4 was abandoned in 2008 for Harmony's yearly editions.