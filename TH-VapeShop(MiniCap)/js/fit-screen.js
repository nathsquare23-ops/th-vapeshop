// Scales the fixed 1920px design canvas to fit desktop browser widths.
(function () {
  var DESIGN_WIDTH = 1920;
  var MIN_WIDTH = 761;

  function fitScreen() {
    var html = document.documentElement;
    var body = document.body;

    if (window.innerWidth < MIN_WIDTH) {
      html.style.zoom = "";
      html.style.overflowX = "";
      body.style.minHeight = "";
      return;
    }

    var scale = window.innerWidth / DESIGN_WIDTH;
    html.style.zoom = scale;
    html.style.overflowX = "hidden";
    if (html.clientWidth < window.innerWidth) {
      scale = html.clientWidth / DESIGN_WIDTH;
      html.style.zoom = scale;
    }
    // keep the page filling the whole window height after scaling
    body.style.minHeight = (window.innerHeight / scale) + "px";
  }

  fitScreen();
  window.addEventListener("load", fitScreen);
  window.addEventListener("resize", fitScreen);
})();
