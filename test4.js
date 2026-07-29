const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));
  const R = {};

  // 1) 本地模式正常运行（没有 Firebase 配置）
  R.hasFirebaseSDK = await page.evaluate(() => typeof firebase !== 'undefined');
  R.localModeWorks = await page.evaluate(() => Store.get().recipes.length > 0);

  // 2) 我的页 - 云同步入口
  await page.evaluate(() => document.querySelector('[data-tab="mine"]').click());
  await new Promise(r => setTimeout(r, 200));
  R.syncStatus = await page.evaluate(() => document.getElementById('syncStatus').textContent);
  R.syncBtn = await page.evaluate(() => !!document.getElementById('btnSetupSync'));

  // 3) 点设置 → 弹窗出现
  await page.evaluate(() => document.getElementById('btnSetupSync').click());
  await new Promise(r => setTimeout(r, 250));
  R.modalTitle = await page.evaluate(() => document.getElementById('modalTitle').textContent);
  R.hasConfigInput = await page.evaluate(() => !!document.querySelector('.modal__body textarea'));
  R.hasHelpText = await page.evaluate(() => document.querySelector('.modal__body').textContent.indexOf('Firebase Console') > -1);

  // 关闭弹窗
  await page.evaluate(() => document.querySelector('#modal [data-close]').click());
  await new Promise(r => setTimeout(r, 100));

  // 4) 验证所有原有功能未受影响（点菜筛选）
  await page.evaluate(() => document.querySelector('[data-tab="order"]').click());
  await new Promise(r => setTimeout(r, 200));
  R.orderFilters = await page.evaluate(() =>
    [...document.querySelectorAll('.ofilter')].map(b => b.querySelector('.ofilter__label').textContent)
  );

  console.log(JSON.stringify(R, null, 2));
  await browser.close();
})();
