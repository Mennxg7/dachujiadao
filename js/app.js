/* ===========================================================
 * 小厨神驾到 · 主逻辑（UI 渲染 + 交互）
 * =========================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var el = function (tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var CATEGORIES = ['肉类', '蔬菜', '水果', '蛋奶', '其他'];

  /* 点菜页左侧分类定义 */
  var ORDER_CATS = [
    { icon: '🔍', label: '全部', value: '全部' },
    { icon: '🍜', label: '饭面', value: '饭面' },
    { icon: '🥩', label: '肉类', value: '荤菜' },
    { icon: '🥬', label: '菜菜', value: '素菜' },
    { icon: '🍓', label: '水果', value: '减脂' },
    { icon: '🍲', label: '汤类', value: '汤类' }
  ];

  /* 分类 → emoji 映射（用于菜单/食记分组标题） */
  var CAT_ICON_MAP = { '荤菜':'🥩', '素菜':'🥬', '减脂':'🥗', '汤类':'🍲', '饭面':'🍜', '早餐':'🍳', '主食':'🍚', '水果':'🍓', '甜甜':'🍰', '家常菜':'🏠' };

  /* 取菜谱主分类（用于配色/水彩占位） */
  function primaryCat(r) { return (r && r.tags && r.tags[0]) || '其他'; }

  /* 水彩风格手绘美食占位图（按分类着色，柔和晕染感） */
  var WATERCOLOR_MAP = {
    '荤菜': '#d98b5a', '素菜': '#8bbf6a', '饭面': '#e8c46a',
    '汤类': '#e0a06a', '减脂': '#e88a8a', '水果': '#e88a8a', '其他': '#cbb08a'
  };
  function watercolorCover(cat) {
    var c = WATERCOLOR_MAP[cat] || WATERCOLOR_MAP['其他'];
    return '<svg class="wc-svg" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100" height="75" fill="#fdf6ec"/>' +
      '<ellipse cx="50" cy="44" rx="30" ry="20" fill="' + c + '" opacity="0.22"/>' +
      '<ellipse cx="45" cy="40" rx="20" ry="14" fill="' + c + '" opacity="0.32"/>' +
      '<ellipse cx="55" cy="46" rx="15" ry="10" fill="' + c + '" opacity="0.28"/>' +
      '<ellipse cx="50" cy="53" rx="36" ry="13" fill="#ffffff"/>' +
      '<ellipse cx="50" cy="53" rx="36" ry="13" fill="none" stroke="#e8dcc8" stroke-width="1.5"/>' +
      '<path d="M42 30 q5 -7 0 -14" stroke="#c9b8a0" stroke-width="1.4" fill="none" opacity="0.5"/>' +
      '<path d="M58 30 q5 -7 0 -14" stroke="#c9b8a0" stroke-width="1.4" fill="none" opacity="0.5"/>' +
    '</svg>';
  }

  /* 当前页面 */
  var currentTab = 'order';

  /* ---------------- 导航 ---------------- */
  function switchTab(tab) {
    // 隐藏所有 page
    $$('.page').forEach(function (p) { p.hidden = true; });
    // 显示目标 page
    var target = $('[data-page="' + tab + '"]');
    if (target) target.hidden = false;

    // tab 高亮
    $$('.tab').forEach(function (b) { b.classList.toggle('tab--active', b.dataset.tab === tab); });

    // header
    $('#headerTitle').textContent = '小厨神驾到';
    $('#headerSub').textContent = '家庭：' + (Store.get().family.name || '未命名');

    currentTab = tab;

    if (tab === 'order') renderOrder();
    if (tab === 'fridge') renderFridge();
    if (tab === 'mine') { renderMine(); renderDiary(); }
    if (tab === 'kitchen') renderKitchen();
  }

  /* 进入子页面（厨房等） */
  function goToSubPage(page) {
    $$('.page').forEach(function (p) { p.hidden = true; });
    var target = $('[data-page="' + page + '"]');
    if (target) target.hidden = false;
    $$('.tab').forEach(function (b) { b.classList.remove('tab--active'); });
    if (page === 'kitchen') renderKitchen();
  }

  /* ---------------- 弹窗 ---------------- */
  function openModal(title, bodyNode) {
    $('#modalTitle').textContent = title;
    var body = $('#modalBody'); body.innerHTML = ''; body.appendChild(bodyNode);
    $('#modal').hidden = false;
  }
  function closeModal() { $('#modal').hidden = true; $('#modalBody').innerHTML = ''; }

  /* ---------------- 今日菜单 Sheet ---------------- */
  function openTodaySheet() {
    renderTodaySheet();
    $('#todaySheet').hidden = false;
  }
  function closeTodaySheet() { $('#todaySheet').hidden = true; }

  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(t._t); t._t = setTimeout(function () { t.hidden = true; }, 1600);
  }

  /* ---------------- 通用表单 ---------------- */
  function field(label, inputNode) {
    var wrap = el('div', 'form-field');
    var l = el('label'); l.textContent = label;
    wrap.appendChild(l); wrap.appendChild(inputNode);
    return wrap;
  }
  function input(attrs) {
    var i = el('input', 'input');
    Object.keys(attrs || {}).forEach(function (k) { i[k] = attrs[k]; });
    return i;
  }
  function select(options, value) {
    var s = el('select', 'input');
    options.forEach(function (o) {
      var op = el('option'); op.value = o; op.textContent = o;
      if (o === value) op.selected = true; s.appendChild(op);
    });
    return s;
  }

  function updateCart() {
    var c = $('#cartCount'); if (c) c.textContent = Store.get().menu.length;
  }

  /* =========================================================
   *  1. 点菜页
   * ========================================================= */
  var orderCat = '全部';

  function buildOrderFilters() {
    var aside = $('#orderFilters'); aside.innerHTML = '';
    ORDER_CATS.forEach(function (c) {
      var btn = el('button', 'ofilter' + (c.value === orderCat ? ' ofilter--active' : ''), '');
      btn.dataset.cat = c.value;
      btn.innerHTML = '<span class="ofilter__icon">' + c.icon + '</span><span class="ofilter__label">' + c.label + '</span>';
      aside.appendChild(btn);
    });
  }

  function renderOrder() {
    var d = Store.get();
    updateCart();
    if (!$('#orderFilters').children.length) buildOrderFilters();

    var cat = $('#orderCatalog'); cat.innerHTML = '';
    var list = d.recipes.filter(function (r) {
      if (orderCat === '全部') return true;
      return (r.tags || []).indexOf(orderCat) >= 0;
    });
    if (!list.length) {
      cat.appendChild(el('div', 'empty', '该分类下还没有菜谱～\n点"我的"→"厨房"去添加吧'));
      return;
    }

    var groups = {};
    list.forEach(function (r) {
      var tag = (r.tags || [])[0] || '其他';
      (groups[tag] = groups[tag] || []).push(r);
    });

    Object.keys(groups).forEach(function (tag) {
      var header = el('div', 'cat-header');
      header.innerHTML = '<span class="cat-header__icon">' + (CAT_ICON_MAP[tag] || '🍽️') + '</span>' + esc(tag);
      cat.appendChild(header);

      var grid = el('div', 'dish-grid');
      groups[tag].forEach(function (r) {
        var card = el('div', 'dish-card');

        if (r.cover) {
          var img = el('img', 'dish-card__img'); img.src = r.cover; img.alt = r.name;
          card.appendChild(img);
        } else {
          var ph = el('div', 'dish-card__img dish-card__img--ph');
          ph.innerHTML = watercolorCover(primaryCat(r));
          card.appendChild(ph);
        }

        var body = el('div', 'dish-card__body');
        body.innerHTML =
          '<div class="dish-card__name">' + esc(r.name) + '</div>' +
          '<div class="dish-card__ings">' + esc(ingSummary(r.ingredients)) + '</div>';
        card.appendChild(body);

        var addBtn = el('button', 'dish-card__add', '+');
        addBtn.dataset.act = 'catalog-add';
        addBtn.dataset.id = r.id;
        card.appendChild(addBtn);

        var viewArea = el('div', '');
        viewArea.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:36px;cursor:pointer;';
        viewArea.dataset.act = 'catalog-view';
        viewArea.dataset.id = r.id;
        card.style.position = 'relative';
        card.insertBefore(viewArea, body);

        grid.appendChild(card);
      });
      cat.appendChild(grid);
    });
  }

  function ingSummary(ings) {
    if (!ings || !ings.length) return '暂无食材';
    return ings.slice(0, 3).map(function (i) { return i.name + (i.amount ? i.amount + (i.unit || '') : ''); }).join(' · ') + (ings.length > 3 ? ' …' : '');
  }

  /** 加购：加入今日菜单（如果已存在则 count+1） */
  function addToOrder(rid) {
    var d = Store.get();
    var r = d.recipes.find(function (x) { return x.id === rid; }); if (!r) return;

    // 检查是否已在菜单中
    var existing = d.menu.find(function (o) { return o.recipeId === rid && o.date === Store.today(); });
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      Store.persist(); updateCart();
      toast('＋1 ' + r.name);
    } else {
      Store.addMenuItem({ recipeId: r.id, name: r.name, orderedBy: (d.members[0] || {}).id || '', count: 1 });
      Store.persist(); updateCart();
      toast('已加购：' + r.name);
    }
  }

  /** 从菜单中移除一道菜（count 减到 0 则删除） */
  function removeFromOrder(mid) {
    var d = Store.get();
    var item = d.menu.find(function (o) { return o.id === mid; });
    if (!item) return;
    if ((item.count || 1) <= 1) {
      Store.removeMenuItem(mid);
    } else {
      item.count--;
      Store.updateMenuItem(mid, { count: item.count });
    }
    Store.persist(); updateCart();
    renderTodaySheet();
  }

  /** 渲染今日菜单面板内容 */
  function renderTodaySheet() {
    var d = Store.get();
    var body = $('#sheetBody'); body.innerHTML = '';

    var todayItems = d.menu.filter(function (o) { return o.date === Store.today(); });

    if (!todayItems.length) {
      body.appendChild(el('div', 'menu-empty', '今天还没有点菜～\n去点菜页挑选吧 🍽️'));
      return;
    }

    // 按菜谱标签分组
    var groups = {};
    todayItems.forEach(function (o) {
      var r = d.recipes.find(function (x) { return x.id === o.recipeId; });
      var tag = (r && r.tags && r.tags[0]) || '其他';
      (groups[tag] = groups[tag] || []).push(o);
    });

    Object.keys(groups).forEach(function (tag) {
      // 分组标题
      var gtitle = el('div', 'menu-group-title');
      gtitle.innerHTML = '<span class="menu-group-icon">' + (CAT_ICON_MAP[tag] || '🍽️') + '</span>' + esc(tag);
      body.appendChild(gtitle);

      // 每道菜的行
      groups[tag].forEach(function (o) {
        var r = d.recipes.find(function (x) { return x.id === o.recipeId; });
        var row = el('div', 'menu-row');

        // 封面图
        if (r && r.cover) {
          var img = el('img', 'menu-row__img'); img.src = r.cover;
          row.appendChild(img);
        } else {
          var ph = el('div', 'menu-row__img'); ph.innerHTML = watercolorCover(primaryCat(r));
          row.appendChild(ph);
        }

        // 菜名
        row.appendChild(el('div', 'menu-row__name', esc(o.name)));

        // 数量控制器
        var qty = el('div', 'qty');
        var cnt = o.count || 1;

        var minus = el('button', 'qty__btn', '−');
        minus.onclick = function (e) { e.stopPropagation(); removeFromOrder(o.id); };

        var num = el('span', 'qty__num', String(cnt));

        var plus = el('button', 'qty__btn', '+');
        plus.onclick = function (e) { e.stopPropagation(); addToOrder(o.recipeId); };

        qty.appendChild(minus); qty.appendChild(num); qty.appendChild(plus);
        row.appendChild(qty);

        body.appendChild(row);
      });
    });
  }

  /** 保存当前菜单为食记 */
  function saveToDiary() {
    var d = Store.get();
    var todayItems = d.menu.filter(function (o) { return o.date === Store.today(); });
    if (!todayItems.length) { toast('还没有点菜，无法保存'); return; }

    var dishes = todayItems.map(function (o) {
      var r = d.recipes.find(function (x) { return x.id === o.recipeId; });
      return {
        recipeId: o.recipeId,
        name: o.name,
        cover: r ? r.cover : '',
        tags: r ? (r.tags || []) : [],
        count: o.count || 1
      };
    });

    Store.addDiary({
      date: Store.today(),
      dishes: dishes,
      createdAt: new Date().toISOString()
    });

    // 清空今日菜单
    todayItems.forEach(function (o) { Store.removeMenuItem(o.id); });
    Store.persist(); updateCart();

    closeTodaySheet();
    toast('已下单，已存入食记 ✨');
    if (currentTab === 'mine') renderDiary();
  }

  /** 采购清单（保留功能） */
  function generateShoppingList() {
    var d = Store.get();
    var need = {};
    d.menu.filter(function (o) { return o.status !== '已做'; }).forEach(function (o) {
      if (!o.recipeId) return;
      var r = d.recipes.find(function (x) { return x.id === o.recipeId; });
      if (!r) return;
      var times = o.count || 1;
      r.ingredients.forEach(function (ing) {
        var key = ing.name + '|' + ing.unit;
        need[key] = (need[key] || 0) + (Number(ing.amount) || 0) * times;
      });
    });
    var missing = [];
    Object.keys(need).forEach(function (key) {
      var p = key.split('|'); var name = p[0], unit = p[1];
      var stock = d.ingredients.filter(function (i) { return i.name === name && i.unit === unit; })
        .reduce(function (s, i) { return s + (Number(i.count) || 0); }, 0);
      var lack = need[key] - stock;
      if (lack > 0) missing.push({ name: name, amount: lack, unit: unit });
    });

    var box = el('div');
    box.appendChild(el('div', 'sub-title', '🛒 还需采购'));
    if (!missing.length) {
      box.appendChild(el('div', 'empty', '🎉 冰箱里的食材足够做这些菜！'));
    } else {
      var sl = el('ul', 'shop-list');
      missing.forEach(function (m) {
        var li = el('li'); li.innerHTML = '<span>' + esc(m.name) + '</span><b>还需 ' + m.amount + ' ' + esc(m.unit) + '</b>';
        sl.appendChild(li);
      });
      box.appendChild(sl);
    }
    openModal('采购清单', box);
  }

  /* =========================================================
   *  2. 冰箱
   * ========================================================= */
  var fridgeCat = '全部';

  function buildFridgeFilters() {
    var bar = $('#fridgeFilters'); if (!bar) return;
    bar.innerHTML = '';
    ['全部'].concat(CATEGORIES).forEach(function (c) {
      var chip = el('button', 'chip' + (c === fridgeCat ? ' chip--active' : ''), c);
      chip.dataset.cat = c;
      bar.appendChild(chip);
    });
  }

  /* 单条食材行 */
  function ingredientRow(i) {
    var expInfo = expireState(i.expire);
    var card = el('div', 'card card--row');
    card.innerHTML =
      '<div class="card__main">' +
        '<div class="card__title">' + esc(i.name) + '</div>' +
        '<div class="card__meta">' + i.count + ' ' + esc(i.unit) + ' · ' + esc(i.location || '—') +
          ' · <span class="' + expInfo.cls + '">' + expInfo.text + '</span></div>' +
      '</div>' +
      '<div class="card__actions">' +
        '<button class="btn btn--sm" data-act="edit" data-id="' + i.id + '">编辑</button>' +
        '<button class="btn btn--sm btn--ghost" data-act="del" data-id="' + i.id + '">删除</button>' +
      '</div>';
    return card;
  }

  function renderFridge() {
    var d = Store.get();
    if (!$('#fridgeFilters').children.length) buildFridgeFilters();

    var q = ($('#fridgeSearch').value || '').trim();
    var items = d.ingredients.filter(function (i) {
      if (q && i.name.indexOf(q) < 0) return false;
      if (fridgeCat !== '全部' && i.category !== fridgeCat) return false;
      return true;
    });

    var list = $('#fridgeList'); list.innerHTML = '';
    if (!items.length) {
      list.appendChild(el('div', 'empty', fridgeCat === '全部' ? '冰箱是空的，点"新增"添加食材吧～' : '这一类还没有食材～'));
      return;
    }

    // 选了具体分类则不再按分类分组（避免重复标题）
    if (fridgeCat !== '全部') {
      items.forEach(function (i) { list.appendChild(ingredientRow(i)); });
      return;
    }

    var groups = {};
    items.forEach(function (i) { (groups[i.category] = groups[i.category] || []).push(i); });
    var cats = CATEGORIES.filter(function (c) { return groups[c] && groups[c].length; });
    cats.forEach(function (cat) {
      list.appendChild(el('div', 'group-title', cat));
      groups[cat].forEach(function (i) { list.appendChild(ingredientRow(i)); });
    });
  }

  function expireState(expire) {
    if (!expire) return { text: '无保质期', cls: '' };
    var days = Math.ceil((new Date(expire) - new Date(Store.today())) / 86400000);
    if (days < 0) return { text: '已过期', cls: 'exp exp--bad' };
    if (days <= 2) return { text: '剩 ' + days + ' 天', cls: 'exp exp--warn' };
    return { text: '剩 ' + days + ' 天', cls: 'exp' };
  }

  function ingredientForm(item) {
    item = item || {};
    var name = input({ value: item.name || '', placeholder: '食材名称' });
    var category = select(CATEGORIES, item.category || '蔬菜');
    var count = input({ type: 'number', value: item.count != null ? item.count : 1, min: 0 });
    var unit = input({ value: item.unit || '个', placeholder: '单位' });
    var expire = input({ type: 'date', value: item.expire || '' });

    // 存放位置：多选框（冷冻 / 冷藏）
    var locBox = el('div', 'checks');
    ['冷冻', '冷藏'].forEach(function (opt) {
      var lab = el('label', 'check');
      var cb = el('input'); cb.type = 'checkbox'; cb.value = opt;
      if ((item.location || '').indexOf(opt) >= 0) cb.checked = true;
      lab.appendChild(cb); lab.appendChild(document.createTextNode(opt));
      locBox.appendChild(lab);
    });

    // 点击数量 / 单位时自动置空，方便重新输入
    count.onfocus = function () { count.value = ''; };
    unit.onfocus = function () { unit.value = ''; };

    var box = el('div');
    [field('名称', name), field('分类', category), field('数量', count),
     field('单位', unit), field('存放位置', locBox), field('保质期（可不填）', expire)].forEach(function (f) { box.appendChild(f); });

    var save = el('button', 'btn btn--primary btn--block', '保存');
    save.onclick = function () {
      var locs = Array.prototype.slice.call(locBox.querySelectorAll('input:checked')).map(function (c) { return c.value; });
      var payload = {
        name: name.value.trim(), category: category.value,
        count: Number(count.value) || 0, unit: unit.value.trim() || '个',
        location: locs.join('+') || '冷藏', expire: expire.value || ''
      };
      if (!payload.name) { toast('请填写名称'); return; }
      if (item.id) Store.updateIngredient(item.id, payload); else Store.addIngredient(payload);
      Store.persist(); closeModal(); renderFridge(); toast('已保存');
    };
    box.appendChild(save);
    return box;
  }

  /* =========================================================
   *  3. 食记页
   * ========================================================= */
  function renderDiary() {
    var d = Store.get();
    var container = $('#diaryList'); if (!container) return;
    container.innerHTML = '';

    if (!d.diary.length) {
      container.appendChild(el('div', 'mine-empty-row', '还没有食记～\n在点菜页选好菜后点"去下单"吧'));
      return;
    }

    d.diary.forEach(function (entry) {
      var card = el('div', 'diary-card');

      // 头部：日期 + 删除
      var head = el('div', 'diary-card__head');
      var dateObj = new Date(entry.date + 'T12:00:00');
      var weekDays = ['日','一','二','三','四','五','六'];
      var badge = el('div', 'diary-date-badge');
      badge.innerHTML = '<span class="diary-date-badge__day">' + dateObj.getDate() + '</span><span class="diary-date-badge__weekday">周' + weekDays[dateObj.getDay()] + '</span>';

      var info = el('div', 'diary-date-info');
      info.innerHTML = '<div class="diary-date-info__label">' + (entry.date === Store.today() ? '今天' : entry.date) + '</div>' +
        '<div class="diary-date-info__sub">共 ' + entry.dishes.length + ' 道菜</div>';

      var delBtn = el('span', 'diary-date-del', '删除');
      delBtn.dataset.did = entry.id;

      head.appendChild(badge); head.appendChild(info); head.appendChild(delBtn);
      card.appendChild(head);

      // 只显示菜名（不显示图片、不按分类）
      var names = entry.dishes.map(function (x) { return x.name; }).join('、');
      card.appendChild(el('div', 'diary-names', esc(names)));

      container.appendChild(card);
    });
  }

  /* =========================================================
   *  4. 厨房页（菜谱管理）
   * ========================================================= */
  function renderKitchen() {
    var d = Store.get();
    var q = ($('#recipeSearch').value || '').trim();
    var items = d.recipes.filter(function (r) {
      if (!q) return true;
      return r.name.indexOf(q) >= 0 || (r.tags || []).some(function (t) { return t.indexOf(q) >= 0; });
    });
    var grid = $('#recipeList'); grid.innerHTML = '';
    if (!items.length) { grid.appendChild(el('div', 'empty', '还没有菜谱，点"新增"添加第一道菜吧～')); return; }

    items.forEach(function (r) {
      var card = el('div', 'recipe-card');
      var cover = r.cover
        ? '<div class="recipe-card__cover" style="background-image:url(' + r.cover + ')"></div>'
        : '<div class="recipe-card__cover recipe-card__cover--ph">' + esc(r.name.slice(0, 1)) + '</div>';
      card.innerHTML =
        cover +
        '<div class="recipe-card__body">' +
          '<div class="recipe-card__name">' + esc(r.name) + '</div>' +
          '<div class="tags">' + (r.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
          '<div class="recipe-card__acts">' +
            '<button class="btn btn--sm btn--ghost" data-act="view" data-id="' + r.id + '">查看</button>' +
            '<button class="btn btn--sm btn--ghost" data-act="edit" data-id="' + r.id + '">编辑</button>' +
            '<button class="btn btn--sm btn--ghost" data-act="del" data-id="' + r.id + '">删除</button>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  function recipeDetail(r) {
    var box = el('div');
    if (r.cover) box.appendChild(el('img', 'detail-cover')).src = r.cover;
    box.appendChild(el('h3', '', esc(r.name)));
    if ((r.tags || []).length) box.appendChild(el('p', 'hint', (r.tags || []).join(' / ')));
    box.appendChild(el('div', 'sub-title', '所需食材'));
    var ul = el('ul', 'shop-list');
    (r.ingredients || []).forEach(function (i) {
      var li = el('li'); li.innerHTML = '<span>' + esc(i.name) + '</span><b>' + (i.amount || '?') + ' ' + esc(i.unit || '') + '</b>';
      ul.appendChild(li);
    });
    box.appendChild(ul);
    box.appendChild(el('div', 'sub-title', '做法'));
    var ol = el('ol', 'steps');
    (r.steps || []).forEach(function (s) {
      var li = el('li'); li.innerHTML = esc(s.text) + (s.image ? '<img class="step-img" src="' + s.image + '">' : '');
      ol.appendChild(li);
    });
    box.appendChild(ol);
    return box;
  }

  function recipeForm(r) {
    r = r || {};
    var name = input({ value: r.name || '', placeholder: '菜名' });
    var tags = input({ value: (r.tags || []).join('、'), placeholder: '标签（如 荤菜、汤类，用、分隔）' });

    var coverInput = input({ type: 'file', accept: 'image/*' });
    var coverPreview = el('div', 'cover-preview');
    if (r.cover) { var im = el('img'); im.src = r.cover; coverPreview.appendChild(im); }
    var coverData = r.cover || '';
    coverInput.onchange = function () {
      var f = coverInput.files[0]; if (!f) return;
      compressImage(f, 480, function (dataUrl) {
        coverData = dataUrl; coverPreview.innerHTML = ''; var im = el('img'); im.src = dataUrl; coverPreview.appendChild(im);
      });
    };

    var ingBox = el('div', 'dyn');
    function addIngRow(ing) {
      ing = ing || {};
      var row = el('div', 'dyn-row');
      var n = input({ value: ing.name || '', placeholder: '食材' });
      var a = input({ value: ing.amount || '', placeholder: '用量', type: 'number' });
      var u = input({ value: ing.unit || '', placeholder: '单位' });
      var del = el('button', 'btn btn--sm btn--ghost', '✕');
      del.onclick = function () { row.remove(); };
      [n, a, u, del].forEach(function (x) { row.appendChild(x); });
      ingBox.appendChild(row);
    }
    (r.ingredients || []).forEach(addIngRow);

    var stepBox = el('div', 'dyn');
    function addStepRow(s) {
      s = s || {};
      var row = el('div', 'dyn-row dyn-row--col');
      var t = input({ value: s.text || '', placeholder: '步骤描述' });
      var del = el('button', 'btn btn--sm btn--ghost', '✕');
      del.onclick = function () { row.remove(); };
      row.appendChild(t); row.appendChild(del);
      stepBox.appendChild(row);
    }
    (r.steps || []).forEach(addStepRow);

    var box = el('div');
    box.appendChild(field('菜名', name));
    box.appendChild(field('标签', tags));
    box.appendChild(field('封面图', coverInput));
    box.appendChild(coverPreview);
    box.appendChild(el('div', 'sub-title', '所需食材 <button class="btn btn--sm" id="addIng">＋</button>'));
    box.appendChild(ingBox);
    box.appendChild(el('div', 'sub-title', '做法步骤 <button class="btn btn--sm" id="addStep">＋</button>'));
    box.appendChild(stepBox);

    var save = el('button', 'btn btn--primary btn--block', '保存');
    save.onclick = function () {
      var ings = $$('.dyn-row', ingBox).map(function (row) {
        var ins = row.querySelectorAll('input');
        return { name: ins[0].value.trim(), amount: Number(ins[1].value) || 0, unit: ins[2].value.trim() };
      }).filter(function (x) { return x.name; });
      var steps = $$('.dyn-row', stepBox).map(function (row) {
        return { text: row.querySelector('input').value.trim(), image: '' };
      }).filter(function (x) { return x.text; });
      var payload = {
        name: name.value.trim(),
        tags: tags.value.split('、').map(function (s) { return s.trim(); }).filter(Boolean),
        cover: coverData, ingredients: ings, steps: steps
      };
      if (!payload.name) { toast('请填写菜名'); return; }
      if (r.id) Store.updateRecipe(r.id, payload); else Store.addRecipe(payload);
      Store.persist(); closeModal(); renderKitchen(); toast('已保存');
    };

    setTimeout(function () {
      var ai = $('#addIng'); if (ai) ai.onclick = function () { addIngRow(); };
      var as = $('#addStep'); if (as) as.onclick = function () { addStepRow(); };
    }, 0);
    return box;
  }

  /* =========================================================
   *  5. 我的
   * ========================================================= */
  function renderMine() {
    var d = Store.get();
    $('#familyName').value = d.family.name || '';
    var list = $('#memberList'); list.innerHTML = '';
    if (!d.members.length) {
      list.appendChild(el('div', 'mine-empty-row', '还没有成员，点右上角"＋ 添加"'));
      return;
    }
    d.members.forEach(function (m) {
      var row = el('div', 'mine-row');
      row.innerHTML =
        '<span class="mine-row__icon">' + (m.avatar || '🙂') + '</span>' +
        '<span class="mine-row__main">' +
          '<span class="mine-row__name">' + esc(m.name) + '</span>' +
          '<span class="mine-row__sub">' + esc(m.role) + '</span>' +
        '</span>' +
        '<button class="btn btn--sm btn--ghost" data-act="del" data-id="' + m.id + '">移除</button>';
      list.appendChild(row);
    });
  }

  function memberForm() {
    var name = input({ placeholder: '成员昵称' });
    var avatar = input({ value: '🙂', placeholder: '头像 emoji' });
    var role = select(['管理员', '成员'], '成员');
    var box = el('div');
    [field('昵称', name), field('头像', avatar), field('角色', role)].forEach(function (f) { box.appendChild(f); });
    var save = el('button', 'btn btn--primary btn--block', '添加');
    save.onclick = function () {
      if (!name.value.trim()) { toast('请填写昵称'); return; }
      Store.addMember({ name: name.value.trim(), avatar: avatar.value.trim() || '🙂', role: role.value });
      Store.persist(); closeModal(); renderMine(); toast('已添加');
    };
    box.appendChild(save);
    return box;
  }

  /* =========================================================
   *  工具：图片压缩
   * ========================================================= */
  function compressImage(file, maxW, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxW / img.width);
        var c = document.createElement('canvas');
        c.width = img.width * scale; c.height = img.height * scale;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* =========================================================
   *  事件绑定
   * ========================================================= */
  function bind() {
    // 底部导航
    $$('.tab').forEach(function (b) { b.onclick = function () { switchTab(b.dataset.tab); }; });

    // 弹窗关闭
    $$('[data-close]').forEach(function (x) { x.onclick = closeModal; });

    // 今日菜单面板
    $('#btnTodayMenu').onclick = openTodaySheet;
    $('#sheetMask').onclick = closeTodaySheet;
    $('#sheetClose').onclick = closeTodaySheet;
    $('#btnPlaceOrder').onclick = saveToDiary;

    // 采购清单
    $('#btnShopping').onclick = generateShoppingList;

    // 点菜分类筛选
    $('#orderFilters').addEventListener('click', function (e) {
      var btn = e.target.closest('.ofilter'); if (!btn) return;
      $$('#orderFilters .ofilter').forEach(function (x) { x.classList.remove('ofilter--active'); });
      btn.classList.add('ofilter--active');
      orderCat = btn.dataset.cat; renderOrder();
    });

    // 冰箱
    $('#btnAddIngredient').onclick = function () { openModal('新增食材', ingredientForm()); };
    $('#fridgeSearch').oninput = renderFridge;
    $('#fridgeFilters').addEventListener('click', function (e) {
      var chip = e.target.closest('.chip'); if (!chip) return;
      $$('#fridgeFilters .chip').forEach(function (x) { x.classList.remove('chip--active'); });
      chip.classList.add('chip--active');
      fridgeCat = chip.dataset.cat; renderFridge();
    });

    // 厨房（菜谱管理）
    $('#btnAddRecipe').onclick = function () { openModal('新增菜谱', recipeForm()); };
    $('#recipeSearch').oninput = renderKitchen;
    $('#btnBackFromKitchen').onclick = function () { switchTab('mine'); };

    // 我的
    $('#btnSaveFamily').onclick = function () {
      Store.get().family.name = $('#familyName').value.trim() || '未命名';
      Store.persist(); $('#headerSub').textContent = '家庭：' + Store.get().family.name; toast('已保存');
    };
    $('#btnAddMember').onclick = function () { openModal('添加成员', memberForm()); };
    $('#btnSeed').onclick = function () { Store.reseed(); switchTab(currentTab); toast('已载入示例'); };
    $('#btnReset').onclick = function () {
      if (confirm('确定清空所有数据？')) { Store.reset(); switchTab(currentTab); toast('已清空'); }
    };

    // 厨房入口等子页面跳转（data-goto）
    $('#screen').addEventListener('click', function (e) {
      var goto = e.target.closest('[data-goto]');
      if (goto) { goToSubPage(goto.dataset.goto); return; }

      var btn = e.target.closest('[data-act]'); if (!btn) return;
      var act = btn.dataset.act, id = btn.dataset.id;
      var d = Store.get();

      // 点菜页操作
      if (currentTab === 'order') {
        if (act === 'catalog-add') addToOrder(id);
        else if (act === 'catalog-view') {
          var rr = d.recipes.find(function (x) { return x.id === id; });
          if (rr) openModal(rr.name, recipeDetail(rr));
        }
      }

      // 冰箱操作
      if (currentTab === 'fridge') {
        if (act === 'edit') { var ing = d.ingredients.find(function (x) { return x.id === id; }); openModal('编辑食材', ingredientForm(ing)); }
        if (act === 'del') { Store.removeIngredient(id); Store.persist(); renderFridge(); }
      }

      // 厨房页操作
      if (currentTab === 'kitchen') {
        var r = d.recipes.find(function (x) { return x.id === id; });
        if (act === 'view') { openModal(r.name, recipeDetail(r)); }
        else if (act === 'edit') { openModal('编辑菜谱', recipeForm(r)); }
        else if (act === 'del') { if (confirm('删除该菜谱？')) { Store.removeRecipe(id); Store.persist(); renderKitchen(); } }
      }

      // 我的-成员
      if (currentTab === 'mine' && act === 'del') { Store.removeMember(id); Store.persist(); renderMine(); }
    });

    // 食记页删除
    $('#diaryList').addEventListener('click', function (e) {
      var del = e.target.closest('.diary-date-del'); if (!del) return;
      if (confirm('删除这条食记？')) {
        Store.removeDiary(del.dataset.did);
        Store.persist(); renderDiary();
        toast('已删除');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bind();
    switchTab('order');
  });
})();
