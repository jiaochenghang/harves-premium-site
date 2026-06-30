(() => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = [...document.querySelectorAll(".nav a")];
  const cursorLight = document.querySelector(".cursor-light");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js-ready");

  const setHeaderState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  navToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const splitIntoMaskedLines = (element) => {
    if (!element) return [];
    if (element.dataset.masked === "true") return [...element.querySelectorAll(".mask-line > span")];
    const text = element.textContent.trim();
    if (!text) return [];

    const textNode = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (!textNode) return [];

    const words = text.split(/\s+/);
    let start = 0;
    const measured = words.map((word) => {
      const index = textNode.textContent.indexOf(word, start);
      const range = document.createRange();
      range.setStart(textNode, index);
      range.setEnd(textNode, index + word.length);
      const rect = range.getBoundingClientRect();
      start = index + word.length;
      return { word, top: Math.round(rect.top) };
    });

    const lines = [];
    measured.forEach((item) => {
      const previous = lines[lines.length - 1];
      if (!previous || Math.abs(previous.top - item.top) > 8) {
        lines.push({ top: item.top, words: [item.word] });
      } else {
        previous.words.push(item.word);
      }
    });

    element.innerHTML = lines
      .map((line) => `<span class="mask-line"><span>${line.words.join(" ")}</span></span>`)
      .join("");
    element.dataset.masked = "true";
    return [...element.querySelectorAll(".mask-line > span")];
  };

  const heroTitle = document.querySelector(".hero .mega");
  const heroLines = splitIntoMaskedLines(heroTitle);
  const headlineLines = [
    ...heroLines,
    ...[...document.querySelectorAll(".section .display, .footer .display")].flatMap(splitIntoMaskedLines)
  ];

  const revealNow = (element, delay = 0) => {
    element.style.transitionDelay = `${delay}ms`;
    element.classList.add("is-visible");
  };

  const revealLine = (line, delay = 0) => {
    line.style.transitionDelay = `${delay}ms`;
    line.classList.add("line-visible");
  };

  if (reduceMotion) {
    document.querySelectorAll(".reveal, .reveal-image").forEach((element) => element.classList.add("is-visible"));
    headlineLines.forEach((line) => line.classList.add("line-visible"));
    return;
  }

  const startHero = () => {
    const heroImage = document.querySelector(".hero-media");
    const heroItems = [
      document.querySelector(".hero .kicker"),
      document.querySelector(".hero .hero-actions"),
      document.querySelector(".hero .hero-copy"),
      document.querySelector(".hero .hero-tag")
    ].filter(Boolean);

    revealNow(heroImage, 80);
    revealNow(heroTitle, 160);
    heroLines.forEach((line, index) => revealLine(line, 180 + index * 120));
    heroItems.forEach((element, index) => revealNow(element, 420 + index * 90));
    revealNow(header, 120);
  };

  requestAnimationFrame(() => requestAnimationFrame(startHero));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target.closest("section, footer");
        const group = section ? [...section.querySelectorAll(".reveal, .reveal-image")] : [entry.target];
        const index = Math.max(0, group.indexOf(entry.target));
        revealNow(entry.target, Math.min(index * 75, 360));
        if (entry.target.matches(".display")) {
          splitIntoMaskedLines(entry.target).forEach((line, lineIndex) => revealLine(line, 80 + lineIndex * 90));
        }
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".section .reveal, .section .reveal-image, .footer .reveal").forEach((element) => {
    revealObserver.observe(element);
  });

  const lineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("line-drawn");
        lineObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.28 }
  );

  document.querySelectorAll(".line-item, .pathway, .leader").forEach((element) => lineObserver.observe(element));

  const brandItems = [...document.querySelectorAll(".brand-operation .line-item")];
  const setActiveBrandItem = () => {
    if (!brandItems.length) return;
    const viewportCenter = window.innerHeight * 0.52;
    let active = brandItems[0];
    let bestDistance = Infinity;

    brandItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      if (rect.bottom > 0 && rect.top < window.innerHeight && distance < bestDistance) {
        bestDistance = distance;
        active = item;
      }
    });

    brandItems.forEach((item) => item.classList.toggle("is-active", item === active));
  };

  let ticking = false;
  const parallaxImages = [...document.querySelectorAll(".image-panel img, .profile-card img, .hero-media img")];
  const updateScrollMotion = () => {
    ticking = false;
    const vh = window.innerHeight;
    const mobile = window.matchMedia("(max-width: 980px)").matches;

    parallaxImages.forEach((image) => {
      if (mobile) {
        image.style.transform = "";
        return;
      }
      const rect = image.parentElement.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > vh + 120) return;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const distance = image.closest(".hero-media") ? 22 : 48;
      const y = Math.max(-distance, Math.min(distance, -progress * distance));
      const scale = image.closest(".hero-media") ? 1.02 : 1.045;
      image.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
    });

    setActiveBrandItem();
  };

  const requestScrollMotion = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollMotion);
  };

  updateScrollMotion();
  window.addEventListener("scroll", requestScrollMotion, { passive: true });
  window.addEventListener("resize", requestScrollMotion);

  const athleteCard = document.querySelector(".profile-card");
  if (athleteCard) {
    const athleteObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          athleteCard.classList.add("sweep-play");
          athleteObserver.disconnect();
        });
      },
      { threshold: 0.35 }
    );
    athleteObserver.observe(athleteCard);

    athleteCard.addEventListener("pointermove", (event) => {
      const rect = athleteCard.getBoundingClientRect();
      athleteCard.style.setProperty("--glow-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      athleteCard.style.setProperty("--glow-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { threshold: 0.35 }
  );

  document.querySelectorAll("main section[id], footer[id]").forEach((section) => sectionObserver.observe(section));

  if (cursorLight && window.matchMedia("(pointer: fine)").matches) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
      },
      { passive: true }
    );

    const moveLight = () => {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      cursorLight.style.left = `${currentX}px`;
      cursorLight.style.top = `${currentY}px`;
      requestAnimationFrame(moveLight);
    };

    moveLight();
  }
})();
