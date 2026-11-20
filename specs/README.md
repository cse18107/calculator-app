# Specifications

Features are built from approved specifications (Spec-Driven Development). Code for a feature
starts only after its spec exists and is marked `Status: Approved`.

## Workflow

1. Copy [`TEMPLATE.md`](./TEMPLATE.md) to `specs/<feature-slug>.md` (lowercase kebab-case, for
   example `specs/standard-calculator.md`).
2. Fill in every section. Write `Not applicable` only when a section truly does not apply; do not
   delete sections.
3. Review the spec and set `Status: Approved` in its header.
4. Implement against the spec. Every acceptance criterion should map to at least one test.
5. Keep the spec current when behaviour changes. The spec describes intended behaviour; the code
   is the implementation.

## Status values

- `Draft`: being written, not ready for implementation.
- `Approved`: ready to implement.
- `Implemented`: all acceptance criteria are covered by passing tests.
- `Superseded`: replaced by another spec (link it).

## Source designs

UI references live in `designs/`. A spec's UI states section should name the design file it is
based on, for example `designs/Column - Basic calculator@1.5x.png`.
