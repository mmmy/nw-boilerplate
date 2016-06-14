const getChart = (type) => {
  let i = null;
  switch (type) {
    case 'main':
      i = 1;
      break;
    case 'comparator':
      i = 0;
      break;
    default:
      return undefined;
  }

  return document[window.document.getElementsByTagName('iframe')[i].id];
}

const setChartLayout = () => {
  setInterval(() => {
    let chart = window.widget_comparator
    if (chart.W76 && chart.Q5) {
      setChartLayout();
      chart.W76.setChartLayout(chart.Q5, 'ks');
    }
  }, 0);
}


const getComparatorSize = () => {
  setTimeout(() => {
    let chart = getChart('comparator');
    if (!chart.Q2) {
      getComparatorSize();
    } else {
      chart = getChart('comparator');
      return {
        h: chart.Q2._jqMainDiv.context.clientHeight,
        w: chart.Q2._jqMainDiv.context.clientWidth
      }
    }
  }, 1E3)
}

module.exports = {
	setChartLayout,
  getChart,
  getComparatorSize
}
