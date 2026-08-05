(() => {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compact = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
  const nav = document.querySelector("[data-nav]");
  const mobileCta = document.querySelector(".mobile-cta");
  const pageProgress = document.querySelector(".page-progress i");
  const chapterIndex = document.querySelector("[data-chapter-index]");
  const chapterName = document.querySelector("[data-chapter-name]");
  const chapters = [
    [".hero", "00", "Intro"],
    [".manifesto", "01", "Statement"],
    [".design-reel", "02", "Form"],
    [".drive-stage", "03", "Drive"],
    [".interior", "04", "Inside"],
    [".space", "05", "Space"],
    [".chromatic", "06", "Colour"],
    [".offer", "07", "Offer"]
  ].map(([selector, index, name]) => ({ element: document.querySelector(selector), index, name }));

  let chromeFrame = 0;
  let activeChapter = "";
  const renderChrome = () => {
    chromeFrame = 0;
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    nav?.classList.toggle("is-scrolled", y > 120);
    mobileCta?.classList.toggle("visible", y > 560);
    if (pageProgress) pageProgress.style.transform = `scaleX(${Math.min(1, y / max)})`;

    let current = chapters[0];
    const probe = y + innerHeight * .42;
    chapters.forEach((chapter) => {
      if (chapter.element && chapter.element.offsetTop <= probe) current = chapter;
    });
    if (current && current.index !== activeChapter) {
      activeChapter = current.index;
      if (chapterIndex) chapterIndex.textContent = current.index;
      if (chapterName) chapterName.textContent = current.name;
    }
  };
  const requestChrome = () => {
    if (!chromeFrame) chromeFrame = requestAnimationFrame(renderChrome);
  };
  window.addEventListener("scroll", requestChrome, { passive: true });
  window.addEventListener("resize", requestChrome, { passive: true });
  renderChrome();

  if (!window.gsap || !window.ScrollTrigger || reduce) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!compact && window.Lenis) {
    lenis = new window.Lenis({
      duration: .38,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: .96
    });
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      requestChrome();
    });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target || !lenis) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: .72 });
    });
  });

  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  intro
    .fromTo(".hero h1 > span", { yPercent: 118, rotate: 2 }, { yPercent: 0, rotate: 0, duration: .72, stagger: .04 })
    .from(".hero-topline > *, .hero-bottom > *", { y: 14, autoAlpha: 0, duration: .38, stagger: .035 }, "-=.42")
    .from(".hero-sign", { scale: .15, autoAlpha: 0, rotate: -110, duration: .58 }, "-=.34");

  gsap.to(".hero h1 > span:nth-child(odd)", {
    yPercent: -13,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .2 }
  });
  gsap.to(".hero h1 > span:nth-child(even)", {
    yPercent: 10,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .2 }
  });

  if (window.matchMedia("(pointer: fine)").matches) {
    const hero = document.querySelector(".hero");
    const sign = document.querySelector(".hero-sign");
    const xTo = sign && gsap.quickTo(sign, "x", { duration: .24, ease: "power3.out" });
    const yTo = sign && gsap.quickTo(sign, "y", { duration: .24, ease: "power3.out" });
    const rotateTo = sign && gsap.quickTo(sign, "rotate", { duration: .3, ease: "power3.out" });
    hero?.addEventListener("pointermove", (event) => {
      const x = event.clientX / innerWidth - .5;
      const y = event.clientY / innerHeight - .5;
      xTo?.(x * 44);
      yTo?.(y * 32);
      rotateTo?.(x * 22);
    });
  }

  gsap.to(".first-look-media img", {
    yPercent: 6,
    scale: 1,
    ease: "none",
    scrollTrigger: { trigger: ".first-look", start: "top bottom", end: "bottom top", scrub: .22 }
  });
  gsap.from(".project-meta > *", {
    y: 12,
    autoAlpha: 0,
    duration: .38,
    stagger: .035,
    scrollTrigger: { trigger: ".project-meta", start: "top 94%", once: true }
  });

  gsap.fromTo(".manifesto h2 span:first-child", { xPercent: -16 }, {
    xPercent: 0,
    ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "center center", scrub: .22 }
  });
  gsap.fromTo(".manifesto h2 span:last-child", { xPercent: 16 }, {
    xPercent: 0,
    ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "center center", scrub: .22 }
  });
  gsap.to(".manifesto-mark", {
    rotate: 145,
    ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: .2 }
  });

  document.querySelectorAll(".reel-shot").forEach((shot, index) => {
    const media = shot.querySelector(":scope > div");
    const image = shot.querySelector("img");
    gsap.from(media, {
      clipPath: index % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
      duration: .74,
      ease: "power3.inOut",
      scrollTrigger: { trigger: shot, start: "top 86%", once: true }
    });
    gsap.to(image, {
      yPercent: 5,
      ease: "none",
      scrollTrigger: { trigger: shot, start: "top bottom", end: "bottom top", scrub: .22 }
    });
    gsap.from(shot.querySelector("figcaption"), {
      y: 26,
      autoAlpha: 0,
      duration: .48,
      ease: "power3.out",
      scrollTrigger: { trigger: shot, start: "top 78%", once: true }
    });
  });
  gsap.from(".award-stamp b", {
    xPercent: 35,
    ease: "none",
    scrollTrigger: { trigger: ".award-stamp", start: "top bottom", end: "bottom 60%", scrub: .2 }
  });

  if (!compact) {
    gsap.set(".drive-mode i:last-child, .drive-count i:last-child", { yPercent: 120 });
    const driveTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".drive-stage", start: "top top", end: "bottom bottom", scrub: .2 }
    });
    driveTimeline
      .to(".drive-sticky", { backgroundColor: "#d8ff36", duration: 1 }, 0)
      .to(".drive-progress i", { scaleX: 1, duration: 1 }, 0)
      .to(".drive-car--turbo", { xPercent: -2, scale: .985, duration: 1 }, 0)
      .to(".drive-car--hybrid", { clipPath: "inset(0 0% 0 0)", xPercent: 0, scale: 1, duration: .66 }, .17)
      .to(".drive-copy--turbo", { clipPath: "inset(0 0 100% 0)", y: -24, autoAlpha: 0, duration: .28 }, .28)
      .to(".drive-copy--hybrid", { y: 0, autoAlpha: 1, duration: .34 }, .46)
      .to(".drive-word span:first-child", { yPercent: -30, autoAlpha: 0, duration: .34 }, .24)
      .to(".drive-word span:last-child", { yPercent: 0, autoAlpha: 1, duration: .38 }, .42)
      .to(".drive-mode i:first-child, .drive-count i:first-child", { yPercent: -120, duration: .25 }, .38)
      .to(".drive-mode i:last-child, .drive-count i:last-child", { yPercent: 0, duration: .25 }, .42)
      .fromTo(".drive-trust span", { y: 10 }, { y: 0, stagger: .025, duration: .2 }, .58);
  }

  gsap.to(".interior-visual img", {
    yPercent: 6,
    scale: 1,
    ease: "none",
    scrollTrigger: { trigger: ".interior", start: "top bottom", end: "45% top", scrub: .22 }
  });
  document.querySelectorAll(".interior-grid figure").forEach((figure, index) => {
    gsap.from(figure, {
      clipPath: index ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
      duration: .7,
      ease: "power3.inOut",
      scrollTrigger: { trigger: figure, start: "top 88%", once: true }
    });
    gsap.to(figure.querySelector("img"), {
      yPercent: index ? -4 : 4,
      scale: 1.055,
      ease: "none",
      scrollTrigger: { trigger: figure, start: "top bottom", end: "bottom top", scrub: .22 }
    });
  });

  document.querySelectorAll(".space-word span").forEach((line, index) => {
    gsap.fromTo(line, { xPercent: index % 2 ? 14 : -14 }, {
      xPercent: 0,
      ease: "none",
      scrollTrigger: { trigger: ".space", start: "top 82%", end: "center 48%", scrub: .2 }
    });
  });

  if (!compact) {
    const colorScenes = gsap.utils.toArray(".color-scene");
    const colorTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".chromatic", start: "top top", end: "bottom bottom", scrub: .22 }
    });
    colorScenes.slice(1).forEach((scene, index) => {
      const at = index;
      colorTimeline
        .to(scene, { clipPath: "inset(0 0% 0 0)", duration: .78, ease: "power2.inOut" }, at)
        .fromTo(scene.querySelector("img"), { xPercent: 18, scale: .92, rotate: 1.5 }, { xPercent: 0, scale: 1, rotate: 0, duration: .82, ease: "power2.out" }, at)
        .fromTo(scene.querySelector("h2"), { xPercent: -10 }, { xPercent: 0, duration: .72, ease: "power2.out" }, at + .06);
    });
  }

  gsap.from(".offer h2", {
    yPercent: 22,
    autoAlpha: 0,
    duration: .66,
    ease: "power3.out",
    scrollTrigger: { trigger: ".offer h2", start: "top 88%", once: true }
  });
  gsap.to(".circle-cta", {
    rotate: 9,
    ease: "none",
    scrollTrigger: { trigger: ".offer", start: "top bottom", end: "bottom top", scrub: .22 }
  });

  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".circle-cta, .nav-offer").forEach((button) => {
      const xTo = gsap.quickTo(button, "x", { duration: .22, ease: "power3.out" });
      const yTo = gsap.quickTo(button, "y", { duration: .22, ease: "power3.out" });
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * .13);
        yTo((event.clientY - rect.top - rect.height / 2) * .13);
      });
      button.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    requestChrome();
  }, { once: true });
})();
