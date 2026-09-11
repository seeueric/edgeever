/* ==========================================================================
   JINGONG — 站点脚本。原生 JS，无依赖；每个模块自检目标元素后再运行。
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DESKTOP = '(min-width: 1024px)';

  function each(sel, fn, root) {
    var n = (root || document).querySelectorAll(sel);
    for (var i = 0; i < n.length; i++) fn(n[i], i);
  }

  /* 年份 */
  function year() {
    each('[data-year]', function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* 当前导航项：按文件名匹配，中英文目录通用 */
  function active() {
    var file = window.location.pathname.split('/').pop() || 'index.html';
    each('.nav__item[data-nav]', function (el) {
      if (el.getAttribute('data-nav') === file) el.classList.add('on');
    });
  }

  /* 页头状态：滚动后加边框；覆盖在 Hero 上的页头滚过首屏后转为实底 */
  function header() {
    var hdr = document.querySelector('.hdr');
    var top = document.querySelector('.top');
    var hero = document.querySelector('.hero');
    if (!hdr && !top) return;

    var threshold = 8;
    function measure() {
      if (hero) threshold = Math.max(80, hero.offsetHeight - 140);
    }
    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (hdr) hdr.classList.toggle('stuck', y > threshold);
      if (top) top.classList.toggle('show', y > 700);
    }
    measure(); update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', function () { measure(); update(); });

    if (top) {
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  }

  /* 移动端抽屉 + 子菜单 */
  function drawer() {
    var btn = document.querySelector('.burger');
    var nav = document.getElementById('nav');
    if (!btn || !nav) return;

    var hdr = document.querySelector('.hdr');

    function close() {
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.classList.remove('locked');
      if (hdr) hdr.classList.remove('navopen');
    }

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
      document.body.classList.toggle('locked', !open);
      if (hdr) hdr.classList.toggle('navopen', !open);
    });

    each('.nav__item--sub > .nav__a', function (a) {
      a.addEventListener('click', function (e) {
        if (window.matchMedia(DESKTOP).matches) return;
        e.preventDefault();
        this.parentNode.classList.toggle('open');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { close(); btn.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.matchMedia(DESKTOP).matches) close();
    });
  }

  /* 一次性淡入 */
  function reveal() {
    var items = document.querySelectorAll('.rv');
    if (!items.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      each('.rv', function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    each('.rv', function (el) { io.observe(el); });
  }

  /* 案例筛选 */
  function filter() {
    var bar = document.querySelector('[data-filters]');
    var grid = document.querySelector('[data-works]');
    if (!bar || !grid) return;

    var btns = bar.querySelectorAll('button[data-f]');
    var cards = grid.querySelectorAll('[data-cat]');
    var empty = document.querySelector('[data-empty]');

    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-f]');
      if (!b) return;
      var v = b.getAttribute('data-f');
      var shown = 0;
      for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
      for (var j = 0; j < cards.length; j++) {
        var hit = v === 'all' || cards[j].getAttribute('data-cat') === v;
        cards[j].hidden = !hit;
        if (hit) shown++;
      }
      if (empty) empty.hidden = shown !== 0;
    });
  }

  /* 咨询表单：仅前端校验，未接后端 */
  function form() {
    var f = document.querySelector('[data-form]');
    if (!f) return;
    var status = f.querySelector('[data-status]');
    var inputs = f.querySelectorAll('input, textarea, select');

    function say(kind, msg) {
      if (!status) return;
      status.setAttribute('data-k', kind);
      status.textContent = msg;
      status.classList.add('show');
    }
    function check(el) {
      var w = el.closest('.field');
      if (!w) return true;
      var ok = el.checkValidity();
      w.classList.toggle('bad', !ok);
      return ok;
    }

    each('input, textarea, select', function (el) {
      el.addEventListener('blur', function () { check(this); });
      el.addEventListener('input', function () {
        var w = this.closest('.field');
        if (w && w.classList.contains('bad')) check(this);
      });
    }, f);

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      for (var i = 0; i < inputs.length; i++) if (!check(inputs[i]) && !first) first = inputs[i];
      if (first) {
        first.focus();
        say('err', f.getAttribute('data-msg-invalid') || '请检查标红的必填项。');
        return;
      }
      // TODO(上线前)：未接后端。改为 fetch() 提交到表单网关 / 企业邮箱 / CRM 后再上线。
      say('ok', f.getAttribute('data-msg-demo') || '演示模式：校验通过，但未接入后端，信息尚未发送。');
    });
  }

  function boot() { year(); active(); header(); drawer(); reveal(); filter(); form(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
