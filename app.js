/* While You Work — site interactions. No dependencies. */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById('site-header');
  function onScrollHeader() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(!menu.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) setMenu(false);
    });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = document.querySelectorAll('#primary-nav a[href^="#"]');
  var sections = Array.prototype.map.call(navLinks, function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Service pre-select from cards ---------- */
  var serviceSelect = document.getElementById('service-select');
  if (serviceSelect) {
    serviceSelect.addEventListener('change', function () {
      serviceSelect.classList.toggle('filled', serviceSelect.value !== '');
    });
    document.querySelectorAll('[data-service]').forEach(function (link) {
      link.addEventListener('click', function () {
        var wanted = link.getAttribute('data-service');
        Array.prototype.forEach.call(serviceSelect.options, function (option) {
          if (option.text === wanted) serviceSelect.value = option.value || option.text;
        });
        serviceSelect.classList.add('filled');
      });
    });
  }

  /* ---------- Sticky mobile CTA ---------- */
  var stickyCta = document.getElementById('sticky-cta');
  var hero = document.querySelector('.hero');
  var contact = document.getElementById('contact');
  var pastHero = false;
  var contactVisible = false;

  function updateStickyCta() {
    if (!stickyCta) return;
    var show = pastHero && !contactVisible && window.innerWidth < 900;
    stickyCta.classList.toggle('visible', show);
  }

  if ('IntersectionObserver' in window && stickyCta) {
    if (hero) {
      new IntersectionObserver(function (entries) {
        pastHero = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
        updateStickyCta();
      }).observe(hero);
    }
    if (contact) {
      new IntersectionObserver(function (entries) {
        contactVisible = entries[0].isIntersecting;
        updateStickyCta();
      }, { threshold: 0.08 }).observe(contact);
    }
    window.addEventListener('resize', updateStickyCta);
  }

  /* ---------- Hero videos: lounge/kitchen crossfade ---------- */
  var videos = Array.prototype.slice.call(document.querySelectorAll('.hero-video'));
  if (videos.length) {
    if (prefersReducedMotion) {
      videos.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
    } else {
      var current = 0;
      setInterval(function () {
        if (document.hidden || videos.length < 2) return;
        var next = (current + 1) % videos.length;
        videos[next].play().catch(function () { /* keep showing current */ });
        videos[current].classList.remove('is-active');
        videos[next].classList.add('is-active');
        current = next;
      }, 9000);
      if ('IntersectionObserver' in window) {
        var heroEl = document.querySelector('.hero');
        if (heroEl) {
          new IntersectionObserver(function (entries) {
            videos.forEach(function (v) {
              if (entries[0].isIntersecting) v.play().catch(function () { /* poster remains */ });
              else v.pause();
            });
          }, { threshold: 0.05 }).observe(heroEl);
        }
      }
    }
  }

  /* ---------- Hero headline rotator ---------- */
  var rotator = document.getElementById('rotator');
  if (rotator && !prefersReducedMotion) {
    var phrases = ['we clean.', 'we organise.', 'we polish.', 'we refresh.', 'we detail.'];
    var phrase = 0;
    var char = phrases[0].length;
    var deleting = false;
    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      var heroNode = document.querySelector('.hero');
      if (heroNode) {
        new IntersectionObserver(function (entries) {
          heroVisible = entries[0].isIntersecting;
        }, { threshold: 0 }).observe(heroNode);
      }
    }
    function tick() {
      var delay = 55;
      if (heroVisible && !document.hidden) {
        var full = phrases[phrase];
        if (!deleting) {
          char++;
          if (char >= full.length) {
            char = full.length;
            deleting = true;
            delay = 2200;
          } else {
            delay = 45 + Math.random() * 60;
          }
        } else {
          char--;
          if (char <= 0) {
            char = 0;
            deleting = false;
            phrase = (phrase + 1) % phrases.length;
            delay = 350;
          } else {
            delay = 28;
          }
        }
        rotator.textContent = phrases[phrase].slice(0, char);
      }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 1800);
  }

  /* ---------- Quote form → composed email ---------- */
  var form = document.getElementById('quote-form');
  var note = document.getElementById('form-note');

  function setNote(message, kind) {
    if (!note) return;
    note.textContent = message;
    note.className = 'form-note' + (kind ? ' ' + kind : '');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements.name;
      var email = form.elements.email;
      var phone = form.elements.phone;
      var service = form.elements.service;
      var message = form.elements.message;

      var valid = true;
      [name, email, service, message].forEach(function (field) {
        var fieldValid = field.checkValidity() && field.value.trim() !== '';
        if (field === email && fieldValid) {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        field.classList.toggle('invalid', !fieldValid);
        if (!fieldValid) valid = false;
      });

      if (!valid) {
        setNote('Please complete the highlighted fields so we can quote accurately.', 'error');
        var firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus({ preventScroll: false });
        return;
      }

      var subject = 'Cleaning quote request — ' + service.value;
      var lines = [
        'Name: ' + name.value.trim(),
        'Email: ' + email.value.trim(),
        'Phone: ' + (phone.value.trim() || '—'),
        'Service: ' + service.value,
        '',
        message.value.trim()
      ];
      window.location.href =
        'mailto:bianca@whileyouwork.com.au?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      var firstName = name.value.trim().split(' ')[0];
      setNote('Thanks ' + firstName + ' — your email app should have opened with everything filled in. Just press send, and we\u2019ll be in touch.', 'success');
    });

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('invalid');
        if (note && note.classList.contains('error')) setNote('', '');
      });
    });
  }
})();
