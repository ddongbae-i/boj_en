(function () {
  function applyProductCardStart() {
    if (!window.gsap || !window.ScrollTrigger) return;
    var isDesktop = window.matchMedia && window.matchMedia("(min-width: 1024px)").matches;
    var newStart = isDesktop ? "top 85%" : "top 90%";
    var changed = 0;
    window.ScrollTrigger.getAll().forEach(function (st) {
      try {
        if (st && st.trigger && st.trigger.classList && st.trigger.classList.contains("product_card")) {
          if (st.vars && st.vars.start !== newStart) {
            st.vars.start = newStart;
            // ensure immediateRender doesn't interfere; leave as-is.
            st.invalidate && st.invalidate();
            st.refresh();
            changed++;
          }
        }
      } catch (e) {}
    });
    // If there were no existing ScrollTriggers for product_card, we won't create new ones to avoid altering behavior.
    // The existing jbtest.js should already have set them up.
    return changed;
  }

  function raf(fn){ return (window.requestAnimationFrame || function(cb){ return setTimeout(cb, 16); })(fn); }

  // Run when DOM is ready and after a short delay so that original triggers are created.
  function initAdjust() {
    // run a couple times to catch late creations
    raf(function(){ applyProductCardStart(); });
    setTimeout(applyProductCardStart, 60);
    setTimeout(function(){ applyProductCardStart(); window.ScrollTrigger && window.ScrollTrigger.refresh(); }, 180);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdjust);
  } else {
    initAdjust();
  }

  // Update on resize with debounce
  var resizeTO;
  window.addEventListener("resize", function(){
    clearTimeout(resizeTO);
    resizeTO = setTimeout(function(){
      var changed = applyProductCardStart();
      if (changed && window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    }, 120);
  });
})();
