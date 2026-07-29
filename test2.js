const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('file:///workspace/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));
  const R = {};

  R.title = await page.evaluate(() => document.getElementById('headerTitle').textContent);
  R.familyInHeader = await page.evaluate(() => !!document.getElementById('headerSub'));

  // 进入厨房，新增菜谱，检查标签为多选框
  await page.evaluate(() => document.querySelector('[data-tab="mine"]').click());
  await new Promise(r => setTimeout(r, 150));
  R.familyDefaultValue = await page.evaluate(() => document.getElementById('familyName').value);
  await page.evaluate(() => document.querySelector('[data-goto="kitchen"]').click());
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => document.getElementById('btnAddRecipe').click());
  await new Promise(r => setTimeout(r, 200));
  R.tagIsCheckbox = await page.evaluate(() => {
    const wrap = [...document.querySelectorAll('.form-field')].find(f => f.querySelector('label') && f.querySelector('label').textContent === '标签');
    if (!wrap) return false;
    const inputs = wrap.querySelectorAll('input[type=checkbox]');
    return { count: inputs.length, values: [...inputs].map(i => i.value) };
  });
  // 选两个标签后保存，回到厨房看名称后是否带标签
  await page.evaluate(() => {
    const wrap = [...document.querySelectorAll('.form-field')].find(f => f.querySelector('label') && f.querySelector('label').textContent === '标签');
    const cbs = wrap.querySelectorAll('input[type=checkbox]');
    cbs[0].checked = true; cbs[1].checked = true; // 荤菜, 素菜
    const nameInp = document.querySelector('.modal__body input');
    nameInp.value = '测试双拼菜';
    [...document.querySelectorAll('.modal__body .btn--primary')].forEach(b => { if (b.textContent === '保存') b.click(); });
  });
  await new Promise(r => setTimeout(r, 250));
  R.kitchenHasNew = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#recipeList .recipe-card')];
    const c = cards.find(c => c.querySelector('.recipe-card__name').textContent.indexOf('测试双拼菜') >= 0);
    if (!c) return null;
    const name = c.querySelector('.recipe-card__name').innerHTML;
    return { nameHtml: name, hasInlineTags: /<span class="tag">/.test(name) };
  });

  console.log(JSON.stringify(R, null, 2));
  await browser.close();
})();
