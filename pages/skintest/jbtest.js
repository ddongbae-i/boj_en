// Restore reset and wishlist for jb-test (JB namespace)
(function (w) {
  "use strict";
  if (!w || !w.JB) return;
  var JB = w.JB;
  if (JB.__restore_bindings_applied__) return;
  JB.__restore_bindings_applied__ = true;

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.from(document.querySelectorAll(sel)); };

  // Reset button
  function bindReset() {
    var btn = $("#resetBtn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      try {
        JB.state.currentIndex = 0;
        // jb-test has 5 questions
        JB.state.answers = Array(5).fill(null);
        JB.state.profile = null;
        if (typeof w.renderQuestion === "function") {
          // Some builds expose renderQuestion globally
          w.renderQuestion();
        } else if (typeof JB.renderQuestion === "function") {
          JB.renderQuestion();
        }
        JB.showSection && JB.showSection("quiz");
      } catch (err) {
        console.error("[JB Restore] reset error:", err);
      }
    }, { once: false });
  }

  // Single-card wishlist toggle
  function bindWishlistButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest(".product_card .add_btn") : null;
      if (!btn) return;
      e.preventDefault();

      var on = btn.classList.toggle("on");
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      var img = btn.querySelector("img.heart");
      if (img) {
        img.src = on ? "/asset/img/skintest/icon_heart_fill.svg"
                     : "/asset/img/skintest/icon_heart_stroke.svg";
      }
      syncWishlistAll();
    });
  }

  // ALL TO WISHLIST label/state sync
  function syncWishlistAll() {
    var allBtn = $("#wishlistBtn");
    if (!allBtn) return;
    var btns = $$(".product_card .add_btn");
    var allOn = btns.length > 0 && btns.every(function (b) { return b.classList.contains("on"); });
    allBtn.setAttribute("aria-pressed", allOn ? "true" : "false");
    var onLabel  = allBtn.dataset.labelOn  || "REMOVE ALL";
    var offLabel = allBtn.dataset.labelOff || "ALL TO WISHLIST";
    allBtn.textContent = allOn ? onLabel : offLabel;
  }

  // ALL TO WISHLIST click
  function bindWishlistAll() {
    var allBtn = $("#wishlistBtn");
    if (!allBtn) return;
    if (!allBtn.dataset.labelOn)  allBtn.dataset.labelOn  = "REMOVE ALL";
    if (!allBtn.dataset.labelOff) allBtn.dataset.labelOff = "ALL TO WISHLIST";
    syncWishlistAll();

    allBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var btns = $$(".product_card .add_btn");
      var allOn = allBtn.getAttribute("aria-pressed") === "true";
      btns.forEach(function (b) {
        b.classList.toggle("on", !allOn);
        b.setAttribute("aria-pressed", !allOn ? "true" : "false");
        var img = b.querySelector("img.heart");
        if (img) {
          img.src = !allOn ? "/asset/img/skintest/icon_heart_fill.svg"
                           : "/asset/img/skintest/icon_heart_stroke.svg";
        }
      });
      // ensure label updates after DOM changes
      setTimeout(syncWishlistAll, 0);
    });
  }

  function init() {
    bindReset();
    bindWishlistButtons();
    bindWishlistAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
