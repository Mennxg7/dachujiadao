const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));

  const R = {};

  // 左侧分类标签
  R.orderFilters = await page.evaluate(() =>
    [...document.querySelectorAll('.ofilter')].map(b => ({
      label: b.querySelector('.ofilter__label').textContent,
      value: b.dataset.cat
    }))
  );

  // 菜谱卡片内联标签（厨房）
  await page.evaluate(() => document.querySelector('[data-tab="mine"]').click());
  await new Promise(r => setTimeout(r, 150));
  await page.evaluate(() => document.querySelector('[data-goto="kitchen"]').click());
  await new Promise(r => setTimeout(r, 250));
  R.kitchenTags = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#recipeList .recipe-card__name')].slice(0, 3);
    return cards.map(c => c.textContent);
  });

  // 新增菜谱标签多选框
  await page.evaluate(() => document.getElementById('btnAddRecipe').click());
  await new Promise(r => setTimeout(r, 250));
  R.tagCheckboxes = await page.evaluate(() => {
    const wrap = [...document.querySelectorAll('.form-field')].find(f => f.querySelector('label') && f.querySelector('label').textContent === '标签');
    return [...wrap.querySelectorAll('.check')].map(l => l.textContent.trim());
  });

  // 按新标签筛选点菜
  await page.evaluate(() => document.querySelector('#modal [data-close]').click());
  await new Promise(r => setTimeout(r, 100));
  await page.evaluate(() => document.getElementById('btnBackFromKitchen').click());
  await new Promise(r => setTimeout(r, 100));
  await page.evaluate(() => document.querySelector('[data-tab="order"]').click());
  await new Promise(r => setTimeout(r, 200));
  R.defaultCatalogCount = await page.evaluate(() => document.querySelectorAll('#orderCatalog .dish-card').length);

  // 点"肉肉"筛选
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.ofilter')].find(b => b.querySelector('.ofilter__label').textContent === '肉肉');
    btn && btn.click();
  });
  await new Promise(r => setTimeout(r, 150));
  R.meatCount = await page.evaluate(() => document.querySelectorAll('#orderCatalog .dish-card').length);

  console.log(JSON.stringify(R, null, 2));
  await browser.close();
})();
