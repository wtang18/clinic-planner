# Seed Data

This directory contains shared mock data scripts that can be used to hydrate any Supabase project in the workspace.

## Purpose

- Provide consistent test data across all prototypes
- Enable quick database setup for new prototypes
- Share realistic mock data for development and demos

## Usage

Scripts in this directory should be database-agnostic and work with any Supabase project by accepting connection details as parameters or environment variables.

```bash
# Example usage (to be implemented)
node seed-data/seed-events.js --project clinic-planner
node seed-data/seed-events.js --project ehr-prototype
```

## Structure

```
seed-data/
├── README.md           # This file
├── shared/             # Shared utilities and types
├── clinic-planner/     # Seed data specific to clinic-planner schema
└── ehr-prototype/      # Seed data specific to EHR schema (when created)
```

## Guidelines

1. Each prototype may have its own subdirectory for schema-specific seed data
2. Keep shared mock data generators in the `shared/` directory
3. Use TypeScript for type safety where possible
4. Document required environment variables
