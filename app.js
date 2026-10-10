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

  /* ---------- Quote form → FormSubmit send ---------- */
  var form = document.getElementById('quote-form');
  var note = document.getElementById('form-note');
  var successPanel = document.getElementById('form-success');
  var successMsg = document.getElementById('form-success-msg');
  var againBtn = document.getElementById('form-again');

  function setNote(message, kind) {
    if (!note) return;
    note.textContent = message;
    note.className = 'form-note' + (kind ? ' ' + kind : '');
  }

  function showSuccess(formEl, firstName) {
    setNote('', '');
    if (successMsg) successMsg.textContent = 'Thanks ' + firstName + ' — we\u2019ll be in touch with your free quote shortly.';
    if (!formEl || !successPanel) return;
    if (prefersReducedMotion) {
      formEl.hidden = true;
      successPanel.hidden = false;
      return;
    }
    formEl.classList.add('is-leaving');
    setTimeout(function () {
      formEl.hidden = true;
      formEl.classList.remove('is-leaving');
      successPanel.hidden = false;
    }, 460);
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

      var firstName = name.value.trim().split(' ')[0];
      var honey = form.querySelector('input[name="_honey"]');
      if (honey && honey.value) {
        form.reset();
        if (serviceSelect) serviceSelect.classList.remove('filled');
        showSuccess(form, firstName);
        return;
      }

      var submitBtn = form.querySelector('.form-submit');
      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending\u2026';
      }
      setNote('', '');

      fetch('https://formsubmit.co/ajax/bianca@whileyouwork.com.au', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim() || '—',
          service: service.value,
          message: message.value.trim(),
          _subject: 'New quote request: ' + service.value + ' — ' + name.value.trim(),
          _template: 'table',
          _captcha: 'false',
          _autoresponse: 'Thanks for contacting While You Work! We have received your enquiry and will be back to you with a free quote shortly. — Bianca, While You Work Cleaning Services'
        })
      }).then(function (res) {
        if (!res.ok) throw new Error('send failed');
        return res.json();
      }).then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
        form.reset();
        if (serviceSelect) serviceSelect.classList.remove('filled');
        showSuccess(form, firstName);
      }).catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
        setNote('Hmm, that didn\u2019t send. Please email bianca@whileyouwork.com.au or call 0413 083 995 instead.', 'error');
      });
    });

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('invalid');
        if (note && note.classList.contains('error')) setNote('', '');
      });
    });

    if (againBtn) {
      againBtn.addEventListener('click', function () {
        if (successPanel) successPanel.hidden = true;
        form.hidden = false;
        form.classList.remove('is-leaving');
        setNote('', '');
        var first = form.querySelector('input[name="name"]');
        if (first) first.focus();
      });
    }
  }
})();
