const header = document.querySelector("[data-header]");
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const dot = document.querySelector(".cursor-dot");
const progress = document.querySelector(".page-progress span");
const sections = [...document.querySelectorAll("section[id]")];
const navLinks = [...document.querySelectorAll(".nav a")];

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

toggle.addEventListener("click", () => {
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
  revealObserver.observe(el);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { threshold: 0.36 }
);

sections.forEach((section) => sectionObserver.observe(section));

const parallaxItems = document.querySelectorAll(".hero-bg, .image-lift");
let ticking = false;

const animateScroll = () => {
  const viewport = window.innerHeight;
  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > viewport) return;
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const depth = item.classList.contains("hero-bg") ? 30 : 14;
    if (item.classList.contains("hero-bg")) {
      item.style.transform = `scale(1.02) translate3d(0, ${progress * depth}px, 0)`;
    } else {
      item.style.translate = `0 ${progress * depth}px`;
    }
  });
  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(animateScroll);
      ticking = true;
    }
  },
  { passive: true }
);

document.querySelectorAll(".magnetic").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(900px) rotateX(${-y / 26}deg) rotateY(${x / 26}deg) translateY(-8px)`;
    card.style.boxShadow = "0 32px 70px rgba(0, 0, 0, 0.16)";
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.boxShadow = "";
  });
});

if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    dot.style.opacity = "1";
    dot.style.left = `${event.clientX}px`;
    dot.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll("a, button, .magnetic").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      dot.style.width = "44px";
      dot.style.height = "44px";
    });
    el.addEventListener("mouseleave", () => {
      dot.style.width = "22px";
      dot.style.height = "22px";
    });
  });
}
