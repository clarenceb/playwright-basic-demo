# Playwright Basic Demo

A basic demo of Playwright Framework and Microsoft Playwright Testing.

## Setup/Prerequisites - Playwright Framework

Install dependencies for Playwright Framework on your local machine:

```sh
npm install -D @playwright/test
npx playwright install
npx playwright install-deps
```

First time setup of a new project (not needed for this project as it has already been setup):

```sh
mkdir playwright-basic-demo
cd playwright-basic-demo
npm init playwright@latest

cp basic-demo/tests-examples/demo-todo-app.spec.ts tests
```

After cloning this project from GitHub, install the npm packages:

```sh
npm install
```

### Setup/Prerequisites - Playwright Testing Service

* Setup a Playwright Testing workspace

  * See: [Quickstart: Run end-to-end tests at scale with Microsoft Playwright Testing Preview](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-run-end-to-end-tests)

* Create a `.env` file in the root of the project

  * See: [Set up your environment](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-run-end-to-end-tests?tabs=playwrightcli#set-up-your-environment)

* Create a `playwright.config.ts` file in the root of the project

  * See: [Add a service configuration file](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-run-end-to-end-tests?tabs=playwrightcli#add-a-service-configuration-file)

## Demo Script

### Quick walkthrough of the Playwright Framework docs

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

### Run tests using the Playwright Testing service

Navigate to Playwright Testing in the Azure Portal:

* Open the Playwright Testing workspace - [https://playwright.microsoft.com/](https://playwright.microsoft.com/)
* Quick walkthrough of the workspace and configuring the access token and playwright.config.ts

Run parallel tests across multiple remote browsers:

```sh
npx playwright test demo-todo-app.spec.ts --workers=50 --config=playwright.service.config.ts
```

### Interactive Mode

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

When running locally, visual comparisons are ignored (as set in the `playwright.config.ts` file):

```sh
npx playwright test demo-todo-app.spec.ts:259 --workers=20 --project=firefox --headed
```

When running on the Playwright Testing service, visual comparisons are enabled (as set in the `playwright.service.config.ts` file)::

```sh
npx playwright test demo-todo-app.spec.ts:259 --config=playwright.service.config.ts --project=firefox --update-snapshots

# This will fail as it's a different browser and it has a different rendering engine (can also use Windows instead of Linux)
npx playwright test demo-todo-app.spec.ts:259 --config=playwright.service.config.ts --project=chromium
```

### Run tests on CI (GitHub Actions)

**Setup: one-off setup for the workflow**

* [Generate an access token](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-automate-end-to-end-testing?tabs=github#configure-a-service-access-token) in the Playwright Testing workspace
* Store the access token in a GitHub repository secret with the name `PLAYWRIGHT_SERVICE_ACCESS_TOKEN`
* Fetch the Playwright Service URL for your workspace
* Store the Playwright Service URL in a GitHub repository secret with the name `PLAYWRIGHT_SERVICE_URL`
* Check that `playwright.service.config.ts` is committed to the repository, check the [sample one](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-automate-end-to-end-testing?tabs=github#update-the-workflow-definition) in the docs or download it from your Playwright Testing workspace under the section "Add Playwright Service Configuration"
* Update the GitHub Actions workflow file to run the tests on CI based on [this sample](https://learn.microsoft.com/en-us/azure/playwright-testing/quickstart-automate-end-to-end-testing?tabs=github#update-the-workflow-definition)

**Enable workflow: one-off setup for the workflow**

* Ensure the workflow **Playwright Tests** is enabled in the GitHub Actions tab of the repository
* Make any necessary changes to the workflow file (`.github/workflows/playwright.yml) and commit them to the repository

**View the playwright report and traces**

* Navigate to the workflow run or the "acceptance-tests" job
* In the **Artifacts** section, download the report and traces contained in the `playwright-report` aritfact ZIP file
* Unzip the directory `playwright-report`
* From the command-line, run the playwright report viewer:

```sh
cd ~/Downloads/
rm -rf ./playwright-report*
unzip playwright-report.zip -d playwright-report

npx playwright show-report playwright-report
# Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.
```

Navigate to the URL ([http://localhost:9323](http://localhost:9323)) in a browser to view the report

**Commit a failing tests and view report**

* In the file `demo-todo-app.spec.ts`, change these tests to fail:

Line 64: `await expect(todoCount).toHaveText(/2/);`
Line 145: `await expect(firstTodo).toHaveClass('complete');`
Line 146: `await expect(secondTodo).toHaveClass('complete');`

* Also, change the `PLAYWRIGHT_SERVICE_OS` in GitHub Actions to `windows` and save before committing and pushing the changes to the repository

**Fix the failing test and view report**

* Revert the changes made above.
* The tests should pass.
* Show the caches for all workflows as well and explain that this can save time on subsequent runs.

## Resources

* [Playwright Docs - Getting Started / Installation](https://playwright.dev/docs/intro)
* [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
