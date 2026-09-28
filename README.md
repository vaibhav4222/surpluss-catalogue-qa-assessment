# Surpluss Catalogue QA Automation Assessment

QA automation assessment solution for the Surpluss catalogue application.

## Project Overview

This repository contains automated tests and QA documentation covering the main business and security risks identified in the catalogue application.

The implementation focuses on:

- Existing functional and security defects
- High-risk unit/integration logic
- API authentication and authorization
- Cross-catalogue access control
- Catalogue lifecycle and expiry behavior
- End-to-end buyer enquiry flow
- Testing strategy and risk-based decisions

## Tech Stack

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Vitest
- Playwright
- Zod

## Prerequisites

Install the following before running the project:

- Node.js 20+
- npm
- PostgreSQL

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` with the local PostgreSQL connection details if required.

### 3. Start PostgreSQL

Make sure PostgreSQL is running and the database configured in `.env` is available.

If Docker is preferred and Docker is installed:

```bash
docker compose up -d
```

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

### 5. Seed the database

```bash
npx prisma db seed
```

The seed data contains published, draft, and expired catalogue scenarios used by the tests.

## Run the Application

```bash
npm run dev
```

The application is configured to run locally on:

```text
http://localhost:3001
```

## Test Accounts

The seeded application provides the following accounts for testing:

### Admin

```text
Email: admin@catalogue.test
Password: Admin#2026
Role: Admin
```

### Staff

```text
Email: staff@catalogue.test
Password: Staff#2026
Role: Staff
```

Do not use these credentials outside the local assessment environment.

## Automated Tests

### Unit / Integration Tests

Run Vitest with:

```bash
npm test
```

For watch mode:

```bash
npm run test:watch
```

The tests cover areas such as:

- Catalogue status and expiry calculations
- Pricing and discount calculations
- Spreadsheet/import mapping validation
- Enquiry validation
- Admin authorization
- Cross-catalogue listing access
- Draft and expired catalogue access

### Playwright E2E

Install Playwright browsers if needed:

```bash
npx playwright install
```

Start the application first, then run:

```bash
npm run test:e2e
```

The E2E scenario covers the complete buyer journey:

```text
Published Catalogue
        ↓
Browse Product
        ↓
Add Product to Enquiry
        ↓
Submit Enquiry
        ↓
Admin Login
        ↓
Leads Inbox
        ↓
Verify Enquiry
```

## Assessment Findings

`FINDINGS.md` documents the defects discovered during the assessment.

Each finding contains:

- Description of the defect
- Reproduction steps
- Expected behavior
- Severity and business impact
- Automated regression test

The regression tests for existing defects are intentionally written to demonstrate the failure in the original buggy implementation. They should fail until the corresponding application defect is fixed.

## Test Coverage

The assessment prioritizes risk rather than attempting exhaustive coverage.

### High-priority areas

- Authentication and authorization
- Admin vs Staff permissions
- Catalogue lifecycle
- Catalogue expiry
- Cross-catalogue object access
- Enquiry submission
- Pricing and discount logic
- Import validation

### Deliberately limited areas

Lower-risk areas such as exhaustive visual validation, every possible API permutation, and broad browser compatibility were not prioritized because the assessment asks for focused, risk-based coverage rather than maximum test count.

The rationale is documented in `WRITEUP.md`.

## Project Structure

```text
src/
├── app/
│   ├── admin/
│   ├── api/
│   └── catalogue/
├── lib/
└── ...

tests/
├── unit/
├── api/
└── findings/

e2e/
└── buyer-enquiry.spec.ts

FINDINGS.md
WRITEUP.md
ASSESSMENT_RUN.md
```

## Useful Commands

```bash
# Install dependencies
npm install

# Start application
npm run dev

# Run unit/integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run Playwright tests
npm run test:e2e

# Run lint
npm run lint

# Run TypeScript checks
npm run typecheck

# Generate Prisma client
npx prisma generate

# Inspect database through Prisma Studio
npx prisma studio
```

## Notes

This solution intentionally does not remove or silently correct the application's existing defects. The purpose of the assessment is to identify those defects, document their business/security impact, and provide automated tests that demonstrate the failures.

Before submission, run the complete test suite locally and review every test and finding so that you can explain the reasoning, assertions, selectors, and expected behavior during the interview.
