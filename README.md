# DemoWebShop – Playwright E2E Automation Framework

> A complete end-to-end automation suite for [demowebshop.tricentis.com](https://demowebshop.tricentis.com) built with **JavaScript (ESM)**, **Playwright**, **Page Object Model (POM)**, and a custom **ExtentReports-style HTML reporter**.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Setup & Installation](#setup--installation)
4. [Configuration](#configuration)
5. [Running Tests](#running-tests)
6. [Test Coverage](#test-coverage)
7. [Negative Test Cases](#negative-test-cases)
8. [Data-Driven Support](#data-driven-support)
9. [Reports](#reports)
10. [Architecture](#architecture)
12. [Tech Stack](#tech-stack)

---

## Project Structure

```
demo-workshop/
├── config/
│   ├── config.js                  # Env-driven runtime config (URLs, credentials, browser)
│   └── constants.js               # Immutable test data (search terms, messages, timeouts)
│
├── data/
│   └── testData.js                # Parameterized test scenarios (addresses, credentials, products)
│
├── pages/                         # Page Object Model classes
│   ├── BasePage.js                # Common helpers (click, fill, wait, screenshot)
│   ├── LoginPage.js               # /login page interactions
│   ├── HomePage.js                # Header search bar, cart badge, navigation
│   ├── SearchResultsPage.js       # /search page – basic + advanced search
│   ├── ProductPage.js             # Product detail, configurable options, Add to Cart
│   ├── CartPage.js                # /cart – item verification, proceed to checkout
│   ├── CheckoutPage.js            # Multi-step checkout (billing → shipping → payment → confirm)
│   └── OrderConfirmationPage.js   # /checkout/completed – success message assertions
│
├── tests/
│   └── e2e/
│       └── shoppingFlow.spec.js   # Data-driven E2E shopping flow (1 spec × N scenarios)
│
├── utils/
│   ├── Logger.js                  # Console logger with timestamps & log levels
│   ├── CheckoutHelper.js          # Modular checkout orchestration utility
│   └── ExtentReporter.js          # Custom Playwright reporter → ExtentReports-style HTML
│
├── reports/                       # Auto-generated – extent-report.html (gitignored)
├── test-results/                  # Auto-generated – screenshots/videos (gitignored)
│
├── .env.example                   # Template for environment variables
├── .env                           # Your local secrets (NOT committed)
├── playwright.config.js           # Playwright configuration for the JS test suite
└── README.md                      # This file
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 LTS |
| npm | ≥ 9 |

---

## Setup & Installation

### 1 – Install dependencies

```bash
npm install
```

> Dependencies (`@playwright/test`, `dotenv`) are already declared in the project.

### 2 – Install Playwright browsers

```bash
npx playwright install --with-deps chromium
```

### 3 – Create your `.env` file

```bash
cp .env.example .env
```

The defaults already match the demo site credentials — no edits needed unless the account changes.

---

## Configuration

### `config/config.js`

Reads environment variables from `.env` and exports a single config object:

```js
config.baseUrl              // https://demowebshop.tricentis.com
config.credentials.email    // qa.user123@mailinator.com
config.credentials.password // Engineer@09876
config.newAddress           // Full billing address fields
config.browser.headless     // true / false
config.reporter.outputDir   // reports/
```

### `config/constants.js`

Pure immutable constants used across tests:

```js
SEARCH.VALID_TERM          // 'Computer'
MESSAGES.ORDER_SUCCESS     // 'Your order has been successfully processed!'
TIMEOUTS.DEFAULT           // 30_000 ms
```

### Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://demowebshop.tricentis.com` | Application under test |
| `USER_EMAIL` | `qa.user123@mailinator.com` | Login email |
| `USER_PASSWORD` | `Engineer@09876` | Login password |
| `HEADLESS` | `true` | Set `false` to open browser window |
| `SLOW_MO` | `0` | Milliseconds delay between actions |
| `TIMEOUT` | `30000` | Action timeout in ms |
| `REPORT_DIR` | `reports` | Output folder for HTML report |
| `REPORT_TITLE` | `DemoWebShop – Automation Test Report` | Report heading |

---

## Running Tests

### Run the E2E shopping flow

```bash
npx playwright test shoppingFlow.spec.js
```

### Run in headed mode (watch the browser)

```bash
npx playwright test shoppingFlow.spec.js --headed
```

### View Playwright's Extent-report HTML report

Open the reports/extent-report.html from local

---

## Test Coverage

### `tests/e2e/shoppingFlow.spec.js`

Data-driven spec — one test is generated per scenario in `data/testData.js`.
Each test runs the same 13 ordered steps with scenario-specific data.

| Step | Type | Action | Key Assertion |
|------|------|--------|---------------|
| Step 1  | ❌ Negative | Login with **invalid** credentials | Error block visible |
| Step 2  | ✅ Positive | Login with **valid** credentials | `isLoggedIn === true`, email matches |
| Step 3  | ✅ Positive | Search for product (e.g. "Computer") | ≥ 1 result, first product selected |
| Step 4  | ✅ Positive | Add product to cart | Notification contains "cart", badge count > 0 |
| Step 5  | ✅ Positive | Verify cart contents | Selected product present in cart |
| Step 6  | ✅ Positive | Proceed to checkout | Navigated to checkout page |
| Step 7  | ✅ Positive | Fill billing address + Continue | AJAX response awaited, next step loads |
| Step 7b | ✅ Positive | Confirm shipping address (if present) | Optional step handled gracefully |
| Step 8  | ✅ Positive | Select shipping method | Ground option selected |
| Step 9  | ✅ Positive | Select payment method (COD) + Continue | COD selected, next step loads |
| Step 10 | ✅ Positive | Confirm payment info + Continue | Payment info step handled gracefully |
| Step 11 | ✅ Positive | Confirm the order | Confirm button clicked |
| Step 12 | ✅ Positive | Verify order success message | "Your order has been successfully processed!" |
| Step 13 | ✅ Positive | Logout | `isLoggedIn === false` |

---

## Negative Test Cases

Negative test cases validate that the application handles **invalid inputs and unhappy paths** correctly. The following negative cases are covered in the E2E flow:

### 1 – Invalid Login (Step 1)

**Location:** `tests/e2e/shoppingFlow.spec.js` → Step 1

**What it does:**
Attempts to log in using the correct email address but a deliberately wrong password (`'WrongPassword!'`).

**Why it is there:**
Verifies that the application correctly rejects invalid credentials and displays an error message to the user. If the error block does **not** appear, the assertion fails and the test stops.

**Assertion:**
```js
const hasError = await loginPage.hasError();
expect(hasError, 'Error block should be visible for wrong credentials').toBe(true);
```

**What you see in the browser (headed mode):**
A red validation error on the login page — this is **expected and intentional**, not a test failure.

---

### 2 – Zero Search Results Guard (Step 3)

**Location:** `tests/e2e/shoppingFlow.spec.js` → Step 3

**What it does:**
After searching, asserts that the result count is greater than zero.

**Why it is there:**
Guards against the product catalogue being empty or the search term returning no matches. If a future search term is misconfigured, this assertion catches it before the test attempts to click a non-existent product.

**Assertion:**
```js
const count = await resultsPage.getResultCount();
expect(count, `At least one result for "${scenario.searchTerm}"`).toBeGreaterThan(0);
```

---

### 3 – Cart Product Mismatch Guard (Step 5)

**Location:** `tests/e2e/shoppingFlow.spec.js` → Step 5

**What it does:**
After navigating to the cart, verifies that the product added in Step 4 is actually present in the cart by name.

**Why it is there:**
Guards against a silent failure where `addToCart()` succeeded (notification appeared) but the cart did not actually retain the item. Without this check, the test could proceed to checkout with an empty cart.

**Assertion:**
```js
const found = cartNames.some(n =>
  n.toLowerCase().includes(selectedProductName.toLowerCase()) ||
  selectedProductName.toLowerCase().includes(n.toLowerCase())
);
expect(found, `"${selectedProductName}" should be in cart`).toBe(true);
```

---

### 4 – Empty Cart Guard (Step 5)

**Location:** `tests/e2e/shoppingFlow.spec.js` → Step 5

**What it does:**
Asserts that the cart contains at least one item before proceeding.

**Why it is there:**
Prevents the test from attempting a checkout with an empty cart, which would cause a misleading failure deep in the checkout flow rather than a clear failure at the cart step.

**Assertion:**
```js
const itemCount = await cartPage.getItemCount();
expect(itemCount, 'Cart should have at least 1 item').toBeGreaterThan(0);
```

---

### 5 – Logout Verification (Step 13)

**Location:** `tests/e2e/shoppingFlow.spec.js` → Step 13

**What it does:**
After clicking logout, asserts that the user is no longer logged in.

**Why it is there:**
Verifies that the session is properly terminated. A silent logout failure (where the UI navigates but the session cookie persists) would be missed without this check.

**Assertion:**
```js
const stillLoggedIn = await loginPage.isLoggedIn();
expect(stillLoggedIn, 'User should be logged out').toBe(false);
```

---

### Summary of Negative Cases

| # | Step | Scenario | Expected Outcome |
|---|------|----------|-----------------|
| 1 | Step 1  | Login with wrong password | Error block displayed |
| 2 | Step 3  | Search returns 0 results | Test fails with clear message |
| 3 | Step 5  | Added product missing from cart | Test fails with product name in message |
| 4 | Step 5  | Cart is empty before checkout | Test fails before reaching checkout |
| 5 | Step 13 | Session persists after logout | Test fails with `isLoggedIn === true` |

---

## Data-Driven Support

Test scenarios are defined in `data/testData.js`. Each scenario object drives one complete test run:

```js
// data/testData.js
export const scenarios = [
  {
    name: 'NY Address – Computer',
    credentials: { email: '...', password: '...' },
    searchTerm: 'Computer',
    address: { firstName: 'Test', lastName: 'Automation', country: 'United States', state: 'New York', ... },
    shippingMethodIndex: 0,
    paymentMethod: 'Cash On Delivery (COD)',
  },
  // Add more scenarios here – no spec changes needed
];
```

**To add a new test scenario**, append an entry to `data/testData.js`. The spec picks it up automatically via the `for...of scenarios` loop.

The checkout steps (7–12) are orchestrated by `utils/CheckoutHelper.js`, keeping the spec concise and reusable across all scenarios.

---

## Reports

After each run, an **ExtentReports-style HTML report** is written to:

```
reports/extent-report.html
```

Open it in any browser:

```bash
# Windows
start reports/extent-report.html

# macOS / Linux
open reports/extent-report.html
```

**Report features:**

- Summary dashboard: Total / Passed / Failed / Skipped / Pass %
- Pass-rate progress bar
- Per-test status badge (Passed / Failed / Skipped / Timed Out)
- Expandable step detail panel with per-step duration
- Inline error message on failure
- Screenshot thumbnail on failure (click to open full-size)

---

## Architecture

```
Test Spec  (.spec.js)
  │  reads scenarios from
  ▼
data/testData.js  ──────────────────────────────────┐
  │                                                  │
  │  for each scenario, instantiates                 │
  ▼                                                  │
Page Objects  (pages/*.js)           utils/CheckoutHelper.js
  │  extend                                (wraps CheckoutPage +
  ▼                                         OrderConfirmationPage)
BasePage  — wraps → Playwright Page API

Test Spec
  │  reads
  ▼
config/config.js  ←── .env  ←── .env.example
config/constants.js

Test Spec + Page Objects
  │  log to
  ▼
utils/Logger.js  →  stdout (timestamped, level-filtered)

playwright.config.js
  │  registers
  ▼
utils/ExtentReporter.js  →  reports/extent-report.html
```

---

## Tech Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| **@playwright/test** | ^1.49.1 | Test runner, browser automation |
| **dotenv** | ^16.4.7 | `.env` environment variable loading |
| **Node.js** | ≥ 18 LTS | Runtime (ESM modules required) |

> All test files are plain **JavaScript (.js)** using ES Module syntax (`import`/`export`).

---

*Automation suite built with Playwright · JavaScript · Page Object Model · Custom ExtentReporter*
