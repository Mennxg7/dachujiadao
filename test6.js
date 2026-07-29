const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', m => console.log('PAGE:', m.text()));
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));

  // 进入厨房，编辑第一道菜（红烧肉），标签从"肉肉"改成"肉肉+饭面"
  await page.evaluate(() => document.querySelector('[data-tab="mine"]').click());
  await new Promise(r => setTimeout(r, 150));
  await page.evaluate(() => document.querySelector('[data-goto="kitchen"]').click());
  await new Promise(r => setTimeout(r, 200));

  // 点第一个"编辑"
  await page.evaluate(() => {
    const editBtn = document.querySelector('#recipeList .recipe-card .recipe-card__acts button[data-act="edit"]');
    editBtn && editBtn.click();
  });
  await new Promise(r => setTimeout(r, 250));

  // 修改标签：勾选"饭面"（原来只有肉肉）
  await page.evaluate(() => {
    const wrap = [...document.querySelectorAll('.form-field')].find(f => f.querySelector('label') && f.querySelector('label').textContent === '标签');
    const cbs = wrap.querySelectorAll('input[type=checkbox]');
    // 保持肉肉勾选，加勾饭面
    cbs[3].checked = true; // 饭面
    // 点保存
    const save = [...document.querySelectorAll('.modal__body .btn--primary')].find(b => b.textContent === '保存');
    save && save.click();
  });
  await new Promise(r => setTimeout(r, 300));

  // 回到点菜页，查看肉肉和饭面分类下的菜
  await page.evaluate(() => document.getElementById('btnBackFromKitchen').click());
  await new Promise(r => setTimeout(r, 100));
  await page.evaluate(() => document.querySelector('[data-tab="order"]').click());
  await new Promise(r => setTimeout(r, 200));

  // 看肉肉分类
  const R = {};
  R.allNames = await page.evaluate(() => [...document.querySelectorAll('#orderCatalog .dish-card__name')].map(e => e.textContent));
  console.log('ALL NAMES:', JSON.stringify(R.allNames));

  // 切换到饭面看有没有红烧肉
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.ofilter')].find(b => b.querySelector('.ofilter__label').textContent === '饭面');
    btn && btn.click();
  });
  await new Promise(r => setTimeout(r, 150));
  R.fanmianNames = await page.evaluate(() => [...document.querySelectorAll('#orderCatalog .dish-card__name')].map(e => e.textContent));
  console.log('饭面:', JSON.stringify(R.fanmianNames));

  await browser.close();
})();
