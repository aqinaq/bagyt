import {test,expect} from '@playwright/test';
for(const lang of ['kk','ru'] as const){
 test(`${lang}: filter, compare, course and consultation`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');if(lang==='ru')await page.locator('.header-actions').getByRole('button',{name:'РУС'}).click();
  const explorer=page.locator('#programmes');await explorer.scrollIntoViewIfNeeded();
  await explorer.getByRole('button',{name:lang==='kk'?'Тілдер':'Языки',exact:true}).click();await expect(explorer.locator('.programme-row')).toHaveCount(3);
  await explorer.getByRole('combobox').selectOption('online');await expect(explorer.locator('.programme-row')).toHaveCount(3);
  await explorer.locator('.compare-button').nth(0).click();await explorer.locator('.compare-button').nth(1).click();
  await explorer.locator('.compare-button').nth(2).click();await expect(page.locator('.toast')).toBeVisible();
  await page.locator('.comparison-tray').getByRole('button',{name:lang==='kk'?'Салыстыру':'Сравнить',exact:true}).click();
  const dialog=page.getByRole('dialog');await expect(dialog.locator('.comparison-line')).toHaveCount(7);
  await expect(dialog.locator('.comparison-line').first()).toContainText(lang==='kk'?'Кімге арналған':'Кому подойдёт');
  await dialog.locator('.comparison-head a').first().click();await expect(page).toHaveURL(/\/programmes\/general-english/);
  await page.reload();await expect(page.locator('html')).toHaveAttribute('lang',lang);
  await page.locator('.course-content details').first().locator('summary').click();await expect(page.locator('.course-content details').first()).toHaveAttribute('open','');
  await page.locator('.course-summary').getByRole('button',{name:lang==='kk'?'Кеңес алу':'Консультация',exact:true}).click();
  await expect(dialog.getByRole('combobox')).toHaveValue('general-english');
  await dialog.locator('button[type="submit"]').click();await expect(dialog.locator('[aria-invalid=true]')).toHaveCount(2);
  await dialog.locator('input[autocomplete="given-name"]').fill('Демо Аты');await dialog.locator('input[type=tel]').fill('+7 (700) 123-45-67');
  const other=lang==='kk'?'ru':'kk';await dialog.getByRole('button',{name:other==='ru'?'РУС':'ҚАЗ'}).click();
  await expect(dialog.locator('input[autocomplete="given-name"]')).toHaveValue('Демо Аты');await expect(dialog.getByRole('combobox')).toHaveValue('general-english');
  await dialog.getByRole('button',{name:lang==='kk'?'ҚАЗ':'РУС'}).click();await dialog.locator('button[type="submit"]').click();
  await expect(dialog.locator('.review-summary')).toContainText('Демо Аты');await dialog.getByRole('button',{name:lang==='kk'?'Демо өтінімді аяқтау':'Завершить демо-заявку'}).click();
  await expect(dialog.getByRole('status')).toHaveText(lang==='kk'?'Бұл — демо. Өтінім ешқайда жіберілген жоқ.':'Это демо. Заявка никуда не отправлена.');
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('123-45');
  await dialog.locator('.success-state .button').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
 });
 test(`${lang}: finder, empty state, routes and responsive layout`,async({page},testInfo)=>{
  await page.goto('/');if(lang==='ru')await page.locator('.header-actions').getByRole('button',{name:'РУС'}).click();await page.evaluate(()=>document.fonts.ready);for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await expect(img).toHaveJSProperty('complete',true)}await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`tests/screenshots/${testInfo.project.name}-${lang}-home.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0))).toBe(true);
  const explorer=page.locator('#programmes');await explorer.getByRole('button',{name:'Дизайн',exact:true}).click();await explorer.getByRole('combobox').selectOption('online');await expect(explorer.locator('.empty-state')).toBeVisible();await explorer.locator('.empty-state button').click();await expect(explorer.locator('.programme-row')).toHaveCount(4);
  await page.locator('.hero-buttons button').click();const d=page.getByRole('dialog');
  await d.locator('.finder-options button').nth(1).click();await d.locator('.form-actions .button').click();await d.locator('.finder-options button').nth(0).click();await d.locator('.form-actions .button').click();await d.locator('.finder-options button').nth(0).click();await d.locator('.form-actions .button').click();await expect(d.locator('h2')).toHaveText(lang==='kk'?'Дәл сәйкес бағдарлама табылмады.':'Точного совпадения пока нет.');
  await d.locator('.form-actions .text-button').click();await d.locator('.form-actions .text-button').click();await d.locator('.finder-options button').nth(2).click();await d.locator('.form-actions .button').click();await d.locator('.form-actions .button').click();await expect(d.locator('h2')).toHaveText(lang==='kk'?'IELTS-ке дайындық':'Подготовка к IELTS');
  await page.screenshot({path:`tests/screenshots/${testInfo.project.name}-${lang}-finder.png`});
  await page.keyboard.press('Escape');await expect(d).not.toBeVisible();
  for(const id of ['general-english','ielts','everyday-kazakh','interior-design']){await page.goto(`/programmes/${id}`);await expect(page.locator('.course-summary')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
  await page.screenshot({path:`tests/screenshots/${testInfo.project.name}-${lang}-course.png`,fullPage:true});
 });
}
test('dialog keyboard focus and menu',async({page},testInfo)=>{await page.goto('/');await page.locator('.hero-buttons button').click();const dialog=page.getByRole('dialog');for(let i=0;i<16;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog'))).toBe(true)}await page.keyboard.press('Escape');await expect(page.locator('.hero-buttons button')).toBeFocused();if(testInfo.project.name==='mobile'){await page.getByRole('button',{name:'Мәзір',exact:true}).click();await dialog.getByRole('link',{name:'Оқу тәсілі'}).click();await expect(dialog).not.toBeVisible();await expect(page).toHaveURL(/#approach$/)}});
