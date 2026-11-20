/* =========================================================
   Анимация появления элементов при прокрутке.
   Без зависимостей (не требует jQuery).
   Если браузер не поддерживает IntersectionObserver или в системе
   включено «уменьшение движения» — всё просто видно сразу.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce || !document.querySelectorAll) return;

  // селектор → тип анимации; stagger — задержка между соседями (мс)
  var groups = [
    { sel: '.section-title, .section-subtitle', type: 'up' },
    { sel: '.product__name', type: 'left' },
    { sel: '.product__content', type: 'right' },
    { sel: '.seafood-box__item', type: 'pop', stagger: 120 },
    { sel: '.seafood__item:not(.seafood__item--text-right) .seafood__item-content', type: 'left' },
    { sel: '.seafood__item--text-right .seafood__item-content', type: 'right' },
    { sel: '.seafood__item-img', type: 'zoom' },
    { sel: '.seafood__blockquote-img', type: 'up' },
    { sel: '.seafood__blockquote-text', type: 'up' },
    { sel: '.recipe-card', type: 'up', stagger: 150 },
    { sel: '.timeline__item', type: 'up', stagger: 120 },
    { sel: '.wholesale__info', type: 'left' },
    { sel: '.wholesale__form', type: 'right' },
    { sel: '.contacts__box', type: 'right' },
    { sel: '.footer-social__item', type: 'pop', stagger: 80 },
    { sel: '.footer__menu, .footer__logo, .footer__copy', type: 'up' }
  ];

  var DURATION = 900;
  var items = [];

  groups.forEach(function (g) {
    var nodes = document.querySelectorAll(g.sel);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.hasAttribute('data-reveal')) continue;
      el.setAttribute('data-reveal', g.type);
      el._revealStagger = g.stagger || 0;
      items.push(el);
    }
  });

  root.className += ' js-reveal';

  function finish(el) {
    // убираем служебные атрибуты — возвращаются родные hover-эффекты
    el.removeAttribute('data-reveal');
    el.classList.remove('is-revealed');
    el.style.transitionDelay = '';
  }

  var observer = new IntersectionObserver(function (entries) {
    var batch = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      observer.unobserve(el);

      var delay = el._revealStagger ? batch * el._revealStagger : 0;
      if (el._revealStagger) batch++;

      el.style.transitionDelay = delay + 'ms';
      el.classList.add('is-revealed');
      setTimeout(function () { finish(el); }, delay + DURATION + 100);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  items.forEach(function (el) { observer.observe(el); });

  // страховка: если что-то так и не попало в зону видимости
  // (например, печать страницы) — показываем через событие beforeprint
  window.addEventListener('beforeprint', function () {
    items.forEach(finish);
  });
})();
