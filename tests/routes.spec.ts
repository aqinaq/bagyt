import { test, expect, type Page } from '@playwright/test';
import { programmes } from '../src/data';

async function checkCourse(page: Page, title: string) {
  await expect(page.locator('.course-summary h2')).toHaveText(title);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('16px "Noto Sans"'))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const programme of programmes) {
  test(`${programme.id}: home link`, async ({ page }) => {
    await page.goto('/');
    await page.locator(`#programmes a[href="/programmes/${programme.id}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/programmes/${programme.id}$`));
    await checkCourse(page, programme.title.kk);
  });

  test(`${programme.id}: direct new tab`, async ({ context }) => {
    const direct = await context.newPage();
    const response = await direct.goto(`/programmes/${programme.id}`);
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('text/html');
    await checkCourse(direct, programme.title.kk);
    await direct.close();
  });

  test(`${programme.id}: reload after home link`, async ({ page }) => {
    await page.goto('/');
    await page.locator(`#programmes a[href="/programmes/${programme.id}"]`).first().click();
    await checkCourse(page, programme.title.kk);
    const response = await page.reload();
    expect(response?.status()).toBe(200);
    await checkCourse(page, programme.title.kk);
  });
}

test('static assets keep their original content types', async ({ page, request }) => {
  await page.goto('/');
  const bundledAssets = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(elements =>
    elements.map(element => element.getAttribute('src') || element.getAttribute('href')!)
  );
  expect(bundledAssets.some(path => path.endsWith('.js'))).toBe(true);
  expect(bundledAssets.some(path => path.endsWith('.css'))).toBe(true);
  const assets: [string, RegExp][] = [
    ['/images/learning-together.jpg', /image\/jpeg/],
    ['/images/learning-space.jpg', /image\/jpeg/],
    ['/fonts/noto-sans.woff2', /font\/woff2|application\/(?:font-woff|octet-stream)/],
    ['/favicon.svg', /image\/svg\+xml/],
    ...bundledAssets.map(path => [path, path.endsWith('.css') ? /text\/css/ : /(?:text|application)\/javascript/] as [string, RegExp]),
  ];
  for (const [path, contentType] of assets) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toMatch(contentType);
    expect((await response.body()).length, path).toBeGreaterThan(0);
  }
});
