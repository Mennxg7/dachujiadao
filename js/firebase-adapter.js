/* ===========================================================
 * 大厨驾到 · Firebase 实时同步适配层
 * 用法：在网址后加 ?fb=1 开启 Firebase 模式
 * 首次使用需在页面中配置 Firebase 项目信息
 * =========================================================== */
(function (global) {
  'use strict';

  var _fb = null;       // firebase 引用
  var _db = null;       // realtime database 引用
  var _ref = null;      // 数据根节点引用
  var _ready = false;
  var _listeners = {};  // 远端变化回调

  /* ---------- 初始化 ---------- */
  function init(firebaseConfig) {
    if (!global.firebase) {
      console.warn('Firebase SDK 未加载，回退到 localStorage');
      return false;
    }
    try {
      var app = firebase.initializeApp(firebaseConfig, 'dachujiadao');
      _db = firebase.database(app);
      _ref = _db.ref('data');
      _ready = true;
      return true;
    } catch (e) {
      console.error('Firebase 初始化失败：', e);
      return false;
    }
  }

  /* ---------- 读取全部数据（一次性） ---------- */
  function loadData(callback) {
    if (!_ready) { callback(null); return; }
    _ref.once('value', function (snap) {
      var data = snap.val();
      callback(data || null);
    }, function (err) {
      console.error('Firebase 读取失败：', err);
      callback(null);
    });
  }

  /* ---------- 写入全部数据 ---------- */
  function saveData(data) {
    if (!_ready) return;
    _ref.set(data).catch(function (err) {
      console.error('Firebase 写入失败：', err);
    });
  }

  /* ---------- 监听远端变化 ---------- */
  function watch(onChange) {
    if (!_ready) return;
    _ref.on('value', function (snap) {
      var data = snap.val();
      if (data) onChange(data);
    });
  }

  /* ---------- 取消监听 ---------- */
  function unwatch() {
    if (!_ready) return;
    _ref.off('value');
  }

  /* ---------- 暴露 ---------- */
  global.FirebaseSync = {
    init: init,
    ready: function () { return _ready; },
    load: loadData,
    save: saveData,
    watch: watch,
    unwatch: unwatch
  };

})(window);
