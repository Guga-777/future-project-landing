/**
 * Nexura - თანამედროვე Landing Page
 * ინტერაქციული ლოგიკა & კლიენტის ვალიდაცია
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. თემის მართვა (Dark / Light Theme Toggle)
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // შენახული ან სისტემური თემის შემოწმება
  const savedTheme = localStorage.getItem('nexura-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlRoot.setAttribute('data-theme', savedTheme);
  } else if (!systemPrefersDark) {
    htmlRoot.setAttribute('data-theme', 'light');
  } else {
    htmlRoot.setAttribute('data-theme', 'dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('nexura-theme', newTheme);
    });
  }

  // --------------------------------------------------------------------------
  // 2. ჰედერის სქროლის ეფექტი (Sticky Header Blur)
  // --------------------------------------------------------------------------
  const header = document.querySelector('.header');
  const backToTopBtn = document.getElementById('back-to-top');

  const handleScrollEffects = () => {
    const scrollY = window.scrollY;

    // ჰედერის ფონის გააქტიურება
    if (header) {
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // ზემოთ ასასვლელი ღილაკის გამოჩენა
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScrollEffects, { passive: true });
  handleScrollEffects();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --------------------------------------------------------------------------
  // 3. მობილური ჰამბურგერ მენიუ (Mobile Navigation)
  // --------------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', isOpen);
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen && window.innerWidth <= 768 ? 'hidden' : '';
  };

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => toggleMenu());

    // მენიუს დახურვა ბმულზე დაკლიკებისას
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          toggleMenu(false);
        }
      });
    });

    // მენიუს დახურვა გარეთ დაკლიკებისას
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && 
          !navMenu.contains(e.target) && 
          !hamburgerBtn.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // ESC კლავიშზე მენიუს დახურვა
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggleMenu(false);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. გლუვი სქროლი & აქტიური ნავიგაციის ბმულის მაჩვენებელი (ScrollSpy)
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');

  const updateActiveNavLink = () => {
    const scrollY = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');
      const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (correspondingLink) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach(link => link.classList.remove('active'));
          correspondingLink.classList.add('active');
        }
      }
    });
  };

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  // --------------------------------------------------------------------------
  // 5. სტატისტიკის მრიცხველის ანიმაცია (Count Up Animation)
  // --------------------------------------------------------------------------
  const counterElements = document.querySelectorAll('.stat-number[data-target]');
  let countersAnimated = false;

  const animateCounters = () => {
    counterElements.forEach(counter => {
      const targetStr = counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const targetNum = parseFloat(targetStr);
      const isDecimal = targetStr.includes('.');
      const duration = 1800; // ms
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = targetNum * easeOut;

        if (isDecimal) {
          counter.textContent = prefix + currentVal.toFixed(1) + suffix;
        } else {
          counter.textContent = prefix + Math.floor(currentVal).toLocaleString() + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = prefix + targetStr + suffix;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  // IntersectionObserver სტატისტიკის ანიმაციისთვის
  const statsContainer = document.querySelector('.stats-grid');
  if (statsContainer && counterElements.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    statsObserver.observe(statsContainer);
  }

  // --------------------------------------------------------------------------
  // 6. საკონტაქტო ფორმა & Client-side ვალიდაცია
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const successBanner = document.getElementById('form-success-banner');
  const submitBtn = contactForm ? contactForm.querySelector('.submit-btn') : null;

  if (contactForm) {
    const fields = {
      name: {
        input: document.getElementById('name'),
        group: document.getElementById('group-name'),
        validate: (val) => {
          if (!val.trim()) return 'გთხოვთ შეიყვანოთ თქვენი სახელი';
          if (val.trim().length < 2) return 'სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს';
          return '';
        }
      },
      email: {
        input: document.getElementById('email'),
        group: document.getElementById('group-email'),
        validate: (val) => {
          if (!val.trim()) return 'გთხოვთ შეიყვანოთ ელ.ფოსტა';
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!emailPattern.test(val.trim())) return 'გთხოვთ შეიყვანოთ ვალიდური ელ.ფოსტის მისამართი (მაგ: info@domain.ge)';
          return '';
        }
      },
      subject: {
        input: document.getElementById('subject'),
        group: document.getElementById('group-subject'),
        validate: (val) => {
          if (!val.trim()) return 'გთხოვთ შეიყვანოთ თემა';
          if (val.trim().length < 3) return 'თემა უნდა შედგებოდეს მინიმუმ 3 სიმბოლოსგან';
          return '';
        }
      },
      message: {
        input: document.getElementById('message'),
        group: document.getElementById('group-message'),
        validate: (val) => {
          if (!val.trim()) return 'გთხოვთ დაწეროთ შეტყობინება';
          if (val.trim().length < 10) return 'შეტყობინება უნდა შედგებოდეს მინიმუმ 10 სიმბოლოსგან';
          return '';
        }
      }
    };

    // შეცდომის გამოტანის დამხმარე ფუნქცია
    const setFieldError = (fieldKey, errorMsg) => {
      const field = fields[fieldKey];
      if (!field || !field.group) return;

      const errorElement = field.group.querySelector('.error-message span');
      if (errorMsg) {
        field.group.classList.add('has-error');
        field.input.setAttribute('aria-invalid', 'true');
        if (errorElement) errorElement.textContent = errorMsg;
      } else {
        field.group.classList.remove('has-error');
        field.input.removeAttribute('aria-invalid');
        if (errorElement) errorElement.textContent = '';
      }
    };

    // რეალურ დროში შეცდომის გასუფთავება აკრეფისას
    Object.keys(fields).forEach(key => {
      const field = fields[key];
      if (field.input) {
        field.input.addEventListener('input', () => {
          if (field.group.classList.contains('has-error')) {
            const error = field.validate(field.input.value);
            setFieldError(key, error);
          }
        });

        field.input.addEventListener('blur', () => {
          const error = field.validate(field.input.value);
          setFieldError(key, error);
        });
      }
    });

    // ფორმის გაგზავნის დამუშავება
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasErrors = false;
      let firstInvalidInput = null;

      // ყველა ველის სრული ვალიდაცია
      Object.keys(fields).forEach(key => {
        const field = fields[key];
        const error = field.validate(field.input.value);
        if (error) {
          setFieldError(key, error);
          hasErrors = true;
          if (!firstInvalidInput) {
            firstInvalidInput = field.input;
          }
        } else {
          setFieldError(key, '');
        }
      });

      if (hasErrors) {
        if (firstInvalidInput) {
          firstInvalidInput.focus();
        }
        return;
      }

      // იმიტირებული გაგზავნის პროცესი (Simulated Realistic Submit)
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }

        // წარმატების შეტყობინების ჩვენება
        if (successBanner) {
          successBanner.classList.add('active');
          successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // ფორმის ველების გასუფთავება
        contactForm.reset();

        // წარმატების ბანერის ავტომატური დახურვა 7 წამის შემდეგ
        setTimeout(() => {
          if (successBanner) {
            successBanner.classList.remove('active');
          }
        }, 7000);
      }, 1200);
    });
  }
});
