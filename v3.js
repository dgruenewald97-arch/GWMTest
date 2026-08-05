(() => {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compact = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
  const nav = document.querySelector("[data-nav]");
  const mobileCta = document.querySelector(".mobile-cta");
  const updateChrome = () => {
    const active = window.scrollY > 160;
    nav?.classList.toggle("is-scrolled", active);
    mobileCta?.classList.toggle("visible", window.scrollY > 600);
  };
  window.addEventListener("scroll", updateChrome, { passive: true });
  updateChrome();

  if (!window.gsap || !window.ScrollTrigger || reduce) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!compact && window.Lenis) {
    lenis = new window.Lenis({
      duration: .34,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: .94
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
      lenis.scrollTo(target, { offset: -62, duration: .75 });
    });
  });

  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro.fromTo(".hero h1 > span", { yPercent: 115, rotate: 3 }, { yPercent: 0, rotate: 0, duration: .7, stagger: .045 })
    .from(".hero-topline > *, .hero-bottom > *", { y: 16, autoAlpha: 0, duration: .4, stagger: .035 }, "-=.4")
    .from(".hero-float", { y: 55, autoAlpha: 0, rotate: 0, duration: .5, stagger: .07 }, "-=.35");

  gsap.to(".hero h1 > span:nth-child(odd)", {
    yPercent: -15,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .26 }
  });
  gsap.to(".hero h1 > span:nth-child(even)", {
    yPercent: 12,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .26 }
  });

  if (window.matchMedia("(pointer: fine)").matches) {
    const hero = document.querySelector(".hero");
    const floats = [...document.querySelectorAll(".hero-float")];
    const xSetters = floats.map((item) => gsap.quickTo(item, "x", { duration: .28, ease: "power3.out" }));
    const ySetters = floats.map((item) => gsap.quickTo(item, "y", { duration: .28, ease: "power3.out" }));
    hero?.addEventListener("pointermove", (event) => {
      const x = event.clientX / innerWidth - .5;
      const y = event.clientY / innerHeight - .5;
      floats.forEach((item, index) => {
        const depth = 20 + index * 14;
        xSetters[index](x * depth);
        ySetters[index](y * depth);
      });
    });
  }

  gsap.to(".first-look-media img", {
    scale: 1,
    yPercent: 7,
    ease: "none",
    scrollTrigger: { trigger: ".first-look", start: "top bottom", end: "bottom top", scrub: .28 }
  });

  gsap.from(".project-meta > *", {
    y: 14,
    autoAlpha: 0,
    duration: .4,
    stagger: .04,
    scrollTrigger: { trigger: ".project-meta", start: "top 92%", once: true }
  });

  gsap.fromTo(".manifesto h2 span:first-child", { xPercent: -18 }, {
    xPercent: 0,
    ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "center center", scrub: .28 }
  });
  gsap.fromTo(".manifesto h2 span:last-child", { xPercent: 18 }, {
    xPercent: 0,
    ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "center center", scrub: .28 }
  });
  gsap.to(".manifesto-mark", {
    rotate: 135,
    ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: .24 }
  });

  document.querySelectorAll(".tile").forEach((tile, index) => {
    gsap.from(tile, {
      clipPath: index % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
      duration: .72,
      ease: "power3.inOut",
      scrollTrigger: { trigger: tile, start: "top 88%", once: true }
    });
    gsap.to(tile.querySelector("img"), {
      yPercent: index % 2 ? -5 : 5,
      scale: 1.06,
      ease: "none",
      scrollTrigger: { trigger: tile, start: "top bottom", end: "bottom top", scrub: .25 }
    });
  });

  if (!compact) {
    const cards = gsap.utils.toArray("[data-deck-card]");
    const deckTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".deck",
        start: "top top",
        end: "bottom bottom",
        scrub: .3,
        onUpdate: (self) => {
          const velocity = Math.max(-1.2, Math.min(1.2, self.getVelocity() / 1800));
          gsap.to(cards, { skewY: velocity, duration: .18, overwrite: "auto", ease: "power2.out" });
        }
      }
    });
    deckTimeline
      .to(cards[0], { x: "30vw", duration: 1 })
      .to(cards[0], { x: "-59vw", duration: 1 }, "+=.15")
      .to(cards[1], { x: "30vw", duration: 1 }, "<")
      .to(cards[1], { x: "-59vw", duration: 1 }, "+=.15")
      .to(cards[2], { x: "30vw", duration: 1 }, "<");
  }

  gsap.to(".interior-visual img", {
    scale: 1,
    yPercent: 6,
    ease: "none",
    scrollTrigger: { trigger: ".interior", start: "top bottom", end: "45% top", scrub: .28 }
  });
  gsap.from(".interior-detail--screen", {
    xPercent: -45,
    y: 90,
    rotate: -12,
    autoAlpha: 0,
    duration: .65,
    scrollTrigger: { trigger: ".interior-detail--screen", start: "top 90%", once: true }
  });
  gsap.from(".interior-detail--seat", {
    xPercent: 45,
    y: 90,
    rotate: 12,
    autoAlpha: 0,
    duration: .65,
    scrollTrigger: { trigger: ".interior-detail--seat", start: "top 90%", once: true }
  });

  document.querySelectorAll(".space-word span").forEach((line, index) => {
    gsap.from(line, {
      xPercent: index % 2 ? 22 : -22,
      duration: .72,
      ease: "power3.out",
      scrollTrigger: { trigger: line, start: "top 88%", once: true }
    });
  });

  if (!compact) {
    const rail = document.querySelector("[data-color-rail]");
    const getDistance = () => Math.max(0, rail.scrollWidth - innerWidth + innerWidth * .04);
    gsap.to(rail, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".colors",
        start: "top top",
        end: () => "+=" + (getDistance() + innerHeight * .8),
        pin: true,
        scrub: .3,
        invalidateOnRefresh: true
      }
    });
  }

  gsap.from(".offer h2", {
    yPercent: 25,
    autoAlpha: 0,
    duration: .65,
    ease: "power3.out",
    scrollTrigger: { trigger: ".offer h2", start: "top 88%", once: true }
  });
  gsap.to(".circle-cta", {
    rotate: 10,
    ease: "none",
    scrollTrigger: { trigger: ".offer", start: "top bottom", end: "bottom top", scrub: .25 }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
})();
