(function () {
  "use strict";

  var mobileQuery = window.matchMedia("(max-width:900px)");
  var reducedQuery = window.matchMedia("(prefers-reduced-motion:reduce)");

  document.querySelectorAll("[data-gwm-colors-v2]").forEach(function (root) {
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-color-panel]"));
    var buttons = Array.prototype.slice.call(root.querySelectorAll("[data-color-index]"));
    var label = root.querySelector("[data-model-name]");
    var firstName = root.querySelector("[data-name-first]");
    var lastName = root.querySelector("[data-name-last]");
    var status = root.querySelector("[data-color-status]");
    var hoverZones = Array.prototype.slice.call(root.querySelectorAll("[data-hover-index]"));
    var current = -1;
    var running = false;
    var pending = null;
    var baseName = { first:"GWM", last:"ORA 5", name:"GWM ORA 5", announce:false };

    function colorInfo(index) {
      var button = root.querySelector('[data-color-index="' + index + '"]');
      var words = button.dataset.name.split(" ");
      return { index:index, first:words.slice(0,-1).join(" "), last:words[words.length-1], name:button.dataset.name, price:button.dataset.price };
    }

    function panelFor(index) { return root.querySelector('[data-color-panel="' + index + '"]'); }
    function baseClip(panel) { return "inset(0 " + panel.dataset.sliceEnd + "% 0 " + panel.dataset.sliceStart + "%)"; }

    function setLabel(info) {
      firstName.textContent = info.first;
      lastName.textContent = info.last;
      label.classList.toggle("is-color-name", info.announce !== false);
      if (info.announce !== false) status.textContent = info.name + ", " + info.price + " ausgewählt";
    }

    function animateLabel(info, delay) {
      window.setTimeout(function () {
        if (reducedQuery.matches || !label.animate) { setLabel(info); return; }
        label.animate([{opacity:1,transform:"translate3d(0,0,0)"},{opacity:0,transform:"translate3d(0,10px,0)"}],
          {duration:120,easing:"ease-in",fill:"forwards"}).finished.then(function () {
            setLabel(info);
            return label.animate([{opacity:0,transform:"translate3d(0,-10px,0)"},{opacity:1,transform:"translate3d(0,0,0)"}],
              {duration:190,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"}).finished;
          }).catch(function () { setLabel(info); });
      }, delay);
    }

    function setActive(index) {
      buttons.forEach(function (button) {
        var active = Number(button.dataset.colorIndex) === index;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function animatePanel(panel, open, duration) {
      var fromClip = open ? baseClip(panel) : "inset(0 0 0 0)";
      var toClip = open ? "inset(0 0 0 0)" : baseClip(panel);
      panel.style.zIndex = open ? "5" : "5";

      if (reducedQuery.matches || !panel.animate) {
        panel.style.clipPath = toClip;
        if (!open) panel.style.zIndex = "1";
        return Promise.resolve();
      }

      var options = {duration:duration,easing:"cubic-bezier(.65,0,.2,1)",fill:"forwards"};
      var panelAnimation = panel.animate([{clipPath:fromClip},{clipPath:toClip}],options);

      return panelAnimation.finished.then(function () {
        panel.style.clipPath = toClip;
        if (!open) panel.style.zIndex = "1";
      });
    }

    function finish(index) {
      current = index;
      running = false;
      if (pending !== null && pending !== current) {
        var next = pending;
        pending = null;
        changeTo(next);
      } else pending = null;
    }

    function openColor(index) {
      var panel = panelFor(index);
      var info = colorInfo(index);
      root.classList.remove("is-resetting");
      root.classList.add("has-selection");
      animateLabel(info, 170);
      animatePanel(panel, true, 620).then(function () { finish(index); }).catch(function () { finish(index); });
    }

    function changeTo(index) {
      if (index === current && !running) { resetToBase(); return; }
      if (running) { pending = index; return; }
      running = true;
      setActive(index);

      if (current < 0) { openColor(index); return; }

      root.classList.remove("has-selection");
      animateLabel(baseName, 70);
      animatePanel(panelFor(current), false, 380).then(function () {
        window.setTimeout(function () { openColor(index); }, 90);
      }).catch(function () { openColor(index); });
    }

    function resetToBase() {
      if (current < 0 || running) return;
      running = true;
      pending = null;
      setActive(-1);
      root.classList.remove("has-selection");
      root.classList.add("is-resetting");
      animateLabel(baseName, 60);
      animatePanel(panelFor(current), false, 420).then(function () {
        current = -1;
        running = false;
      }).catch(function () {
        current = -1;
        running = false;
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("mousedown", function (event) { event.preventDefault(); });
      button.addEventListener("click", function () { changeTo(Number(button.dataset.colorIndex)); });
    });

    hoverZones.forEach(function (zone) {
      zone.addEventListener("click", function () {
        if (current >= 0 && !running) resetToBase();
        else changeTo(Number(zone.dataset.hoverIndex));
      });
      zone.addEventListener("pointerleave", function () { root.classList.remove("is-resetting"); });
    });

    panels.forEach(function (panel) {
      var image = panel.querySelector("img");
      if (image.decode) image.decode().catch(function () {});
    });
  });
})();
