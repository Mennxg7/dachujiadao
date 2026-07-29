/* ===========================================================
 * 小厨神驾到 · 本地存储层（localStorage）
 * 所有数据按"家庭"隔离；当前仅演示单家庭。
 * =========================================================== */
(function (global) {
  'use strict';

  var KEY = 'xiaochushen_v1';


  // 默认种子数据
  function seed() {
    var s = {
      family: { id: 'f1', name: '幸福一家' },
      members: [
        { id: 'm1', name: '毛毛', role: '管理员', avatar: '👧' },
        { id: 'm2', name: '盖盖', role: '成员', avatar: '👧' }
      ],
      ingredients: [
        { id: 'i1', name: '鸡蛋', category: '蛋奶', count: 10, unit: '个', location: '冷藏室', expire: addDays(12) },
        { id: 'i2', name: '西红柿', category: '蔬菜', count: 5, unit: '个', location: '冷藏室', expire: addDays(3) },
        { id: 'i3', name: '五花肉', category: '肉类', count: 500, unit: '克', location: '冷藏室', expire: addDays(5) },
        { id: 'i4', name: '排骨', category: '肉类', count: 500, unit: '克', location: '冷冻室', expire: addDays(20) },
        { id: 'i5', name: '葱', category: '蔬菜', count: 1, unit: '把', location: '冷藏室', expire: addDays(1) },
        { id: 'i6', name: '盐', category: '其他', count: 1, unit: '包', location: '调味架', expire: addDays(365) },
        { id: 'i7', name: '黄瓜', category: '蔬菜', count: 2, unit: '根', location: '冷藏室', expire: addDays(4) },
        { id: 'i8', name: '蒜', category: '蔬菜', count: 1, unit: '头', location: '冷藏室', expire: addDays(15) },
        { id: 'i9', name: '紫菜', category: '其他', count: 1, unit: '包', location: '调味架', expire: addDays(200) },
        { id: 'i10', name: '大米', category: '其他', count: 2000, unit: '克', location: '米桶', expire: '' },
        { id: 'i11', name: '大虾', category: '肉类', count: 300, unit: '克', location: '冷冻室', expire: addDays(15) },
        { id: 'i12', name: '三文鱼', category: '肉类', count: 200, unit: '克', location: '冷冻室', expire: addDays(10) },
        { id: 'i13', name: '包菜', category: '蔬菜', count: 1, unit: '颗', location: '冷藏室', expire: addDays(6) },
        { id: 'i14', name: '生菜', category: '蔬菜', count: 1, unit: '颗', location: '冷藏室', expire: addDays(3) },
        { id: 'i15', name: '西兰花', category: '蔬菜', count: 1, unit: '颗', location: '冷藏室', expire: addDays(4) },
        { id: 'i16', name: '菠菜', category: '蔬菜', count: 1, unit: '把', location: '冷藏室', expire: addDays(2) },
        { id: 'i17', name: '姜片', category: '其他', count: 1, unit: '块', location: '调味架', expire: addDays(30) }
      ],
      recipes: [
        {
          id: 'r1', name: '红烧肉！！', cover: '', tags: ['荤菜'],
          ingredients: [
            { name: '五花肉', amount: 500, unit: 'g' },
            { name: '姜片', amount: 4, unit: '片' },
            { name: '盐', amount: 1, unit: '撮' }
          ],
          steps: [
            { text: '五花肉切块焯水去血沫。', image: '' },
            { text: '炒糖色下肉翻炒上色。', image: '' },
            { text: '加水没过肉，小火炖1小时收汁。', image: '' }
          ]
        },
        {
          id: 'r2', name: '糖醋排骨', cover: '', tags: ['荤菜'],
          ingredients: [
            { name: '排骨', amount: 500, unit: 'g' },
            { name: '姜片', amount: '适量', unit: '' },
            { name: '盐', amount: 1, unit: '撮' }
          ],
          steps: [
            { text: '排骨冷水下锅焯水。', image: '' },
            { text: '调糖醋汁（糖:醋=2:1）煎至金黄。', image: '' },
            { text: '倒入排骨翻炒均匀出锅。', image: '' }
          ]
        },
        {
          id: 'r3', name: '蒜蓉虾', cover: '', tags: ['荤菜'],
          ingredients: [
            { name: '大虾', amount: '适量', unit: '' },
            { name: '蒜', amount: 3, unit: '勺' },
            { name: '葱', amount: '适量', unit: '' }
          ],
          steps: [
            { text: '虾开背去虾线洗净。', image: '' },
            { text: '热油爆香蒜末，下虾炒至变色。', image: '' },
            { text: '撒葱花出锅。', image: '' }
          ]
        },
        {
          id: 'r4', name: '煎三文鱼', cover: '', tags: ['荤菜', '减脂'],
          ingredients: [
            { name: '三文鱼', amount: 1, unit: '块' },
            { name: '盐', amount: '适量', unit: '' },
            { name: '黑胡椒', amount: '适量', unit: '' }
          ],
          steps: [
            { text: '三文鱼擦干水分撒盐和黑胡椒腌制10分钟。', image: '' },
            { text: '平底锅热油，皮面朝下中火煎3分钟翻面。', image: '' },
            { text: '再煎2分钟挤柠檬汁即可。', image: '' }
          ]
        },
        {
          id: 'r5', name: '西红柿炒蛋', cover: '', tags: ['素菜'],
          ingredients: [
            { name: '鸡蛋', amount: 3, unit: '个' },
            { name: '西红柿', amount: 2, unit: '个' },
            { name: '葱', amount: 1, unit: '把' },
            { name: '盐', amount: 1, unit: '撮' }
          ],
          steps: [
            { text: '鸡蛋打散加少许盐，西红柿切块。', image: '' },
            { text: '热油先炒蛋盛出，再炒西红柿出汁。', image: '' },
            { text: '倒入鸡蛋翻炒，撒葱花出锅。', image: '' }
          ]
        },
        {
          id: 'r6', name: '炒包菜', cover: '', tags: ['素菜'],
          ingredients: [
            { name: '包菜', amount: '半颗', unit: '' },
            { name: '蒜', amount: '适量', unit: '' },
            { name: '干辣椒', amount: '适量', unit: '' }
          ],
          steps: [
            { text: '包菜撕成小块洗净沥干。', image: '' },
            { text: '热油爆香蒜和干辣椒，大火快炒。', image: '' },
            { text: '加盐调味出锅。', image: '' }
          ]
        },
        {
          id: 'r7', name: '蚝油生菜', cover: '', tags: ['素菜'],
          ingredients: [
            { name: '生菜', amount: 1, unit: '颗' },
            { name: '蒜', amount: 1, unit: '勺' },
            { name: '蚝油', amount: 1, unit: '勺' }
          ],
          steps: [
            { text: '生菜洗净，蒜切末。', image: '' },
            { text: '水烧开加少许油盐，生菜焯烫捞出。', image: '' },
            { text: '热油爆香蒜末，加蚝油淋在生菜上。', image: '' }
          ]
        },
        {
          id: 'r8', name: '菠菜', cover: '', tags: ['素菜', '减脂'],
          ingredients: [
            { name: '菠菜', amount: 1, unit: '把' },
            { name: '蒜', amount: '适量', unit: '' },
            { name: '盐', amount: '适量', unit: '' }
          ],
          steps: [
            { text: '菠菜去根洗净切段。', image: '' },
            { text: '热水焯30秒过凉水。', image: '' },
            { text: '热油炒香蒜末，下菠菜加盐炒匀。', image: '' }
          ]
        },
        {
          id: 'r9', name: '蒜蓉西兰花', cover: '', tags: ['素菜', '减脂'],
          ingredients: [
            { name: '西兰花', amount: 1, unit: '颗' },
            { name: '蒜', amount: 1, unit: '勺' },
            { name: '蚝油', amount: '适量', unit: '' }
          ],
          steps: [
            { text: '西兰花掰小朵盐水浸泡10分钟。', image: '' },
            { text: '水开焯2分钟捞出。', image: '' },
            { text: '热油爆香蒜末，下西兰花加蚝油翻炒。', image: '' }
          ]
        },
        {
          id: 'r10', name: '麻婆豆腐', cover: '', tags: ['素菜'],
          ingredients: [
            { name: '豆腐', amount: 1, unit: '块' },
            { name: '肉末', amount: 100, unit: 'g' },
            { name: '豆瓣酱', amount: 1, unit: '勺' }
          ],
          steps: [
            { text: '豆腐切块用淡盐水泡一下。', image: '' },
            { text: '肉末炒散加豆瓣酱出红油。', image: '' },
            { text: '加水煮开放豆腐，勾芡撒花椒粉。', image: '' }
          ]
        },
        {
          id: 'r11', name: '白米饭', cover: '', tags: ['饭面'],
          ingredients: [
            { name: '大米', amount: '适量', unit: '' },
            { name: '水', amount: '适量', unit: '' }
          ],
          steps: [
            { text: '大米淘洗两遍。', image: '' },
            { text: '按米水比例1:1.2加水。', image: '' },
            { text: '按下煮饭键即可。', image: '' }
          ]
        },
        {
          id: 'r12', name: '麻辣烫', cover: '', tags: ['饭面'],
          ingredients: [
            { name: '自选食材', amount: '适量', unit: '' },
            { name: '蔬菜', amount: '适量', unit: '' },
            { name: '丸子', amount: '适量', unit: '' }
          ],
          steps: [
            { text: '准备喜欢的食材：丸子、蔬菜、豆制品等。', image: '' },
            { text: '煮开水，先放难熟的丸子，再放蔬菜。', image: '' },
            { text: '加入麻辣烫底料，煮熟盛碗。', image: '' }
          ]
        },
        {
          id: 'r13', name: '鸡蛋肉丁炒饭', cover: '', tags: ['饭面'],
          ingredients: [
            { name: '隔夜米饭', amount: 1, unit: '碗' },
            { name: '鸡蛋', amount: 2, unit: '个' },
            { name: '肉丁', amount: '适量', unit: '' }
          ],
          steps: [
            { text: '鸡蛋打散炒熟盛出备用。', image: '' },
            { text: '肉丁炒变色，下米饭炒散。', image: '' },
            { text: '倒入鸡蛋、葱花、盐翻炒均匀。', image: '' }
          ]
        },
        {
          id: 'r14', name: '虾仁炒饭', cover: '', tags: ['饭面'],
          ingredients: [
            { name: '隔夜米饭', amount: 1, unit: '碗' },
            { name: '虾仁', amount: '适量', unit: '' },
            { name: '蛋', amount: 1, unit: '个' }
          ],
          steps: [
            { text: '虾仁用料酒腌5分钟。', image: '' },
            { text: '蛋液裹米饭炒散粒粒分明。', image: '' },
            { text: '下虾仁炒至变色，加盐调味即可。', image: '' }
          ]
        },
        {
          id: 'r15', name: '咖喱饭', cover: '', tags: ['饭面'],
          ingredients: [
            { name: '米饭', amount: 1, unit: '碗' },
            { name: '土豆', amount: 1, unit: '个' },
            { name: '胡萝卜', amount: '半根', unit: '' }
          ],
          steps: [
            { text: '土豆、胡萝卜、洋葱切块。', image: '' },
            { text: '炒软后加水煮10分钟。', image: '' },
            { text: '关火放入咖喱块搅拌融化，浇在米饭上。', image: '' }
          ]
        },
        {
          id: 'r16', name: '紫菜蛋花汤', cover: '', tags: ['汤类'],
          ingredients: [
            { name: '紫菜', amount: 1, unit: '包' },
            { name: '鸡蛋', amount: 1, unit: '个' },
            { name: '盐', amount: 1, unit: '撮' }
          ],
          steps: [
            { text: '水烧开下紫菜，淋入打散的蛋液。', image: '' },
            { text: '加盐调味，撒葱花出锅。', image: '' }
          ]
        },
        {
          id: 'r17', name: '凉拌黄瓜', cover: '', tags: ['素菜', '减脂'],
          ingredients: [
            { name: '黄瓜', amount: 2, unit: '根' },
            { name: '蒜', amount: 1, unit: '头' },
            { name: '盐', amount: 1, unit: '撮' }
          ],
          steps: [
            { text: '黄瓜拍碎切段，蒜剁末。', image: '' },
            { text: '加盐拌匀，冷藏更爽口。', image: '' }
          ]
        }
      ],
      menu: [
        { id: 'o1', recipeId: 'r1', name: '西红柿炒蛋', orderedBy: 'm2', status: '想吃', date: today(), count: 1 },
        { id: 'o2', recipeId: 'r2', name: '肉末烧茄子', orderedBy: 'm1', status: '想吃', date: today(), count: 1 }
      ],
      diary: []
    };
    return s;
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function addDays(n) {
    var d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function uid(p) { return (p || 'id') + '_' + Math.random().toString(36).slice(2, 9); }

  // 读取 / 写入（localStorage 不可用时降级为内存模式，避免白屏）
  var memory = null;
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* file:// 或无痕模式下降级 */ }
    memory = seed();
    return memory;
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { memory = data; /* 内存模式，不持久化 */ }
  }

  var data = load();

  var Store = {
    get: function () { return data; },
    persist: function () { save(data); },
    reset: function () { data = seed(); save(data); },
    reseed: function () { data = seed(); save(data); },

    // --- 家庭成员 ---
    addMember: function (m) { data.members.push(Object.assign({ id: uid('m'), role: '成员', avatar: '🙂' }, m)); },
    removeMember: function (id) { data.members = data.members.filter(function (m) { return m.id !== id; }); },

    // --- 冰箱 ---
    addIngredient: function (it) { data.ingredients.push(Object.assign({ id: uid('i') }, it)); },
    updateIngredient: function (id, patch) {
      data.ingredients = data.ingredients.map(function (it) { return it.id === id ? Object.assign({}, it, patch) : it; });
    },
    removeIngredient: function (id) { data.ingredients = data.ingredients.filter(function (it) { return it.id !== id; }); },

    // --- 菜谱 ---
    addRecipe: function (r) { data.recipes.push(Object.assign({ id: uid('r'), ingredients: [], steps: [], tags: [] }, r)); },
    updateRecipe: function (id, patch) {
      data.recipes = data.recipes.map(function (r) { return r.id === id ? Object.assign({}, r, patch) : r; });
    },
    removeRecipe: function (id) {
      data.recipes = data.recipes.filter(function (r) { return r.id !== id; });
      data.menu = data.menu.filter(function (o) { return o.recipeId !== id; });
    },

    // --- 点菜 ---
    addMenuItem: function (o) { data.menu.push(Object.assign({ id: uid('o'), status: '想吃', date: today(), count: 1 }, o)); },
    updateMenuItem: function (id, patch) {
      data.menu = data.menu.map(function (o) { return o.id === id ? Object.assign({}, o, patch) : o; });
    },
    removeMenuItem: function (id) { data.menu = data.menu.filter(function (o) { return o.id !== id; }); },

    // --- 食记 ---
    addDiary: function (entry) { data.diary.push(Object.assign({ id: uid('d') }, entry)); data.diary.sort(function (a,b) { return b.date.localeCompare(a.date); }); },
    removeDiary: function (id) { data.diary = data.diary.filter(function (d) { return d.id !== id; }); },

    // 工具
    today: today,
    uid: uid,
    addDays: addDays
  };

  global.Store = Store;
})(window);
