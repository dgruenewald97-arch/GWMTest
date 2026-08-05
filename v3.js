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
    .from(".hero-sign", { scale: .2, autoAlpha: 0, rotate: -90, duration: .55 }, "-=.35");

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
    const sign = document.querySelector(".hero-sign");
    const xTo = sign && gsap.quickTo(sign, "x", { duration: .26, ease: "power3.out" });
    const yTo = sign && gsap.quickTo(sign, "y", { duration: .26, ease: "power3.out" });
    const rotateTo = sign && gsap.quickTo(sign, "rotate", { duration: .34, ease: "power3.out" });
    hero?.addEventListener("pointermove", (event) => {
      const x = event.clientX / innerWidth - .5;
      const y = event.clientY / innerHeight - .5;
      xTo?.(x * 42);
      yTo?.(y * 34);
      rotateTo?.(x * 24);
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
    const label = document.querySelector("[data-drive-label]");
    const count = document.querySelector("[data-drive-count]");
    if (label) label.dataset.hybrid = "false";
    const driveTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".drive-stage",
        start: "top top",
        end: "bottom bottom",
        scrub: .3,
        onUpdate: (self) => {
          gsap.set(".drive-progress i", { scaleX: self.progress });
          const hybrid = self.progress > .5;
          if (label && label.dataset.hybrid !== String(hybrid)) {
            label.dataset.hybrid = String(hybrid);
            gsap.to([label, count], {
              autoAlpha: 0,
              y: -8,
              duration: .12,
              overwrite: true,
              onComplete: () => {
                label.textContent = hybrid ? "Hybrid" : "Turbo";
                count.textContent = hybrid ? "02 / 02" : "01 / 02";
                gsap.fromTo([label, count], { y: 8 }, { y: 0, autoAlpha: 1, duration: .18, ease: "power2.out" });
              }
            });
          }
        }
      }
    });
    driveTimeline
      .to(".drive-sticky", { backgroundColor: "#d8ff36", duration: 1 }, 0)
      .to(".drive-car--turbo", { autoAlpha: 0, xPercent: -12, scale: .94, duration: .45 }, .18)
      .to(".drive-copy--turbo", { autoAlpha: 0, y: -34, duration: .35 }, .22)
      .to(".drive-word span:first-child", { autoAlpha: 0, yPercent: -25, duration: .4 }, .18)
      .to(".drive-car--hybrid", { autoAlpha: 1, xPercent: 0, scale: 1, duration: .48 }, .4)
      .to(".drive-copy--hybrid", { autoAlpha: 1, y: 0, duration: .38 }, .48)
      .to(".drive-word span:last-child", { autoAlpha: 1, yPercent: 0, duration: .4 }, .42)
      .fromTo(".drive-trust span", { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .04, duration: .25 }, .68);
  }

  gsap.to(".interior-visual img", {
    scale: 1,
    yPercent: 6,
    ease: "none",
    scrollTrigger: { trigger: ".interior", start: "top bottom", end: "45% top", scrub: .28 }
  });
  document.querySelectorAll(".interior-grid figure").forEach((figure, index) => {
    gsap.from(figure, {
      clipPath: index ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
      duration: .68,
      ease: "power3.inOut",
      scrollTrigger: { trigger: figure, start: "top 88%", once: true }
    });
    gsap.to(figure.querySelector("img"), {
      yPercent: index ? -5 : 5,
      scale: 1.06,
      ease: "none",
      scrollTrigger: { trigger: figure, start: "top bottom", end: "bottom top", scrub: .25 }
    });
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
    const getDistance = () => Math.max(0, rail.scrollWidth - innerWidth);
    const railTween = gsap.to(rail, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".chromatic",
        start: "top top",
        end: () => "+=" + getDistance(),
        pin: true,
        scrub: .3,
        invalidateOnRefresh: true
      }
    });
    document.querySelectorAll(".color-scene").forEach((scene) => {
      gsap.fromTo(scene.querySelector("h2"), { xPercent: 8 }, {
        xPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: scene, containerAnimation: railTween, start: "left right", end: "right left", scrub: .2 }
      });
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
