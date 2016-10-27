
let setHightlightPrediction = (chart, id) => {
  let option = chart.getOption();

  const changeColor = (data, isSelected) => {
    data.lineStyle.normal.color = isSelected ? '#862020' : 'rgba(200, 200, 200, 0.5)';
    data.z = isSelected? 1 : -1;
  };
  for (let i = option.series.length; i--;) {
    // if (option.series[i].name === id) {
    //   changeColor(option.series[i]);
    //   break;
    // }
    (option.series[i].type == 'line') && changeColor(option.series[i], option.series[i].name === id);
  }

  chart.setOption(option);
}

let setPredictionChartHighlight = (id) => {
  let chart = window._predictionChart;
  chart.setActiveLine(id);
};

module.exports = {
	setHightlightPrediction,
  setPredictionChartHighlight
};