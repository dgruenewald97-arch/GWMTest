(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchLayout = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const offerUrl = "https://www.gwm-motor.de/angebotsanfrage?brand=ORA&id=9&model=GWM+ORA+5";

  document.querySelectorAll("[data-cta-location]").forEach((cta) => {
    cta.href = offerUrl;
  });

  function splitHeadings() {
    document.querySelectorAll(".split-heading").forEach((heading) => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
      }
      nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        const words = node.nodeValue.trim().split(/\s+/);
        words.forEach((word, index) => {
          const outer = document.createElement("span");
          const inner = document.createElement("i");
          outer.className = "word";
          inner.textContent = word;
          outer.appendChild(inner);
          fragment.appendChild(outer);
          if (index < words.length - 1) fragment.appendChild(document.createTextNode(" "));
        });
        node.replaceWith(fragment);
      });
    });
  }

  splitHeadings();

  const header = document.querySelector("[data-header]");
  const mobileOffer = document.querySelector(".mobile-offer");
  const updateChrome = () => {
    const passedHero = window.scrollY > Math.min(500, window.innerHeight * .62);
    header?.classList.toggle("is-solid", passedHero);
    mobileOffer?.classList.toggle("is-visible", passedHero);
  };
  window.addEventListener("scroll", updateChrome, { passive: true });
  updateChrome();

  let activeVariant = "turbo";
  let variantTween;
  const switcher = document.querySelector(".power-switch");
  const tabs = [...document.querySelectorAll(".power-tab")];
  const vehicles = [...document.querySelectorAll("[data-vehicle]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const powerWord = document.querySelector(".power-word");

  function setVariant(next, options = {}) {
    if (!next || (next === activeVariant && !options.force)) return;
    const previous = activeVariant;
    activeVariant = next;
    const nextVehicle = vehicles.find((item) => item.dataset.vehicle === next);
    const oldVehicle = vehicles.find((item) => item.dataset.vehicle === previous);
    const nextPanel = panels.find((item) => item.dataset.panel === next);
    const oldPanel = panels.find((item) => item.dataset.panel === previous);

    tabs.forEach((tab) => {
      const selected = tab.dataset.variant === next;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    switcher?.classList.toggle("is-hybrid", next === "hybrid");
    nextPanel.hidden = false;

    if (!hasGsap || reduceMotion) {
      vehicles.forEach((item) => item.classList.toggle("is-active", item === nextVehicle));
      panels.forEach((item) => {
        item.classList.toggle("is-active", item === nextPanel);
        item.hidden = item !== nextPanel;
      });
      if (powerWord) powerWord.textContent = next.toUpperCase();
      return;
    }

    variantTween?.kill();
    const tl = window.gsap.timeline({ defaults: { duration: .42, ease: "power3.out" } });
    variantTween = tl;
    if (oldVehicle && oldVehicle !== nextVehicle) {
      tl.to(oldVehicle, { autoAlpha: 0, xPercent: -9, scale: .96 }, 0);
    }
    tl.fromTo(nextVehicle, { autoAlpha: 0, xPercent: 9, scale: .94 }, { autoAlpha: 1, xPercent: 0, scale: 1 }, .05);
    if (oldPanel && oldPanel !== nextPanel) {
      tl.to(oldPanel, { autoAlpha: 0, y: -14, duration: .22, onComplete: () => { oldPanel.hidden = true; oldPanel.classList.remove("is-active"); } }, 0);
    }
    tl.fromTo(nextPanel, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, onStart: () => nextPanel.classList.add("is-active") }, .12);
    if (powerWord) {
      tl.to(powerWord, { autoAlpha: 0, y: -18, duration: .17, onComplete: () => { powerWord.textContent = next.toUpperCase(); } }, 0)
        .to(powerWord, { autoAlpha: 1, y: 0, duration: .28 }, .18);
    }
    vehicles.forEach((item) => item.classList.toggle("is-active", item === nextVehicle));
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setVariant(tab.dataset.variant));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      setVariant(tabs[nextIndex].dataset.variant);
    });
  });
  setVariant("turbo", { force: true });

  function setupMobileColors() {
    if (!touchLayout) return;
    const wrap = document.querySelector(".color-track-wrap");
    const cards = [...document.querySelectorAll(".color-card")];
    if (!wrap || !cards.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > .6) {
          cards.forEach((card) => card.classList.toggle("is-current", card === entry.target));
        }
      });
    }, { root: wrap, threshold: [.6] });
    cards.forEach((card) => observer.observe(card));
  }
  setupMobileColors();

  if (!hasGsap) {
    document.querySelector(".page-loader")?.remove();
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduceMotion && !touchLayout && typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({
      duration: .34,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: .92
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target || !lenis) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: .75 });
    });
  });

  if (reduceMotion) {
    document.querySelector(".page-loader")?.remove();
    gsap.set(".mask-line > span", { yPercent: 0, rotate: 0 });
    return;
  }

  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro.set("body", { overflow: "hidden" })
    .fromTo(".page-loader i", { scaleX: 0 }, { scaleX: 1, duration: .38, ease: "power2.inOut" })
    .to(".page-loader", { yPercent: -100, duration: .58, ease: "power4.inOut" }, "+=.08")
    .set("body", { overflow: "" })
    .to(".mask-line > span", { yPercent: 0, rotate: 0, duration: .6, stagger: .07 }, "-=.22")
    .from(".hero-kicker span", { yPercent: 110, duration: .42 }, "-=.48")
    .from(".hero-conversion", { autoAlpha: 0, y: 28, duration: .5 }, "-=.38")
    .from(".hero-tag", { autoAlpha: 0, scale: .45, rotate: -20, duration: .45 }, "-=.42")
    .from(".hero-card", { autoAlpha: 0, y: 40, rotate: 0, stagger: .07, duration: .48 }, "-=.4")
    .to(".page-loader", { display: "none" });

  gsap.to(".hero-media img", {
    scale: 1,
    yPercent: 7,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .28 }
  });
  gsap.to(".hero-grid", {
    yPercent: 16,
    autoAlpha: .15,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "22% top", end: "bottom top", scrub: .24 }
  });

  if (window.matchMedia("(pointer: fine)").matches) {
    const hero = document.querySelector(".hero");
    const heroCards = [...document.querySelectorAll(".hero-card")];
    const cardX = heroCards.map((card) => gsap.quickTo(card, "x", { duration: .3, ease: "power3.out" }));
    const cardY = heroCards.map((card) => gsap.quickTo(card, "y", { duration: .3, ease: "power3.out" }));
    hero?.addEventListener("pointermove", (event) => {
      const x = event.clientX / window.innerWidth - .5;
      const y = event.clientY / window.innerHeight - .5;
      heroCards.forEach((card, index) => {
        const depth = 15 + index * 12;
        cardX[index](x * depth);
        cardY[index](y * depth);
      });
    });

    document.querySelectorAll(".magnetic").forEach((button) => {
      const moveX = gsap.quickTo(button, "x", { duration: .24, ease: "power3.out" });
      const moveY = gsap.quickTo(button, "y", { duration: .24, ease: "power3.out" });
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        moveX((event.clientX - rect.left - rect.width / 2) * .18);
        moveY((event.clientY - rect.top - rect.height / 2) * .18);
      });
      button.addEventListener("pointerleave", () => { moveX(0); moveY(0); });
    });
  }

  document.querySelectorAll(".split-heading").forEach((heading) => {
    gsap.from(heading.querySelectorAll(".word > i"), {
      yPercent: 115,
      rotate: 3,
      duration: .55,
      stagger: .035,
      ease: "power4.out",
      scrollTrigger: { trigger: heading, start: "top 82%", once: true }
    });
  });

  document.querySelectorAll(".clip-reveal").forEach((figure, index) => {
    gsap.fromTo(figure,
      { clipPath: index % 2 ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: .7, ease: "power3.inOut", scrollTrigger: { trigger: figure, start: "top 82%", once: true } }
    );
    gsap.to(figure.querySelector("img"), {
      scale: 1,
      yPercent: index % 2 ? -5 : 5,
      ease: "none",
      scrollTrigger: { trigger: figure, start: "top bottom", end: "bottom top", scrub: .26 }
    });
  });

  gsap.from(".design-stamp > *", {
    xPercent: -110,
    autoAlpha: 0,
    duration: .45,
    stagger: .045,
    ease: "power3.out",
    scrollTrigger: { trigger: ".design-stamp", start: "top 85%", once: true }
  });

  if (!touchLayout) {
    ScrollTrigger.create({
      trigger: ".power-section",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setVariant(self.progress > .52 ? "hybrid" : "turbo")
    });
    gsap.fromTo(".power-visual", { yPercent: 12 }, {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: ".power-section", start: "top top", end: "bottom bottom", scrub: .28 }
    });
  }

  document.querySelectorAll(".interior-card").forEach((card, index) => {
    gsap.from(card, {
      y: 90 + index * 18,
      rotate: index % 2 ? 9 : -8,
      autoAlpha: 0,
      duration: .65,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 90%", once: true }
    });
    gsap.to(card, {
      y: index % 2 ? -35 : 30,
      ease: "none",
      scrollTrigger: { trigger: ".interior-collage", start: "top bottom", end: "bottom top", scrub: .25 }
    });
  });

  gsap.to(".space-car img", {
    scale: 1.02,
    yPercent: 5,
    ease: "none",
    scrollTrigger: { trigger: ".space-section", start: "top bottom", end: "bottom top", scrub: .28 }
  });

  if (!touchLayout) {
    const track = document.querySelector("[data-color-track]");
    const cards = [...document.querySelectorAll(".color-card")];
    const current = document.querySelector("[data-color-current]");
    const progressBar = document.querySelector("[data-color-progress]");
    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * .04);
    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".color-section",
        start: "top top",
        end: "bottom bottom",
        scrub: .3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const index = Math.min(cards.length - 1, Math.max(0, Math.round(self.progress * (cards.length - 1))));
          cards.forEach((card, cardIndex) => card.classList.toggle("is-current", cardIndex === index));
          if (current) current.textContent = String(index + 1).padStart(2, "0");
          gsap.set(progressBar, { scaleX: self.progress });
          cards.forEach((card, cardIndex) => {
            const center = cardIndex / (cards.length - 1);
            const distance = Math.abs(self.progress - center);
            gsap.set(card, { y: Math.min(28, distance * 55), rotate: (center - self.progress) * 3.2 });
          });
        }
      }
    });
  }

  gsap.utils.toArray(".world").forEach((world, index) => {
    gsap.from(world, {
      clipPath: index ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
      duration: .75,
      ease: "power3.inOut",
      scrollTrigger: { trigger: world, start: "top 84%", once: true }
    });
  });

  gsap.from(".safety-grid article", {
    y: 70,
    autoAlpha: 0,
    duration: .55,
    stagger: .08,
    ease: "power3.out",
    scrollTrigger: { trigger: ".safety-grid", start: "top 82%", once: true }
  });

  gsap.from(".offer-card", {
    y: 80,
    rotate: (index) => index ? 2.5 : -2.5,
    autoAlpha: 0,
    duration: .65,
    stagger: .1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".offer-grid", start: "top 82%", once: true }
  });

  gsap.to(".round-cta", {
    rotate: 8,
    ease: "none",
    scrollTrigger: { trigger: ".final-cta", start: "top bottom", end: "bottom top", scrub: .28 }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
})();
