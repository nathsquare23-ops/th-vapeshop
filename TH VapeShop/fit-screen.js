// Scales every page so it looks like the 1920px wide Figma design,
// no matter the screen size or Windows display scaling.
(function () {
  var DESIGN_WIDTH = 1920;   // width of your Figma frames
  var MIN_WIDTH = 1000;      // below this (phones, small tablets) keep the normal layout

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
    // keep the page filling the whole window height after scaling
    body.style.minHeight = (window.innerHeight / scale) + "px";
  }

  fitScreen();
  window.addEventListener("resize", fitScreen);
})();
