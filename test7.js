const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));

  // 直接看"全部"下所有菜名
  const all = await page.evaluate(() => [...document.querySelectorAll('#orderCatalog .dish-card__name')].map(e => e.textContent));
  console.log('全部(' + all.length + '道):', all.join(', '));

  // 切到"菜菜"
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.ofilter')].find(b => b.querySelector('.ofilter__label').textContent === '菜菜');
    btn && btn.click();
  });
  await new Promise(r => setTimeout(r, 150));
  const cai = await page.evaluate(() => [...document.querySelectorAll('#orderCatalog .dish-card__name')].map(e => e.textContent));
  console.log('菜菜(' + cai.length + '道):', cai.join(', '));

  // 切到"肉肉"
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.ofilter')].find(b => b.querySelector('.ofilter__label').textContent === '肉肉');
    btn && btn.click();
  });
  await new Promise(r => setTimeout(r, 150));
  const rou = await page.evaluate(() => [...document.querySelectorAll('#orderCatalog .dish-card__name')].map(e => e.textContent));
  console.log('肉肉(' + rou.length + '道):', rou.join(', '));

  // 切到"减脂"
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.ofilter')].find(b => b.querySelector('.ofilter__label').textContent === '减脂');
    btn && btn.click();
  });
  await new Promise(r => setTimeout(r, 150));
  const jian = await page.evaluate(() => [...document.querySelectorAll('#orderCatalog .dish-card__name')].map(e => e.textContent));
  console.log('减脂(' + jian.length + '道):', jian.join(', '));

  // 切到"水果"
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.ofilter')].find(b => b.querySelector('.ofilter__label').textContent === '水果');
    btn && btn.click();
  });
  await new Promise(r => setTimeout(r, 150));
  const fruit = await page.evaluate(() => [...document.querySelectorAll('#orderCatalog .dish-card__name')].map(e => e.textContent));
  console.log('水果(' + fruit.length + '道):', fruit.join(', '));

  await browser.close();
})();
