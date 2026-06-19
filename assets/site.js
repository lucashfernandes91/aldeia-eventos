(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setupPageLoader() {
    const body = document.body;
    const loader = document.querySelector(".offline-loader");
    const shell = document.querySelector(".offline-page-shell");
    if (!body || !loader || !shell) return;

    const start = performance.now();
    const minDuration = prefersReduced ? 0 : 780;

    const waitForWindow = new Promise((resolve) => {
      if (document.readyState === "complete") {
        resolve();
        return;
      }
      window.addEventListener("load", resolve, { once: true });
    });

    const heroImage = document.querySelector("#hero img");
    const waitForHero = new Promise((resolve) => {
      if (!heroImage || heroImage.complete) {
        resolve();
        return;
      }
      heroImage.addEventListener("load", resolve, { once: true });
      heroImage.addEventListener("error", resolve, { once: true });
    });

    Promise.allSettled([waitForWindow, waitForHero]).then(() => {
      const elapsed = performance.now() - start;
      const delay = Math.max(0, minDuration - elapsed);

      window.setTimeout(() => {
        body.classList.add("offline-ready");
        body.classList.remove("offline-loading");
        window.setTimeout(() => {
          loader.remove();
        }, prefersReduced ? 0 : 760);
      }, delay);
    });
  }

  function revealOnScroll() {
    const items = [...document.querySelectorAll("[data-offline-reveal]")];
    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.16 });

    items.forEach((item, index) => {
      item.style.setProperty("--offline-delay", Math.min(index % 6, 5) * 80 + "ms");
      observer.observe(item);
    });
  }

  function animateCounters() {
    const counters = [
      { label: "de área construída", value: 800, suffix: "m²" },
      { label: "de área verde", value: 3000, suffix: "m²" },
      { label: "convidados", value: 350, suffix: "" },
      { label: "do centro", value: 10, suffix: "min" },
    ];

    counters.forEach(({ label, value, suffix }) => {
      const labelNode = [...document.querySelectorAll("p")].find((node) => node.textContent.trim() === label);
      const counter = labelNode?.previousElementSibling;
      if (!counter) return;
      counter.classList.add("offline-counter");
      counter.dataset.target = String(value);
      counter.dataset.suffix = suffix;
      counter.innerHTML = '0<span class="text-accent">' + suffix + '</span>';
    });

    const nodes = [...document.querySelectorAll(".offline-counter")];
    const run = (node) => {
      const target = Number(node.dataset.target || 0);
      const suffix = node.dataset.suffix || "";
      if (prefersReduced) {
        node.innerHTML = target.toLocaleString("pt-BR") + '<span class="text-accent">' + suffix + '</span>';
        return;
      }

      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        node.innerHTML = current.toLocaleString("pt-BR") + '<span class="text-accent">' + suffix + '</span>';
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(run);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.55 });

    nodes.forEach((node) => observer.observe(node));
  }

  function setupGallery() {
    const gallery = document.querySelector("#galeria");
    if (!gallery) return;

    const modal = document.createElement("div");
    modal.className = "offline-gallery-modal";
    modal.innerHTML = '<button class="offline-gallery-close" type="button" aria-label="Fechar imagem">×</button><img alt="">';
    document.body.appendChild(modal);

    const modalImage = modal.querySelector("img");
    const close = () => modal.classList.remove("is-open");
    modal.querySelector("button").addEventListener("click", close);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    gallery.querySelectorAll("img").forEach((image) => {
      const target = image.closest(".group") || image;
      target.addEventListener("click", () => {
        modalImage.src = image.currentSrc || image.src;
        modalImage.alt = image.alt || "";
        modal.classList.add("is-open");
      });
    });
  }

  function setupTestimonials() {
    const testimonials = [
      {
        quote: "O Aldeia superou todas as nossas expectativas. Nosso casamento foi mágico, e cada convidado nos disse que nunca tinha estado em um lugar tão lindo.",
        name: "Camila & Rafael",
        event: "Casamento · 2024",
      },
      {
        quote: "A equipe é incrível e o espaço fala por si. Foi a melhor decisão que tomamos para nossa festa de 15 anos.",
        name: "Família Santos",
        event: "Celebração · 2024",
      },
      {
        quote: "Realizamos nosso evento corporativo no Aldeia e o resultado foi impressionante. Ambiente sofisticado com a acolhida que só a natureza proporciona.",
        name: "Marcelo Ferreira",
        event: "Evento Corporativo · 2023",
      },
      {
        quote: "Desde a primeira visita, nos apaixonamos. O Aldeia tem uma energia especial que transformou nosso casamento em algo cinematográfico.",
        name: "Juliana & Pedro",
        event: "Casamento · 2023",
      },
    ];

    const label = [...document.querySelectorAll("p")].find((node) => node.textContent.trim() === "Depoimentos");
    const section = label?.closest("section");
    if (!section) return;

    const stage = [...section.querySelectorAll("div")].find((node) =>
      String(node.className).includes("min-h-[280px]")
    );
    if (!stage) return;

    stage.innerHTML = "";
    const mark = document.createElement("div");
    mark.className = "offline-testimonial-quote-mark";
    mark.textContent = "“";

    const content = document.createElement("div");
    content.className = "offline-testimonial-content is-active";

    const quote = document.createElement("p");
    quote.className = "font-serif text-xl md:text-2xl text-foreground leading-relaxed italic mb-8";

    const name = document.createElement("p");
    name.className = "text-foreground font-sans font-medium text-sm tracking-wide";

    const event = document.createElement("p");
    event.className = "text-muted-foreground font-sans text-xs tracking-[0.15em] uppercase mt-1";

    const dots = document.createElement("div");
    dots.className = "offline-testimonial-dots";

    content.append(quote, name, event);
    stage.append(mark, content, dots);

    let current = 0;
    let timer = null;

    const setContent = (index) => {
      const item = testimonials[index];
      quote.textContent = '"' + item.quote + '"';
      name.textContent = item.name;
      event.textContent = item.event;
      dots.querySelectorAll("button").forEach((button, dotIndex) => {
        button.classList.toggle("is-active", dotIndex === index);
        button.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
      });
    };

    const show = (index) => {
      current = (index + testimonials.length) % testimonials.length;
      if (prefersReduced) {
        setContent(current);
        return;
      }
      content.classList.remove("is-active");
      window.setTimeout(() => {
        setContent(current);
        content.classList.add("is-active");
      }, 180);
    };

    const schedule = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(current + 1), 6000);
    };

    testimonials.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "offline-testimonial-dot";
      button.setAttribute("aria-label", "Mostrar depoimento " + (index + 1));
      button.addEventListener("click", () => {
        show(index);
        schedule();
      });
      dots.appendChild(button);
    });

    setContent(0);
    schedule();
  }

  function setupAnchorButtons() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      });
    });
  }

  function setupHeaderScroll() {
    const nav = document.querySelector("nav.fixed");
    if (!nav) return;

    const sync = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
  }

  function setupMobileMenu() {
    const nav = document.querySelector("nav.fixed");
    if (!nav) return;

    const button = nav.querySelector("button.lg\\:hidden");
    const panel = nav.querySelector(".hidden.lg\\:flex");
    if (!button || !panel) return;

    const closeMenu = () => {
      nav.classList.remove("is-mobile-open");
      button.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      nav.classList.add("is-mobile-open");
      button.setAttribute("aria-expanded", "true");
    };

    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "offline-mobile-menu");
    panel.id = "offline-mobile-menu";

    button.addEventListener("click", () => {
      if (nav.classList.contains("is-mobile-open")) {
        closeMenu();
        return;
      }
      openMenu();
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 1024) closeMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) closeMenu();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupPageLoader();
    setupHeaderScroll();
    setupMobileMenu();
    revealOnScroll();
    animateCounters();
    setupGallery();
    setupTestimonials();
    setupAnchorButtons();
  });
})();
