'use strict';

var getChart = function getChart(type) {
  var i = null;
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
};

// var setChartLayout = function setChartLayout() {
//   setInterval(function () {
//     var chart = window.widget_comparator;
//     if (chart.W76 && chart.Q5) {
//       setChartLayout();
//       chart.W76.setChartLayout(chart.Q5, 'ks');
//     }
//   }, 0);
// };

var getComparatorSize = function getComparatorSize() {
  setTimeout(function () {
    var chart = getChart('comparator');
    if (!chart.Q2) {
      getComparatorSize();
    } else {
      chart = getChart('comparator');
      return {
        h: chart.Q2._jqMainDiv.context.clientHeight,
        w: chart.Q2._jqMainDiv.context.clientWidth
      };
    }
  }, 1E3);
};

module.exports = {
  // setChartLayout: setChartLayout,
  getChart: getChart,
  getComparatorSize: getComparatorSize
};