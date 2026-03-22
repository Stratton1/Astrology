# COSMOS — Execution Rules

## Planning Work
1. Break work into phases aligned with DEVELOPMENT_ROADMAP_v2.md
2. Validate each phase before moving to the next
3. Don't start coding before understanding the architecture impact

## Documentation Updates
Update relevant docs whenever you change:
- Architecture or service boundaries → ARCHITECTURE.md
- API routes or contracts → API.md
- Data models → packages/types + Prisma schema
- Calculation logic → CALCULATION.md
- Tradition rules → TRADITIONS.md
- Frontend structure → FRONTEND.md

## BUILD_LOG.md
**Append a new entry for every push-worthy change.** Each entry includes:
- Date
- Phase/workstream
- Files changed
- Summary of implementation
- Reason for change
- Tests run
- Docs updated
- Known follow-ups
- Risks introduced/mitigated

## PROJECT_SUMMARY.md
**Update whenever the codebase materially changes:**
- Build status
- Completed/in-progress/blocked modules
- Key decisions
- Next priorities
- Known risks
- Last updated date

## ROADMAP Updates
If implementation changes scope, sequence, or architecture, update DEVELOPMENT_ROADMAP_v2.md.

## Decision Recording
Record in /docs/DECISIONS.md when a technical choice:
- Affects multiple files or services
- Changes a pattern established earlier
- Has trade-offs worth documenting
- Deviates from the original specification

## Blocked Work
1. Document the blocker clearly
2. Create a follow-up item
3. Don't leave silent stubs that look like working code
4. Add TODO(cosmos) comment at the block point

## Assumptions
When inferring requirements not explicitly stated:
- Mark with `[ASSUMPTION]` in documentation
- Add a TODO(cosmos) comment in code
- Record in DECISIONS.md if significant

## Partial Implementations
- Mark with TODO(cosmos) comments explaining what's missing
- Document in BUILD_LOG.md
- Don't merge partial work without noting it in PROJECT_SUMMARY.md

## Avoiding Regressions
- Run `pnpm typecheck` before committing TypeScript changes
- Run `pnpm lint` before committing
- Run `pnpm test` / `pytest` for changed modules
- Never skip type checking

## Testing Discipline
- Write tests alongside implementation, not after
- Calculation changes require reference validation
- API changes require route integration tests
- Coverage must not decrease without justification

## Definition of Done
A task is done when:
- [ ] Code compiles and passes typecheck
- [ ] Tests pass
- [ ] Linter clean
- [ ] Documentation updated
- [ ] BUILD_LOG.md entry added
- [ ] PROJECT_SUMMARY.md updated (if material)
