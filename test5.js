const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));

  // 点菜页"全部"状态
  const R = {};
  R.recipeCount = await page.evaluate(() => Store.get().recipes.length);
  R.orderCatCount = await page.evaluate(() => document.querySelectorAll('#orderCatalog .dish-card').length);
  R.groupHeaders = await page.evaluate(() =>
    [...document.querySelectorAll('#orderCatalog .cat-header')].map(h => h.textContent)
  );
  // 每个分组的菜品数
  R.groupCounts = await page.evaluate(() => {
    const result = {};
    const headers = [...document.querySelectorAll('#orderCatalog .cat-header')];
    headers.forEach(h => {
      let next = h.nextElementSibling;
      let cnt = 0;
      while (next && next.classList.contains('dish-grid')) {
        cnt = next.querySelectorAll('.dish-card').length;
        next = next.nextElementSibling;
      }
      result[h.textContent] = cnt;
    });
    return result;
  });

  // 检查哪些菜没有标签或标签不在已知列表
  R.untagged = await page.evaluate(() => {
    const known = ['肉肉','菜菜','饭面','减脂','水果','汤类'];
    return Store.get().recipes.filter(r => !r.tags || !r.tags.length || !r.tags.some(t => known.includes(t))).map(r => r.name);
  });

  console.log(JSON.stringify(R, null, 2));
  await browser.close();
})();
