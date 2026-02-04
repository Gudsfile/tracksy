---
date: 2026-02-04
title: Reproducible E2E Datasets
---

## Context and Problem Statement

We have introduced end-to-end tests to ensure application stability and reliability.
E2E tests rely on static datasets generated at one moment.
This may cause issues as the models need to evolve (as streaming providers evolve on their side).

We need to ensure the end-to-end tests are reproducible with the same data but agnostic to model changes while maintaining test reliability and consistency across different environments and time periods.

**Key challenges:**
- E2E tests currently use a static ZIP file (`streamings_1000.zip`) with hardcoded assertions
- Model evolution requires dataset schema changes
- Different developers and CI environments must produce identical test results
- Test data must remain stable even when synthetic generation logic evolves

## Considered Options

### Option 1: Frozen Static Dataset
Keep using pre-generated static datasets (current approach with `streamings_1000.zip`).

**Pros:**
- Completely reproducible across all environments
- No dependency on synthetic generation logic
- Fast test execution (no generation overhead)

**Cons:**
- Cannot evolve with model changes without manual intervention
- Requires manual regeneration and version control of binary files
- Difficult to update when schema changes (regeneration changes the data)

### Option 2: Generated Dataset with Fixed Seed
Use the synthetic dataset generator with a fixed seed for E2E tests.

**Pros:**
- Reproducible results across environments via seeding
- Automatically adapts to model schema changes
- Leverages existing synthetic generation infrastructure
- Can generate different dataset sizes as needed
- Version controlled generation logic instead of binary data

**Cons:**
- Requires synthetic generation to run before/during tests
- Test reliability depends on generator stability
- Slightly slower test setup
- Need to ensure seed consistency across environments

### Option 3: Data-Agnostic E2E Tests
Write tests that don't rely on specific data values but test functionality patterns.

**Pros:**
- Most flexible approach
- Immune to data variations
- Focus on application behavior rather than specific values

**Cons:**
- Cannot test specific edge cases or data scenarios
- Less thorough validation of data processing accuracy
- More complex test logic to handle dynamic assertions
- May miss data-specific bugs
- Less human readable test cases

## Decision Outcome

Chosen option: **Generated Dataset with Fixed Seed**, because it provides the best balance between reproducibility and maintainability while leveraging our existing synthetic generation infrastructure.

**Justification:**
- Tests can automatically adapt to model schema changes without manual intervention
- Maintains reproducibility across all environments and time periods
- Aligns with the project's existing architecture and tooling
- Ensure synthetic-datasets evolves along side the application
