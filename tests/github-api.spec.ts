import { test, expect } from '@playwright/test';

const REPO = 'test-repo-1';
const USER = process.env.GITHUB_USER;

test.use({
    // All requests we send go to this API endpoint.
    baseURL: 'https://api.github.com',
    extraHTTPHeaders: {
      // We set this header per GitHub guidelines.
      'Accept': 'application/vnd.github.v3+json',
      // Add authorization token to all requests.
      // Assuming personal access token available in the environment.
      'Authorization': `token ${process.env.API_TOKEN}`
    },
});

// test.beforeAll(async ({ request }) => {
//     // Create a new repository
//     const response = await request.post('/user/repos', {
//       data: {
//         name: REPO
//       }
//     });
//     expect(response.ok()).toBeTruthy();
//   });
  
// test.afterAll(async ({ request }) => {
//     // Delete the repository
//     const response = await request.delete(`/repos/${USER}/${REPO}`);
//     expect(response.ok()).toBeTruthy();
// });

test('should create a bug report', async ({ request }, testInfo) => {
  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: `[Bug] report 1 (${testInfo.project.name})`,
      body: `Bug description (${testInfo.project.name})`
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${USER}/${REPO}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: `[Bug] report 1 (${testInfo.project.name})`,
    body: `Bug description (${testInfo.project.name})`
  }));
});

test('should create a feature request', async ({ request }, testInfo) => {
  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: `[Feature] request 1 (${testInfo.project.name})`,
      body: `Feature description (${testInfo.project.name})`
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${USER}/${REPO}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: `[Feature] request 1 (${testInfo.project.name})`,
    body: `Feature description (${testInfo.project.name})`
  }));
});
