
let setChartLayout = () => {
  setTimeout(() => {
    var tv = document[window.document.getElementsByTagName('iframe')[0].id];
    if (!tv.W76 || !tv.Q5) {
      setChartLayout();
    } else {
      const tv = window.document[window.document.getElementsByTagName('iframe')[0].id];
      tv.W76.setChartLayout(tv.Q5, '2v');
    }
  }, 2E3)
}

module.exports = {
	setChartLayout,
}
