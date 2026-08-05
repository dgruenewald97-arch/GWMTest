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
    .fromTo(".hero h1 > span", { yPercent: 118, rotation: 2 }, { yPercent: 0, rotation: 0, duration: .72, stagger: .04 })
    .from(".hero-topline > *, .hero-bottom > *", { y: 14, autoAlpha: 0, duration: .38, stagger: .035 }, "-=.42");

  gsap.to(".hero h1", {
    yPercent: -4,
    scale: .94,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .2 }
  });

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
  gsap.to(".manifesto-rule i", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top 70%", end: "bottom 55%", scrub: .2 }
  });

  if (!compact) {
    const designShots = gsap.utils.toArray(".reel-shot");
    const designCount = document.querySelector("[data-design-count]");
    const designTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".design-reel",
        start: "top top",
        end: "bottom bottom",
        scrub: .2,
        onUpdate: (self) => {
          if (designCount) designCount.textContent = `${String(Math.min(4, Math.floor(self.progress * 4) + 1)).padStart(2, "0")} / 04`;
        }
      }
    });
    designTimeline.to(".design-progress i", { scaleX: 1, duration: 3 }, 0);
    designShots.slice(1).forEach((shot, index) => {
      designTimeline
        .to(shot, { clipPath: "inset(0 0% 0 0)", duration: .82, ease: "power3.inOut" }, index)
        .fromTo(shot.querySelector("img"), { scale: 1.08 }, { scale: 1, duration: .9, ease: "power2.out" }, index)
        .fromTo(shot.querySelector("figcaption"), { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .42 }, index + .32);
    });
    designTimeline
      .to(".award-stamp", { clipPath: "inset(0 0% 0 0)", duration: .82, ease: "power3.inOut" }, 2)
      .fromTo(".award-stamp b", { xPercent: 25 }, { xPercent: 0, duration: .78, ease: "power2.out" }, 2.08);
  }

  if (!compact) {
    gsap.set(".drive-mode i:last-child, .drive-count i:last-child", { yPercent: 120 });
    const driveTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".drive-stage", start: "top top", end: "bottom bottom", scrub: .2 }
    });
    driveTimeline
      .to(".drive-progress i", { scaleX: 1, duration: 1 }, 0)
      .to(".drive-panel--hybrid", { clipPath: "polygon(0 0,100% 0,105% 100%,0 100%)", duration: 1, ease: "power2.inOut" }, 0)
      .to(".drive-mode i:first-child, .drive-count i:first-child", { yPercent: -120, duration: .25 }, .38)
      .to(".drive-mode i:last-child, .drive-count i:last-child", { yPercent: 0, duration: .25 }, .42)
      .fromTo(".drive-trust span", { y: 10 }, { y: 0, stagger: .025, duration: .2 }, .58);
  }

  if (!compact) {
    const interiorScenes = gsap.utils.toArray(".interior-scene");
    const interiorCount = document.querySelector("[data-interior-count]");
    const interiorTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".interior",
        start: "top top",
        end: "bottom bottom",
        scrub: .2,
        onUpdate: (self) => {
          if (interiorCount) interiorCount.textContent = `${String(Math.min(3, Math.floor(self.progress * 3) + 1)).padStart(2, "0")} / 03`;
        }
      }
    });
    interiorTimeline.to(".interior-progress i", { scaleX: 1, duration: 2 }, 0);
    interiorScenes.slice(1).forEach((scene, index) => {
      interiorTimeline
        .to(scene, { clipPath: "inset(0 0 0% 0)", duration: .78, ease: "power3.inOut" }, index)
        .fromTo(scene.querySelector("img"), { scale: 1.1 }, { scale: 1, duration: .88, ease: "power2.out" }, index)
        .fromTo(scene.querySelector("figcaption"), { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .4 }, index + .3);
    });
  }

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
        .fromTo(scene.querySelector("h2"), { xPercent: -6 }, { xPercent: 0, duration: .72, ease: "power2.out" }, at + .06);
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
    rotation: 9,
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
