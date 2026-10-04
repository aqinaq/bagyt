import { test, expect } from '@playwright/test';

test('scroll route tracks the page, jumps to sections, and cleans up on navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const route = page.getByRole('navigation', { name: 'Бет бөлімдері' });
  await expect(route).not.toBeVisible();
  await page.locator('#programmes').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(route).toBeVisible();
  await expect(route.getByRole('link', { name: 'Бағдарламалар', exact: true })).toHaveAttribute('aria-current', 'location');
  const before = await page.locator('.scroll-percentage').innerText();
  await route.getByRole('link', { name: 'Сұрақтар', exact: true }).click();
  await expect(page).toHaveURL(/#faq$/);
  await expect(route.getByRole('link', { name: 'Сұрақтар', exact: true })).toHaveAttribute('aria-current', 'location');
  await expect.poll(async () => parseInt(await page.locator('.scroll-percentage').innerText())).toBeGreaterThan(parseInt(before));
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(page.locator('.scroll-percentage')).toHaveText('100%');
  await route.getByRole('link', { name: 'Бастау', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(125);
  await page.locator('.compass-course-card').click();
  await expect(page).toHaveURL(/\/programmes\/general-english/);
  await expect(page.locator('.scroll-experience')).toHaveCount(0);
});

test('scroll typography follows movement and respects reduced motion', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const ribbon = page.locator('.scroll-ribbon');
  await ribbon.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'end' }));
  await expect.poll(() => ribbon.evaluate(el => el.style.getPropertyValue('--ribbon-shift'))).not.toBe('');
  const initial = await ribbon.evaluate(el => el.style.getPropertyValue('--ribbon-shift'));
  await page.evaluate(() => window.scrollBy({ top: 160, behavior: 'instant' }));
  await expect.poll(() => ribbon.evaluate(el => el.style.getPropertyValue('--ribbon-shift'))).not.toBe(initial);
  await page.screenshot({ path: `tests/screenshots/${testInfo.project.name}-scroll-ribbon.png` });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('.scroll-ribbon-track').evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await page.locator('#approach').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(page.locator('.scroll-stop.is-current')).toHaveAttribute('href', '#approach');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `tests/screenshots/${testInfo.project.name}-scroll-journey.png` });
  await page.locator('.scroll-journey').getByRole('link', { name: 'Бастау', exact: true }).click();
  await page.locator('.header-actions').getByRole('button', { name: 'РУС' }).click();
  await page.locator('#programmes').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(page.getByRole('navigation', { name: 'Разделы страницы' })).toBeVisible();
  await expect(page.locator('.scroll-stop.is-current')).toHaveAttribute('aria-label', 'Программы');
});
