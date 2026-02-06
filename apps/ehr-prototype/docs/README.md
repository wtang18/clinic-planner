# EHR Prototype Documentation

> **Product:** Carbon Health EHR Prototype
> **Last Updated:** 2025-01-31

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [Information Architecture](./INFORMATION_ARCHITECTURE.md) | Core IA structure, menu hierarchy, pane behaviors |
| [Navigation Patterns](./NAVIGATION_PATTERNS.md) | Navigation flows, context bar, deep linking |
| [Implementation Plan](./IMPLEMENTATION_PLAN.md) | Phased build plan with deliverables |
| [Progress Tracker](./PROGRESS.md) | Current implementation status |
| [Layout Refactor Plan](./LAYOUT_REFACTOR_PLAN.md) | Technical implementation of two-layer layout |
| [Future Considerations](./FUTURE_CONSIDERATIONS.md) | Deferred ideas and enhancements |

### Feature Documentation

| Feature | Document |
|---------|----------|
| To-Do Workflow | [features/TO_DO.md](./features/TO_DO.md) |
| Patient Workspace | Coming soon |
| Overview Pane | Coming soon |

---

## Documentation Structure

```
docs/
├─ README.md                    ← You are here (index)
├─ INFORMATION_ARCHITECTURE.md  ← Core IA decisions
├─ NAVIGATION_PATTERNS.md       ← Navigation flows and patterns
├─ IMPLEMENTATION_PLAN.md       ← Phased build plan
├─ PROGRESS.md                  ← Implementation progress tracker
├─ LAYOUT_REFACTOR_PLAN.md      ← Technical layout implementation
├─ FUTURE_CONSIDERATIONS.md     ← Parking lot for future ideas
└─ features/
   ├─ TO_DO.md                  ← To-Do feature documentation
   └─ [additional features]
```

### Document Types

| Type | Naming | Purpose |
|------|--------|---------|
| Architecture | `INFORMATION_ARCHITECTURE.md` | High-level structure and decisions |
| Patterns | `*_PATTERNS.md` | Reusable interaction patterns |
| Plans | `*_PLAN.md` | Technical implementation plans |
| Features | `features/*.md` | Individual feature documentation |
| Future | `FUTURE_CONSIDERATIONS.md` | Deferred ideas and enhancements |

---

## Design Principles

1. **Context Preservation** - Users shouldn't lose their place when switching tasks
2. **Progressive Disclosure** - Show what's needed, reveal more on demand
3. **Consistent Patterns** - Similar actions work similarly across the app
4. **Minimal Navigation Depth** - Reduce clicks to reach actionable content

---

## Current Status

### Implemented
- Two-layer layout (floating + content surface)
- Menu pane with hubs and patient workspaces
- Overview pane with patient context tabs
- Floating nav row with dynamic controls

### In Design
- To-Do workflow and navigation patterns
- Context bar for To-Do → Patient flows
- Overview pane Activity tab

### Planned
- Full To-Do list views
- Patient workspace child tabs
- Location-based fax inbox

---

## Contributing to Documentation

### When to Document

- **New feature design** → Create `features/FEATURE_NAME.md`
- **Navigation pattern** → Add to `NAVIGATION_PATTERNS.md`
- **IA change** → Update `INFORMATION_ARCHITECTURE.md`
- **Deferred idea** → Add to `FUTURE_CONSIDERATIONS.md`

### Document Format

Each document should include:
- **Status** header (Active Design, Implemented, Deprecated)
- **Last Updated** date
- **Related Docs** links
- **Overview** section explaining purpose
- **Changelog** at bottom

### AI-Readable Conventions

These docs are designed to be both human and AI-readable:
- Use tables for structured comparisons
- Use ASCII diagrams for visual concepts
- Keep sections clearly labeled with headers
- Include specific examples and code snippets where relevant

---

## Resources

### Design References
- `resources/layout-wireframe/` - Layout wireframes
- `resources/to-do/` - To-Do screenshots (reference implementation)

### External Links
- Figma designs (link TBD)
- Carbon Health design system (link TBD)
