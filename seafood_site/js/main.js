$(function () {
  'use strict';

  /* ------------------------------------------------------------
     Настройки
     FORM_ENDPOINT — адрес обработчика форм (например, Formspree,
     свой PHP-скрипт и т.п.). Пока пусто — заявки не отправляются
     на сервер, пользователь просто видит сообщение об успехе.
  ------------------------------------------------------------ */
  var FORM_ENDPOINT = '';

  var BASE_MESSAGES = {
    'msg.ok': 'Дякуємо! Заявку надіслано, ми зв’яжемося з вами найближчим часом.',
    'msg.err': 'Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.',
    'msg.fill': 'Будь ласка, заповніть обов’язкові поля.',
    'meta.title': 'Морепродукти з Норвегії'
  };

  var $body = $('body');
  var lang = 'uk';

  /* ---------------- Слайдер в шапке ---------------- */
  $('.header-slider').slick({
    dots: true,
    fade: true,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    adaptiveHeight: true,
    prevArrow: '<button type="button" class="slick-prev" aria-label="Попередній слайд"><img src="images/prev.svg" alt=""></button>',
    nextArrow: '<button type="button" class="slick-next" aria-label="Наступний слайд"><img src="images/next.svg" alt=""></button>',
    responsive: [{
      breakpoint: 769,
      settings: { arrows: false }
    }]
  });

  /* ---------------- Карусель продукции ---------------- */
  var $names = $('.product__name');
  var $content = $('.product__content');

  $content.slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: '.product__name',
    fade: true,
    arrows: false,
    adaptiveHeight: true,
    swipe: true
  });

  $names.slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    focusOnSelect: true,
    asNavFor: '.product__content',
    vertical: true,
    verticalSwiping: true,
    centerMode: true,
    centerPadding: '0px',
    prevArrow: '<button type="button" class="product-prev" aria-label="Попередній продукт"><img src="images/product-prev.png" alt=""></button>',
    nextArrow: '<button type="button" class="product-next" aria-label="Наступний продукт"><img src="images/product-next.png" alt=""></button>',
    responsive: [
      {
        breakpoint: 901,
        settings: {
          vertical: false,
          verticalSwiping: false,
          slidesToShow: 3,
          centerMode: true,
          centerPadding: '0px'
        }
      },
      {
        breakpoint: 701,
        settings: {
          vertical: false,
          verticalSwiping: false,
          slidesToShow: 1,
          centerMode: false
        }
      }
    ]
  });

  // Перестраиваем карусели при повороте экрана / смене размеров
  var resizeTimer;
  $(window).on('resize orientationchange', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      $('.header-slider, .product__name, .product__content').slick('setPosition');
    }, 150);
  });

  /* ---------------- Мобильное меню ---------------- */
  var $menuBtn = $('.menu__btn');
  var $menuList = $('.menu__list');

  function setMenu(open) {
    $menuList.toggleClass('menu__list--active', open);
    $menuBtn.toggleClass('is-open', open).attr('aria-expanded', open);
    $menuBtn.attr('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    $body.toggleClass('is-locked', open);
  }

  $menuBtn.on('click', function () {
    setMenu(!$menuList.hasClass('menu__list--active'));
  });

  $menuList.on('click', 'a', function () {
    setMenu(false);
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $menuList.hasClass('menu__list--active')) setMenu(false);
  });

  $(window).on('resize', function () {
    if (window.innerWidth > 1000 && $menuList.hasClass('menu__list--active')) setMenu(false);
  });

  /* ---------------- Подсветка пункта меню при скролле ---------------- */
  if ('IntersectionObserver' in window) {
    var $links = $('.menu__link');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          $links.removeClass('is-active')
            .filter('[href="#' + entry.target.id + '"]').addClass('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    $links.each(function () {
      var target = document.querySelector($(this).attr('href'));
      if (target) observer.observe(target);
    });
  }

  /* ---------------- Кнопка «наверх» ---------------- */
  var $toTop = $('.to-top');
  $(window).on('scroll', function () {
    $toTop.toggleClass('is-visible', window.scrollY > 700);
  }).trigger('scroll');

  $toTop.on('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------- Модалки (fancybox) ---------------- */
  // Українські підписи кнопок fancybox
  $.fancybox.defaults.i18n.uk = {
    CLOSE: 'Закрити',
    NEXT: 'Далі',
    PREV: 'Назад',
    ERROR: 'Не вдалося завантажити вміст. Спробуйте пізніше.',
    PLAY_START: 'Слайд-шоу',
    PLAY_STOP: 'Пауза',
    FULL_SCREEN: 'На весь екран',
    THUMBS: 'Мініатюри',
    DOWNLOAD: 'Завантажити',
    SHARE: 'Поділитися',
    ZOOM: 'Збільшити'
  };

  $.fancybox.defaults.lang = 'uk';

  var fancyOpts = {
    touch: false,
    autoFocus: false,
    backFocus: false,
    smallBtn: true,
    toolbar: false
  };

  $('[data-fancybox]').fancybox(fancyOpts);

  // Кнопка «Заказать» — открываем форму с выбранным продуктом
  $('.product__content-btn').on('click', function () {
    var index = $(this).closest('.product__content-element').data('slick-index');
    if (typeof index !== 'number') index = $('.product__content-element').index($(this).closest('.product__content-element'));
    $('#order-product').prop('selectedIndex', index);
    $.fancybox.open({ src: '#order', type: 'inline', opts: fancyOpts });
  });

  /* ---------------- Формы ---------------- */
  // Основна мова сайту — українська (тексти прямо в HTML), додатково — англійська
  var DICTS = { en: window.I18N_EN || {} };

  function t(key) {
    var dict = DICTS[lang];
    if (dict && dict[key]) return dict[key];
    return BASE_MESSAGES[key] || '';
  }

  function validate($form) {
    var ok = true;
    $form.find('.form__input').each(function () {
      var $f = $(this);
      var val = $.trim($f.val());
      var bad = false;

      if ($f.prop('required') && !val) bad = true;
      if (!bad && $f.attr('type') === 'tel' && val) {
        bad = val.replace(/\D/g, '').length < 7;
      }
      if (!bad && $f.attr('type') === 'email' && val) {
        bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }
      $f.toggleClass('is-invalid', bad);
      if (bad) ok = false;
    });
    return ok;
  }

  $(document).on('input change', '.form__input.is-invalid', function () {
    $(this).removeClass('is-invalid');
  });

  // В поле телефона — только цифры, пробелы, +, -, ()
  $(document).on('input', 'input[type="tel"]', function () {
    var cleaned = this.value.replace(/[^\d+\-()\s]/g, '');
    if (cleaned !== this.value) this.value = cleaned;
  });

  $('.js-form').on('submit', function (e) {
    e.preventDefault();
    var $form = $(this);
    var $msg = $form.find('.form__success');
    var $btn = $form.find('.form__btn');

    $msg.removeClass('is-error').text('');

    if (!validate($form)) {
      $msg.addClass('is-error').text(t('msg.fill'));
      $form.find('.is-invalid').first().trigger('focus');
      return;
    }

    $btn.prop('disabled', true);

    var done = function () {
      $btn.prop('disabled', false);
      $msg.text(t('msg.ok'));
      var selected = $form.find('select').prop('selectedIndex');
      $form[0].reset();
      $form.find('select').prop('selectedIndex', selected);
      if ($form.closest('.fancybox-container').length) {
        setTimeout(function () {
          $.fancybox.close();
          $msg.text('');
        }, 2500);
      }
    };

    var fail = function () {
      $btn.prop('disabled', false);
      $msg.addClass('is-error').text(t('msg.err'));
    };

    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData($form[0]),
        headers: { 'Accept': 'application/json' }
      }).then(function (r) { r.ok ? done() : fail(); }).catch(fail);
    } else {
      setTimeout(done, 600);
    }
  });

  /* ---------------- Переключение языка UA / EN ---------------- */
  var $i18n = $('[data-i18n]');
  $i18n.each(function () {
    $(this).data('base', this.innerHTML);
  });

  function setLang(next) {
    lang = DICTS[next] ? next : 'uk';
    var dict = DICTS[lang] || {};

    $i18n.each(function () {
      var key = this.getAttribute('data-i18n');
      this.innerHTML = dict[key] ? dict[key] : $(this).data('base');
    });

    document.documentElement.lang = lang;
    $.fancybox.defaults.lang = lang;
    document.title = t('meta.title');
    $('.lang__btn').removeClass('header__content-link--active')
      .filter('[data-lang="' + lang + '"]').addClass('header__content-link--active');

    $('.header-slider, .product__name, .product__content').slick('setPosition');

    try { localStorage.setItem('seafood-lang', lang); } catch (err) { /* приватный режим */ }
  }

  $('.lang__btn').on('click', function () {
    setLang($(this).data('lang'));
  });

  try {
    var saved = localStorage.getItem('seafood-lang');
    if (saved === 'en') setLang('en');
  } catch (err) { /* ignore */ }

  /* ---------------- Год в подвале ---------------- */
  $('.js-year').text(new Date().getFullYear());
});
