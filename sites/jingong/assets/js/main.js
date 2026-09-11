/* ==========================================================================
   精工工业建筑系统集团有限公司 — 站点脚本
   原生 JS，无依赖。所有模块自检目标元素是否存在，可安全复用于任意页面。
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- 页脚年份 */
  function initYear() {
    var nodes = document.querySelectorAll('[data-year]');
    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = year;
  }

  /* ------------------------------------------------------------ 导航当前项 */
  function initActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var items = document.querySelectorAll('.nav__item[data-nav]');
    for (var i = 0; i < items.length; i++) {
      var key = items[i].getAttribute('data-nav');
      if (key === path || (key === 'index.html' && path === '')) {
        items[i].classList.add('is-active');
      }
    }
  }

  /* -------------------------------------------------------- 移动端导航抽屉 */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('is-locked');
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.classList.toggle('is-locked', !open);
    });

    // 移动端：点击带子菜单的父项时展开子菜单而不是跳转
    var parents = document.querySelectorAll('.nav__item--has-menu > .nav__link');
    for (var i = 0; i < parents.length; i++) {
      parents[i].addEventListener('click', function (e) {
        if (window.matchMedia('(min-width: 1024px)').matches) return;
        e.preventDefault();
        this.parentNode.classList.toggle('is-expanded');
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 1024px)').matches) close();
    });
  }

  /* --------------------------------------------------------- 头部滚动阴影 */
  function initHeaderState() {
    var header = document.querySelector('.site-header');
    var toTop = document.querySelector('.to-top');
    if (!header && !toTop) return;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-stuck', y > 8);
      if (toTop) toTop.classList.toggle('is-visible', y > 640);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ------------------------------------------------------------- 滚动显现 */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = Number(el.getAttribute('data-reveal-delay') || 0);
        setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ------------------------------------------------------------- 数字滚动 */
  function initCounters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;

    function render(el, value, decimals) {
      el.textContent = value.toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;
      var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;

      if (reduceMotion) { render(el, target, decimals); return; }

      var duration = 1500;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        render(el, target * eased, decimals);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < nodes.length; i++) run(nodes[i]);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);
  }

  /* ------------------------------------------------------------- 案例筛选 */
  function initFilter() {
    var bar = document.querySelector('[data-filter-bar]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!bar || !grid) return;

    var buttons = bar.querySelectorAll('button[data-filter]');
    var cards = grid.querySelectorAll('[data-category]');
    var empty = document.querySelector('[data-filter-empty]');

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      var value = btn.getAttribute('data-filter');
      var shown = 0;

      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('aria-pressed', String(buttons[i] === btn));
      }
      for (var j = 0; j < cards.length; j++) {
        var match = value === 'all' || cards[j].getAttribute('data-category') === value;
        cards[j].hidden = !match;
        if (match) shown++;
      }
      if (empty) empty.hidden = shown !== 0;
    });
  }

  /* --------------------------------------------------------------- 表单 */
  function initForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;

    var status = form.querySelector('[data-form-status]');

    function setStatus(kind, message) {
      if (!status) return;
      status.setAttribute('data-kind', kind);
      status.textContent = message;
      status.classList.add('is-visible');
    }

    function fieldOf(input) { return input.closest('.field'); }

    function validate(input) {
      var wrap = fieldOf(input);
      if (!wrap) return true;
      var ok = input.checkValidity();
      wrap.classList.toggle('is-invalid', !ok);
      return ok;
    }

    var inputs = form.querySelectorAll('input, textarea, select');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('blur', function () { validate(this); });
      inputs[i].addEventListener('input', function () {
        var wrap = fieldOf(this);
        if (wrap && wrap.classList.contains('is-invalid')) validate(this);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      for (var j = 0; j < inputs.length; j++) {
        if (!validate(inputs[j]) && !firstInvalid) firstInvalid = inputs[j];
      }
      if (firstInvalid) {
        firstInvalid.focus();
        setStatus('err', '请检查表单中标红的必填项后再提交。');
        return;
      }

      // TODO(上线前)：此处未接后端。请改为 fetch() 提交到企业邮箱网关 /
      // 表单服务（如 Cloudflare Worker、企业微信机器人、CRM 接口）后再上线。
      setStatus('ok', '演示模式：表单校验通过，但尚未接入后端接口，信息未发送。请参考 README 完成对接。');
    });
  }

  /* --------------------------------------------------------------- 启动 */
  function boot() {
    initYear();
    initActiveNav();
    initMobileNav();
    initHeaderState();
    initReveal();
    initCounters();
    initFilter();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
