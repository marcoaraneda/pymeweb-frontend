# E2E Marketplace Flow

This test automates:

1. Publish product
2. Edit product
3. Add to marketplace cart
4. Checkout
5. Receipt validation

## Environment variables

Set these variables before running in a clean environment:

- `E2E_BASE_URL` (optional, default: `http://localhost:3001`)
- `E2E_USER`
- `E2E_PASSWORD`

## Commands

- Install browser once:
  - `npm run test:e2e:install`
- Refresh auth state (recommended before CI/local runs):
  - `npm run test:e2e:auth`
- Run tests headless:
  - `npm run test:e2e`
- Run tests headed:
  - `npm run test:e2e:headed`

Auth behavior:

- If `E2E_USER` and `E2E_PASSWORD` are provided, the setup test logs in and rewrites `tests/e2e/.auth/user.json`.
- If credentials are not provided but `tests/e2e/.auth/user.json` exists, setup reuses it.
- If neither credentials nor auth state are available, tests fail with an explicit authentication error.
