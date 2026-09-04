// Hangul Technologies — shared site behaviour

(function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Highlight current nav link
  var path = location.pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav-links a[data-path]").forEach(function (a) {
    var target = a.getAttribute("data-path");
    if (target === path || (target !== "/" && path.indexOf(target) === 0)) {
      a.setAttribute("aria-current", "page");
    }
  });

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Scroll-reveal animations
  var revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");
  if (revealTargets.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      revealTargets.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealTargets.forEach(function (el) {
        el.classList.add("in-view");
      });
    }
  }

  // Product showcase tabs (homepage) — click to select, auto-advances like a slideshow.
  var showcaseTabsList = document.querySelectorAll(".showcase-tab");
  var showcasePanel = document.querySelector(".showcase-panel");
  if (showcaseTabsList.length && showcasePanel) {
    var showcaseTabs = Array.prototype.slice.call(showcaseTabsList);

    var activateShowcaseTab = function (tab) {
      var id = tab.getAttribute("data-target");

      showcaseTabs.forEach(function (t) {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });

      document.querySelectorAll(".showcase-content").forEach(function (panel) {
        panel.classList.toggle("active", panel.getAttribute("data-id") === id);
      });

      showcasePanel.style.setProperty("--panel-accent", tab.getAttribute("data-accent") || "");
    };

    var showcaseReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var SHOWCASE_INTERVAL_MS = 4200;
    var showcaseTimer = null;

    function showcaseAdvance() {
      var current = showcaseTabs.findIndex(function (t) {
        return t.classList.contains("active");
      });
      var next = showcaseTabs[(current + 1) % showcaseTabs.length];
      activateShowcaseTab(next);
    }
    function startShowcaseAutoplay() {
      if (showcaseReducedMotion) return;
      stopShowcaseAutoplay();
      showcaseTimer = setInterval(showcaseAdvance, SHOWCASE_INTERVAL_MS);
    }
    function stopShowcaseAutoplay() {
      if (showcaseTimer) {
        clearInterval(showcaseTimer);
        showcaseTimer = null;
      }
    }

    showcaseTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateShowcaseTab(tab);
        startShowcaseAutoplay(); // restart the countdown after a manual pick
      });
    });

    var showcaseSection = document.querySelector(".showcase");
    if (showcaseSection) {
      showcaseSection.addEventListener("mouseenter", stopShowcaseAutoplay);
      showcaseSection.addEventListener("mouseleave", startShowcaseAutoplay);
    }

    startShowcaseAutoplay();
  }

  // Subtle pointer-tilt on product cards (skip touch / reduced-motion)
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var supportsHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (supportsHover && !prefersReducedMotion) {
    document.querySelectorAll(".p-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "translateY(-4px) rotateX(" + (py * -6).toFixed(2) + "deg) rotateY(" + (px * 8).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  // Product interest pre-fill on contact page (?product=eduhan)
  var params = new URLSearchParams(location.search);
  var product = params.get("product");
  var select = document.querySelector("#product");
  if (product && select) {
    var match = Array.from(select.options).find(function (o) {
      return o.value.toLowerCase() === product.toLowerCase();
    });
    if (match) select.value = match.value;
  }

  // Contact form — no backend yet, so we hand off to the visitor's mail client.
  // Swap this handler for a real endpoint (Formspree, Getform, a Vercel function, etc.)
  // whenever one is wired up — see README.md.
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var productVal = (data.get("product") || "General enquiry").toString();
      var message = (data.get("message") || "").toString().trim();
      var status = document.querySelector("#form-status");

      if (!name || !email || !message) {
        if (status) {
          status.textContent = "Please fill in your name, email and message.";
          status.className = "form-status show err";
        }
        return;
      }

      var subject = "Website enquiry — " + productVal;
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Product: " + productVal + "\n\n" +
        message;

      var mailto =
        "mailto:contact@hangultech.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (status) {
        status.textContent = "Opening your email client to send this — if nothing happens, email contact@hangultech.com directly.";
        status.className = "form-status show ok";
      }
      window.location.href = mailto;
    });
  }
})();
