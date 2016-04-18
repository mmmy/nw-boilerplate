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
  setTimeout(() => {
    let chart = getChart('comparator');
    if (!chart.W76 || !chart.Q5) {
      setChartLayout();
    } else {
      let chart = getChart('comparator');
      chart.W76.setChartLayout(chart.Q5, '2v');
    }
  }, 1E3);
}


const getComparatorSize = () => {
  // setTimeout(() => {
  //   let chart = getChart('comparator');
  //   if (!chart.Q2) {
  //     getComparatorSize();
  //   } else {
  //     chart = getChart('comparator');
  //     return chart.Q2._jqMainDiv;
  //   }
  // }, 1E3)
}

module.exports = {
	setChartLayout,
  getChart,
  getComparatorSize
}
