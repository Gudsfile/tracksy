---
date: 2026-07-28
draft: true
title: Dependenciy Analysis Tooling
---

## Context and Problem Statement

As the codebase grows, it becomes increasingly difficult to identify unused files, unused exports, orphaned code, and circular dependencies. These issues increase maintenance costs, make refactoring riskier, and can negatively impact build performance.
We need automated tooling to continuously detect these problems and help keep the codebase healthy.

## Considered Options

| Tool               | Unused code | Circular dependencies |     Dependency graph    |
| ------------------ | :---------: | :-------------------: | :---------------------: |
| Knip               |      ✅      |           ❌           |            ❌            |
| Madge              |      ❌      |           ✅           |            ✅            |
| Dependency Cruiser |      ❌      |           ✅           | ✅ + architectural rules |
| SonarQube          |   Partial   |        Partial        |         Limited         |

- **No dedicated tooling**: rely on code reviews and manual analysis.
- **Knip + Madge**: combine specialized tools for unused code detection and dependency graph analysis.
- **Knip + Dependency Cruiser**: combine specialized tools for unused code detection, dependency graph analysis, circular dependency detection, and architectural rule enforcement.
- **SonarQube**: adopt a broader static analysis platform.

## Decision Outcome

Chosen option: **Adopt Knip and Dependency Cruiser**.

The two tools provide complementary capabilities with minimal overlap:
- **Knip** detects unused files, exports, dependencies, and configuration, helping remove dead code and unnecessary packages.
- **Dependency Cruiser** analyzes the project's dependency graph, detects circular dependencies, and supports enforcing architectural constraints through configurable dependency rules.

Compared to SonarQube, this approach remains lightweight, easy to integrate into CI, and focuses on the dependency analysis capabilities required by the project.
Compared to Madge, Dependency Cruiser provides a richer feature set, is actively maintained, and offers architectural rule enforcement in addition to dependency graph analysis. However, it is less "plug-and-play" than Madge and requires an initial configuration to define architectural rules. 

## Consequences

* **Good**: Developers can identify unused code, exports, and dependencies automatically instead of relying on manual reviews.
* **Good**: Circular dependencies and dependency violations can be detected before they become maintenance issues.
* **Good**: Dependency Cruiser provides a foundation for enforcing architectural rules as the codebase evolves.
* **Good**: Dependency analysis can be integrated into CI to prevent regressions.
* **Bad**: Introduces additional tooling that developers need to understand and maintain.
* **Bad**: Requires initial configuration to define project-specific dependency rules and exclusions.
* **Bad**: CI execution time slightly increases due to additional analysis steps.

## More Information

* [Moon documentation](https://knip.dev)
* [Knip GitHub repository](https://github.com/webpro-nl/knip)
* [Dependency Cruiser GitHub repository](https://github.com/sverweij/dependency-cruiser)
* [Madge GitHub repository](https://github.com/pahen/madge)
