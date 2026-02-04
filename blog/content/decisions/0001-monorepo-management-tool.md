---
date: 2025-12-17
title: "Tooling for Monorepo Management"
---

## Context and Problem Statement

Our monorepo contains three distinct applications using different technology stacks:

* **Web application**: Astro / Node.js
* **Synthetic datasets**: Python / uv
* **Blog**: Golang / Hugo

We currently lack a unified way to manage these projects. Developers often have to `cd` into specific directories to run commands (install, build, test). Furthermore, running tests or builds acts globally or manually, leading to inefficiencies (e.g., running all tests when only one app changed).

We need a tool that:

1. Unifies management (one command to rule them all).
2. Manages the lifecycle (install, test, build) across languages.
3. Supports "smart" execution (caching, dependency graph analysis) to avoid running unnecessary tasks.
4. Is simple, not over-engineered, and works "out-of-the-box" as much as possible.

## Considered Options

* **Moon (moonrepo)**: A build system and workspace tool designed for the modern web and polyglot repos. Native support for Node, Python, Go, and Rust.
* **Mise (mise-en-place)**: A dev tool that combines environment management (like asdf) with a task runner. Simple and fast.
* **Turborepo**: High-performance build system for JavaScript/TypeScript monorepos. Can run other tasks but is JS-centric.
* **Nx**: A comprehensive build system with heavy plugin support for many languages.
* **Just / Make**: Simple command runners.

## Decision Outcome

Chosen option: **Moon**, because it offers the best balance of polyglot support, smart caching, and ease of use for our specific stack (Node, Python, Go).

* **Moon vs. Mise**: While **Mise** is an excellent tool for environment management and simple task running (meeting the "simple" criteria), it explicitly excludes "advanced task caching" and dependency graph analysis from its goals. **Moon** was selected because it provides the "smart execution" (running only affected tests) out-of-the-box via intelligent hashing, which is a critical requirement ("not run all tests").
* **Polyglot by Design**: Unlike Turborepo (which is JS-first), Moon is built to handle multiple languages natively, making it easier to integrate our Python and Go projects without "hacking" `package.json` files or creating complex wrappers.
* **Intelligent Caching**: It provides the "not run all tests" requirement out-of-the-box by analyzing files and dependencies to only run what is affected.
* **Toolchain Management**: Moon can automatically manage and download the correct versions of Node, Python (and uv), and Go, ensuring a consistent environment for all developers ("lifecycle management").
* **Simplicity**: It uses declarative YAML configuration which is easy to read and maintain compared to more complex setups like Nx.

## Consequences

* **Good**: Developers can run commands like `moon run :test` from the root to test all affected projects, regardless of language.
* **Good**: CI times will decrease due to intelligent caching/hashing.
* **Good**: Environment consistency is guaranteed via toolchain management.
* **Bad**: Introduces a new tool to the stack that developers need to install (though it can be bootstrapped easily).

## More Information

* [Moon documentation](https://moonrepo.dev/)
* [Moon GitHub repository](https://github.com/moonrepo/moon)
* [Turborepo documentation](https://turborepo.com/)
* [Mise-en-place documentation](https://mise.jdx.dev/)
* [Nx documentation](https://nx.dev/)
* [Just documentation](https://just.systems/man/en/)
