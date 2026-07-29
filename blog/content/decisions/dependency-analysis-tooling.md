---
date: 2026-07-28
draft: true
title: Dependenciy Analysis Tooling
---

## Context and Problem Statement

As the codebase grows, it becomes increasingly difficult to identify unused files, unused exports, orphaned code, and circular dependencies. These issues increase maintenance costs, make refactoring riskier, and can negatively impact build performance.
We need automated tooling to continuously detect these problems and help keep the codebase healthy.

We also need to keep third-party dependencies up to date and flag known vulnerabilities in them, a concern the analysis tools above do not cover, so we additionally considered automated dependency update bots.

## Considered Options

| Tool               | Unused code | Circular dependencies |     Dependency graph    | Dependency updates | Vulnerability alerts |
| ------------------ | :---------: | :-------------------: | :---------------------: | :----------------: | :------------------: |
| Knip               |      ✅      |           ❌           |            ❌            |         ❌          |          ❌           |
| Madge              |      ❌      |           ✅           |            ✅            |         ❌          |          ❌           |
| Dependency Cruiser |      ❌      |           ✅           | ✅ + architectural rules |         ❌          |          ❌           |
| SonarQube          |   Partial   |        Partial        |         Limited         |         ❌          |       Partial        |
| Dependabot         |      ❌      |           ❌           |            ❌            |         ✅          |          ✅           |
| Renovate           |      ❌      |           ❌           |            ❌            |         ✅          |          ✅           |

- **No dedicated tooling**: rely on code reviews and manual analysis.
- **Knip + Madge**: combine specialized tools for unused code detection and dependency graph analysis.
- **Knip + Dependency Cruiser**: combine specialized tools for unused code detection, dependency graph analysis, circular dependency detection, and architectural rule enforcement.
- **SonarQube**: adopt a broader static analysis platform.
- **Dependabot**: natively integrated into GitHub, minimal configuration, security alerts out of the box.
- **Renovate**: more configurable (grouping, scheduling, automerge, broader ecosystem support) at the cost of a heavier configuration.

## Decision Outcome

Chosen option: **Adopt Knip, Dependency Cruiser and Dependabot**.

The three tools provide complementary capabilities with minimal overlap:
- **Knip** detects unused files, exports, dependencies, and configuration, helping remove dead code and unnecessary packages.
- **Dependency Cruiser** analyzes the project's dependency graph, detects circular dependencies, and supports enforcing architectural constraints through configurable dependency rules.
- **Dependabot** keeps third-party dependencies up to date and surfaces known vulnerabilities by opening pull requests automatically.

Compared to SonarQube, this approach remains lightweight, easy to integrate into CI, and focuses on the dependency analysis capabilities required by the project.
Compared to Madge, Dependency Cruiser provides a richer feature set, is actively maintained, and offers architectural rule enforcement in addition to dependency graph analysis. However, it is less "plug-and-play" than Madge and requires an initial configuration to define architectural rules. 
Compared to Renovate, Dependabot has a zero-friction GitHub integration and is simpler to set up; we can revisit Renovate later if finer-grained update policies are needed.

## Consequences

* **Good**: Developers can identify unused code, exports, and dependencies automatically instead of relying on manual reviews.
* **Good**: Circular dependencies and dependency violations can be detected before they become maintenance issues.
* **Good**: Dependency Cruiser provides a foundation for enforcing architectural rules as the codebase evolves.
* **Good**: Dependency analysis can be integrated into CI to prevent regressions.
* **Good**: Dependabot keeps third-party dependencies current and surfaces known vulnerabilities automatically.
* **Bad**: Introduces additional tooling that developers need to understand and maintain.
* **Bad**: Requires initial configuration to define project-specific dependency rules and exclusions.
* **Bad**: CI execution time slightly increases due to additional analysis steps.
* **Bad**: Automated update pull requests add review overhead and can introduce noise.

## More Information

* [Moon documentation](https://knip.dev)
* [Knip GitHub repository](https://github.com/webpro-nl/knip)
* [Dependency Cruiser GitHub repository](https://github.com/sverweij/dependency-cruiser)
* [Madge GitHub repository](https://github.com/pahen/madge)
* [Dependabot documentation](https://docs.github.com/en/code-security/dependabot)
* [Renovate documentation](https://docs.renovatebot.com/)
