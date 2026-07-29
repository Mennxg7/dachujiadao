const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));
  // 厨房（内联标签）
  await page.evaluate(() => document.querySelector('[data-tab="mine"]').click());
  await new Promise(r => setTimeout(r, 150));
  await page.evaluate(() => document.querySelector('[data-goto="kitchen"]').click());
  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: '/workspace/shot_kitchen2.png' });
  // 新增菜谱表单（多标签多选框）
  await page.evaluate(() => document.getElementById('btnAddRecipe').click());
  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: '/workspace/shot_form.png' });
  // "我的"页（家庭输入框显示蘑菇屋，顶部无家庭）
  await page.evaluate(() => document.querySelector('#modal [data-close]').click());
  await new Promise(r => setTimeout(r, 100));
  await page.evaluate(() => document.getElementById('btnBackFromKitchen').click());
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: '/workspace/shot_mine2.png' });
  await browser.close();
  console.log('done');
})();
