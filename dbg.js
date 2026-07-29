const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', m => console.log('PAGE:', m.text()));
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => document.querySelector('[data-tab="mine"]').click());
  await new Promise(r => setTimeout(r, 150));
  await page.evaluate(() => document.querySelector('[data-goto="kitchen"]').click());
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => document.getElementById('btnAddRecipe').click());
  await new Promise(r => setTimeout(r, 200));
  const btns = await page.evaluate(() => [...document.querySelectorAll('.modal__body button')].map(b => ({t:b.textContent, cls:b.className})));
  console.log('BUTTONS:', JSON.stringify(btns, null, 2));
  const before = await page.evaluate(() => Store.get().recipes.length);
  await page.evaluate(() => {
    const nameInp = document.querySelector('.modal__body input');
    nameInp.value = '测试双拼菜';
    const wrap = [...document.querySelectorAll('.form-field')].find(f => f.querySelector('label') && f.querySelector('label').textContent === '标签');
    const cbs = wrap.querySelectorAll('input[type=checkbox]');
    cbs[0].checked = true; cbs[1].checked = true;
    const save = [...document.querySelectorAll('.modal__body button')].find(b => b.textContent.trim() === '保存');
    // 直接调用保存
    if (save) save.click(); else console.log('NO SAVE BTN');
  });
  await new Promise(r => setTimeout(r, 300));
  const after = await page.evaluate(() => ({ len: Store.get().recipes.length, modalHidden: document.getElementById('modal').hidden, last: Store.get().recipes.slice(-1)[0] && Store.get().recipes.slice(-1)[0].name }));
  console.log('before:', before, 'after:', JSON.stringify(after));
  await browser.close();
})();
