import { test, expect } from '@playwright/test';
import { programmes, priceText } from '../src/data';

for (const lang of ['kk', 'ru']) {
  test(`${lang}: compass selects and opens each direction`, async ({ page }) => {
    await page.goto('/');
    if (lang === 'ru') await page.locator('.header-actions').getByRole('button', { name: 'РУС' }).click();
    const compass = page.locator('.direction-compass');
    const ids = ['general-english', 'ielts', 'everyday-kazakh', 'interior-design'];
    for (const [index, id] of ids.entries()) {
      const option = compass.getByRole('button').nth(index);
      await option.focus();
      await page.keyboard.press('Enter');
      await expect(option).toHaveAttribute('aria-pressed', 'true');
      await expect(compass.locator('[aria-pressed=true]')).toHaveCount(1);
      await expect(compass.locator('.compass-result-top')).toContainText(`0${index + 1}`);
      await expect(compass.getByRole('link')).toHaveAttribute('href', `/programmes/${id}`);
      const course = programmes[index];
      const locale = lang as 'kk' | 'ru';
      await expect(compass.getByRole('heading')).toHaveText(course.title[locale]);
      await expect(compass.locator('.compass-course-description')).toHaveText(course.description[locale]);
      await expect(compass.locator('.compass-course-facts')).toContainText(priceText(course.price));
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await compass.locator('.compass-course-description').click();
    await expect(page).toHaveURL(/\/programmes\/interior-design$/);
    await expect(page.locator('.course-summary')).toBeVisible();
  });
}

test('compass follows a mouse drag across north and snaps on release', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByRole('slider');
  await page.evaluate(() => document.fonts.ready);
  await slider.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  const bounds = (await slider.boundingBox())!;
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const point = (degrees: number, radius = 60) => ({ x: center.x + Math.sin(degrees * Math.PI / 180) * radius, y: center.y - Math.cos(degrees * Math.PI / 180) * radius });
  const start = point(45);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await expect(page.locator('.direction-compass')).toHaveClass(/is-dragging/);
  for (const angle of [135, 225, 315, 405, 480]) {
    const next = point(angle);
    await page.mouse.move(next.x, next.y, { steps: 5 });
  }
  const compass = page.locator('.direction-compass');
  await expect(compass).toHaveClass(/is-dragging/);
  await expect(compass.getByRole('heading')).toHaveText('IELTS-ке дайындық');
  await expect(compass.locator('.compass-course-description')).toHaveText(programmes[1].description.kk);
  expect(await compass.evaluate(el => parseFloat((el as HTMLElement).style.getPropertyValue('--direction')))).toBeCloseTo(480, 0);
  // Pointer capture keeps the interaction alive outside the orange disc.
  const outside = point(480, 150);
  await page.mouse.move(outside.x, outside.y);
  await page.mouse.up();
  await expect(compass).not.toHaveClass(/is-dragging/);
  await expect(slider).toHaveAttribute('aria-valuenow', '2');
  await expect(compass).toHaveAttribute('style', '--direction: 495deg;');
  await expect(compass.getByRole('link')).toHaveAttribute('href', '/programmes/ielts');
});

test('compass supports keyboard rotation and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const slider = page.getByRole('slider');
  await slider.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '4');
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '1');
  await page.keyboard.press('End');
  await expect(slider).toHaveAttribute('aria-valuenow', '4');
  await page.keyboard.press('Home');
  await expect(slider).toHaveAttribute('aria-valuenow', '1');
  expect(await page.locator('.compass-needle').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});

test('finger rotation prevents scrolling only on the disc and handles cancellation', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch interaction on the mobile viewport');
  await page.goto('/');
  const slider = page.getByRole('slider');
  await page.evaluate(() => document.fonts.ready);
  await slider.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  const bounds = (await slider.boundingBox())!;
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const point = (degrees: number) => ({ x: center.x + Math.sin(degrees * Math.PI / 180) * 55, y: center.y - Math.cos(degrees * Math.PI / 180) * 55 });
  const session = await context.newCDPSession(page);
  const scrollBefore = await page.evaluate(() => scrollY);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(45)] });
  for (const angle of [75, 105, 135, 165, 195, 225]) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(angle)] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(slider).toHaveAttribute('aria-valuenow', '3');
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  await expect(page.locator('.compass-course-card')).toHaveAttribute('href', '/programmes/everyday-kazakh');
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(225)] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(255)] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(page.locator('.direction-compass')).not.toHaveClass(/is-dragging/);
  await expect(slider).toHaveAttribute('aria-valuenow', '3');
  // A swipe in the page margin must still scroll normally.
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 10, y: 650 }] });
  for (const y of [600, 550, 500, 450]) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 10, y }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore);
  await session.detach();
});
