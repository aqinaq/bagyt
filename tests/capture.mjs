import { chromium } from '@playwright/test';
const browser=await chromium.launch();
for(const [name,width,height,lang] of [['desktop',1440,1000,'kk'],['mobile',360,800,'kk'],['desktop-ru',1440,1000,'ru']]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4178');if(lang==='ru')await page.locator('.header-actions').getByRole('button',{name:'РУС'}).click();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`tests/screenshots/${name}-viewport.png`});
 await page.locator('.direction-compass').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
 await page.locator('.direction-compass').screenshot({path:`tests/screenshots/${name}-compass.png`});
 for(const section of ['programmes','approach','faq']){const element=page.locator(`#${section}`);await element.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));await element.screenshot({path:`tests/screenshots/${name}-${section}.png`});}
 if(name==='mobile'){await page.locator('.programme-actions .compare-button').nth(0).click();await page.locator('.programme-actions .compare-button').nth(3).click();await page.locator('.comparison-tray>.button').click();await page.screenshot({path:'tests/screenshots/mobile-comparison.png'});}
 await page.close();
}
await browser.close();
