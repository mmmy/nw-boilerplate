
let setRem = () => {
  let baseWindow_W = 1600,
      baseFontSize = 10;
  let scale = 0.5;

  let window_W = window.document.body.clientWidth;
  window_W = window_W > 1600 ? 1600 : window_W;
  let fontSize = window_W / 200 + 2 

  window.document.body.parentNode.style.fontSize = fontSize + 'px';
};

module.exports = {
	setRem,
};