const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));

  // 点菜页
  await page.screenshot({ path: '/workspace/shot_order.png' });

  // 我的页
  await page.evaluate(() => document.querySelector('[data-tab="mine"]').click());
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: '/workspace/shot_mine.png' });

  // 厨房（验证3按钮 + 配图置空占位）
  await page.evaluate(() => document.querySelector('[data-goto="kitchen"]').click());
  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: '/workspace/shot_kitchen.png' });

  // 注入一条食记并进入详情
  await page.evaluate(() => {
    document.getElementById('btnBackFromKitchen').click();
    Store.addDiary({ date: Store.today(), dishes: [
      { name: '红烧肉', tags: ['荤菜'], count: 2, cover: '' },
      { name: '西红柿炒蛋', tags: ['素菜'], count: 1, cover: '' },
      { name: '紫菜蛋花汤', tags: ['汤类'], count: 1, cover: '' }
    ]});
    Store.persist();
    document.querySelector('[data-tab="mine"]').click();
  });
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => document.querySelector('#diaryList .mine-row--link').click());
  await new Promise(r => setTimeout(r, 250));
  await page.screenshot({ path: '/workspace/shot_diary.png' });

  await browser.close();
  console.log('shots done');
})();
