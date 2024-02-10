# Basic Demo

## Setup/Prerequisites

Install dependencies:

```sh
npm install -D @playwright/test
npx playwright install
npx playwright install-deps
```

First time setup of a new project:

```sh
mkdir playwright-basic-demo
cd playwright-basic-demo
npm init playwright@latest

cp basic-demo/tests-examples/demo-todo-app.spec.ts tests
```

If cloning an existing configured project:

```sh
npm install
```

### For demonstrating the Playwright Testing Service

* Setup a Playwright Testing workspace

  * See: [Quickstart: Run end-to-end tests at scale with Microsoft Playwright Testing Preview](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-run-end-to-end-tests)

* Create a `.env` file in the root of the project

  * See: [Set up your environment](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-run-end-to-end-tests?tabs=playwrightcli#set-up-your-environment)

* Create a `playwright.config.ts` file in the root of the project

  * See: [Add a service configuration file](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-run-end-to-end-tests?tabs=playwrightcli#add-a-service-configuration-file)

## Demo Script

### Check the Playwright docs

* [Playwright Docs - Getting Started / Installation](https://playwright.dev/docs/intro)

### Running tests locally

Examine the playwright config file: `basic-demo\playwright.config.ts`

Examine a basic test file: `basic-demo\tests\example.spec.ts`

Run tests:

```sh
npx playwright test example.spec.ts --workers=3
npx playwright show-report
```

Examine a more detailed test file: `demo-todo-app.spec.ts`

Run tests:

```sh
npx playwright test demo-todo-app.spec.ts --workers=5
npx playwright test demo-todo-app.spec.ts --workers=1 --project=firefox --headed
npx playwright show-report
```

### Run tests on Playwright Testing service

Navigate to Playwright Testing in the Azure Portal:

* Open the Playwright Testing workspace - [https://playwright.microsoft.com/](https://playwright.microsoft.com/)
* Quick walkthrough of the workspace and configuring the access token and playwright.config.ts

Run parallel tests across multiple remote browsers:

```sh
npx playwright test demo-todo-app.spec.ts --workers=50 --config=playwright.service.config.ts
```

### Interactive mode

```sh
npx playwright test demo-todo-app.spec.ts --project=firefox --ui
```

* Run the tests
* Examine the timeline
* Examine the test the test cases and individual steps
* Use the Locator to find selectors
* Use watch mode on a single test
* Create a failing test and debug it

### VSCode Integration / GitHub Copilot

Test Explorer:

* Show Test Explorer (click Testing icon in the Activity Bar)
* Run tests from Test Explorer
* Show Browser
* Show Trace Viewer (doesn't work from WSL2, open in Windows instead)
  * Make a test fail, suggest using Counter or Item Marked Completed
  * Show in the tracer viewer: Action / Before / After
* Pick Locator

Record a new test and use Copilot to help write the test:

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  await page.getByPlaceholder('What needs to be done?').click();
  await page.getByPlaceholder('What needs to be done?').fill('Buy milk');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  await expect(page.locator('body')).toContainText('1 item');
  await page.getByPlaceholder('What needs to be done?').click();
  await page.getByPlaceholder('What needs to be done?').fill('Buy bread');
  await page.getByPlaceholder('What needs to be done?').press('Enter');
  await expect(page.locator('body')).toContainText('2 items');
});
```

Select the code and choose Copilot / Start Inline Chat:

"refactor to reduce repetition"

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  const inputField = page.getByPlaceholder('What needs to be done?');

  await page.goto('https://demo.playwright.dev/todomvc/#/');

  await inputField.click();
  await inputField.fill('Buy milk');
  await inputField.press('Enter');
  await expect(page.getByTestId('todo-count')).toContainText('1 item');
  await inputField.click();
  await inputField.fill('Buy bread');
  await inputField.press('Enter');
  await expect(page.getByTestId('todo-count')).toContainText('2 items');
});

```

Select the inner test the code, start a Copilot inline chat:

"Add a Page Object Model to represent this page."

```ts
import { test, expect, Page } from '@playwright/test';

class TodoPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async addTodoItem(item: string) {
    const inputField = await this.page.getByPlaceholder('What needs to be done?');
    await inputField.click();
    await inputField.fill(item);
    await inputField.press('Enter');
  }

  async getTodoCount() {
    const todoCount = await this.page.getByTestId('todo-count');
    return await todoCount.textContent();
  }

  async navigateTo() {
    await this.page.goto('https://demo.playwright.dev/todomvc/#/');
  }
}

test('test', async ({ page }) => {
  const todoPage = new TodoPage(page);

  await todoPage.navigateTo();

  await todoPage.addTodoItem('Buy milk');
  await expect(await todoPage.getTodoCount()).toContain('1 item');

  await todoPage.addTodoItem('Buy bread');
  await expect(await todoPage.getTodoCount()).toContain('2 items');
});
```

Select all the code in the file:

"Refactor getTodoCount to just take in an integer and check the item count in the method."

```ts
import { test, expect, Page } from '@playwright/test';

class TodoPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async addTodoItem(item: string) {
    const inputField = await this.page.getByPlaceholder('What needs to be done?');
    await inputField.click();
    await inputField.fill(item);
    await inputField.press('Enter');
  }

  async getTodoCount(expectedCount: number) {
    const todoCount = await this.page.getByTestId('todo-count');
    const countText = await todoCount.textContent();
    const count = parseInt(countText.split(' ')[0]);
    expect(count).toBe(expectedCount);
  }

  async navigateTo() {
    await this.page.goto('https://demo.playwright.dev/todomvc/#/');
  }
}

test('test', async ({ page }) => {
  const todoPage = new TodoPage(page);

  await todoPage.navigateTo();

  await todoPage.addTodoItem('Buy milk');
  await todoPage.getTodoCount(1);

  await todoPage.addTodoItem('Buy bread');
  await todoPage.getTodoCount(2);
});
```

### Visual Comparisons

When running locally, visual comparisons are ignored:

```sh
npx playwright test demo-todo-app.spec.ts:259 --workers=20 --project=firefox --headed
```

When running on the Playwright Testing service, visual comparisons are enabled:

```sh
npx playwright test demo-todo-app.spec.ts:259 --config=playwright.service.config.ts --project=firefox --update-snapshots

# Will fail as it's a different browser (could also use Windows instead of Linux)
npx playwright test demo-todo-app.spec.ts:259 --config=playwright.service.config.ts --project=chromium
```

### Run tests on CI (GitHub Actions)

Include the Test Report and Tracing as a build artifact:

```sh

```

## Resources

* [Playwright Docs - Getting Started / Installation](https://playwright.dev/docs/intro)
* [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
