(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const preloader = document.querySelector(".preloader");
  const header = document.querySelector(".header");
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const backToTop = document.getElementById("backToTop");
  const cursorGlow = document.querySelector(".cursor-glow");

  const hidePreloader = () => {
    if (preloader) {
      preloader.classList.add("hidden");
    }
  };

  window.addEventListener("load", () => {
    window.setTimeout(hidePreloader, 520);
  });
  window.setTimeout(hidePreloader, 2200);

  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  if (prefersReducedMotion) {
    revealElements.forEach((element) => element.classList.add("active"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const toggleMenu = (forceState) => {
    if (!mobileMenu || !burger) return;
    const nextState = typeof forceState === "boolean" ? forceState : !mobileMenu.classList.contains("active");
    mobileMenu.classList.toggle("active", nextState);
    burger.classList.toggle("active", nextState);
    burger.setAttribute("aria-expanded", String(nextState));
    body.classList.toggle("menu-open", nextState);
    if (header) {
      header.classList.remove("hidden-nav");
    }
  };

  if (burger) {
    burger.addEventListener("click", () => toggleMenu());
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleMenu(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      toggleMenu(false);
    }
  });

  let lastScroll = 0;
  const onScroll = () => {
    const currentScroll = window.scrollY;
    if (header) {
      header.classList.toggle("scrolled", currentScroll > 20);
      if (currentScroll > lastScroll && currentScroll > 160 && !(mobileMenu && mobileMenu.classList.contains("active"))) {
        header.classList.add("hidden-nav");
      } else {
        header.classList.remove("hidden-nav");
      }
    }

    if (backToTop) {
      backToTop.classList.toggle("visible", currentScroll > 500);
    }

    lastScroll = currentScroll;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  const statNumbers = document.querySelectorAll(".stat-number");
  const setStatFinal = (element) => {
    element.textContent = `${element.dataset.target || "0"}${element.dataset.suffix || ""}`;
  };

  if (prefersReducedMotion) {
    statNumbers.forEach(setStatFinal);
  } else if (statNumbers.length > 0) {
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          const target = Number(element.dataset.target || 0);
          const suffix = element.dataset.suffix || "";
          const duration = 1400;
          let start = null;

          const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const value = Math.floor(progress * target);
            element.textContent = `${value}${suffix}`;
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              element.textContent = `${target}${suffix}`;
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(element);
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((element) => statObserver.observe(element));
  }

  const getNextSaturdayTarget = () => {
    const now = new Date();
    const target = new Date(now);
    const day = target.getDay();
    let daysUntilSaturday = (6 - day + 7) % 7;
    if (daysUntilSaturday === 0 && now.getHours() >= 20) {
      daysUntilSaturday = 7;
    }
    target.setDate(target.getDate() + daysUntilSaturday);
    target.setHours(20, 0, 0, 0);
    return target;
  };

  let countdownTarget = getNextSaturdayTarget();
  const timeNodes = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
  };

  const hasCountdown = Object.values(timeNodes).every(Boolean);
  const updateCountdown = () => {
    if (!hasCountdown) return;
    const now = new Date();
    if (countdownTarget <= now) {
      countdownTarget = getNextSaturdayTarget();
    }

    const diff = countdownTarget - now;
    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    const days = Math.floor(diff / day);
    const hours = Math.floor((diff % day) / hour);
    const minutes = Math.floor((diff % hour) / minute);
    const seconds = Math.floor((diff % minute) / 1000);

    timeNodes.days.textContent = String(days).padStart(2, "0");
    timeNodes.hours.textContent = String(hours).padStart(2, "0");
    timeNodes.minutes.textContent = String(minutes).padStart(2, "0");
    timeNodes.seconds.textContent = String(seconds).padStart(2, "0");
  };

  if (hasCountdown) {
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  const updateLocationStatus = () => {
    const currentHour = new Date().getHours();
    document.querySelectorAll(".location-status").forEach((status) => {
      const openHour = Number(status.dataset.open || 7);
      const closeHour = Number(status.dataset.close || 22);
      const isOpen = currentHour >= openHour && currentHour < closeHour;
      status.classList.toggle("open", isOpen);
      status.classList.toggle("closed", !isOpen);
      const text = status.querySelector(".status-text");
      if (text) {
        text.textContent = isOpen ? "Ouvert maintenant" : "Ferme pour le moment";
      }
    });
  };

  updateLocationStatus();

  const paletteMap = {
    orange: ["#F47B20", "#D4691A"],
    dark: ["#1A1A1A", "#4B2A13"],
    cream: ["#F5E6D3", "#FFF8F0"],
  };

  const escapeXml = (value) =>
    String(value).replace(/[<>&"']/g, (character) => {
      const entities = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      };
      return entities[character] || character;
    });

  const fallbackImage = (label, tone = "orange") => {
    const palette = paletteMap[tone] || paletteMap.orange;
    const safeLabel = escapeXml(label);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#g)" />
        <circle cx="950" cy="180" r="220" fill="#ffffff" opacity="0.08" />
        <circle cx="180" cy="640" r="180" fill="#ffffff" opacity="0.08" />
        <rect x="110" y="120" width="980" height="560" rx="32" fill="#ffffff" opacity="0.08" />
        <text x="120" y="380" fill="#ffffff" font-family="Poppins, Arial, sans-serif" font-size="86" font-weight="800">${safeLabel}</text>
        <text x="120" y="460" fill="#ffffff" font-family="Manrope, Arial, sans-serif" font-size="34" font-weight="600" opacity="0.88">Mokat Shop</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const applyFallback = (image) => {
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = fallbackImage(image.dataset.fallback || "Mokat Shop", image.dataset.tone || "orange");
  };

  document.querySelectorAll("img[data-fallback]").forEach((image) => {
    image.addEventListener("error", () => applyFallback(image));
    if (image.complete && image.naturalWidth === 0) {
      applyFallback(image);
    }
  });

  const createParticles = (x, y) => {
    if (prefersReducedMotion) return;
    const colors = ["#F47B20", "#FFAA5C", "#FFFFFF", "#FFF8F0"];
    for (let index = 0; index < 10; index += 1) {
      const particle = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 46;
      particle.className = "click-particle";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = colors[index % colors.length];
      particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
      document.body.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
    }
  };

  document.querySelectorAll("[data-reward]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;
      createParticles(x, y);
    });
  });

  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item, index) => {
    const button = item.querySelector(".faq-toggle");
    const content = item.querySelector(".faq-content");
    if (!button || !content) return;

    const openFaq = (shouldOpen) => {
      item.classList.toggle("active", shouldOpen);
      button.setAttribute("aria-expanded", String(shouldOpen));
      content.style.maxHeight = shouldOpen ? `${content.scrollHeight}px` : "0px";
    };

    button.addEventListener("click", () => {
      const willOpen = !item.classList.contains("active");
      faqItems.forEach((otherItem) => {
        const otherButton = otherItem.querySelector(".faq-toggle");
        const otherContent = otherItem.querySelector(".faq-content");
        if (!otherButton || !otherContent) return;
        otherItem.classList.remove("active");
        otherButton.setAttribute("aria-expanded", "false");
        otherContent.style.maxHeight = "0px";
      });
      openFaq(willOpen);
    });

    if (index === 0) {
      openFaq(true);
    } else {
      openFaq(false);
    }
  });

  if (!prefersReducedMotion && cursorGlow && window.innerWidth > 1024) {
    document.addEventListener("pointermove", (event) => {
      cursorGlow.style.opacity = "1";
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    });

    document.addEventListener("pointerleave", () => {
      cursorGlow.style.opacity = "0";
    });
  } else if (cursorGlow) {
    cursorGlow.style.display = "none";
  }
})();
