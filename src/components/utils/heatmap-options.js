
let _yMax = 100;
let _yMin = -100;

let generateHeatMapOption = () => {
	let option = {
      tooltip: {
        show: false,
        showContent: false
      },
      animation: false,
      grid: {
        height: '100%',
        y: 0,
        borderColor: '#000',
        borderWidth: 0,
        right: 57.5,
        left: 0.5,
        top: -0.5,
        bottom: -0.5
      },
      xAxis: {
        show: false,
        type: 'category',
        data: ['0']
      },
      yAxis: {
        show: true,
        type: 'category',
        data: [],//priceScale,
        axisLine: {
          show: false,
        },
        splitNumber: 5,
        axisLabel: {
          formatter: function(params){
            // console.debug(arguments);
            if(!params) return;
            var points = params.split(':');
            var center = (parseFloat(points[0]) + parseFloat(points[1])) / 2;
            // var percentage = (_yMax - _yMin) / $chartDom.height() * center + _yMin;
            // return  percentage.toFixed(0) + '%';
            return '10%';
          },
          textStyle: {
            color: '#656565',
            fontStyle: 'italic',
            fontWeight: 'lighter',
            fontSize: 10
          },
          margin: 16
        },
        axisTick: {
          show: false
        },
        position: 'right',
        // type: 'value',
        boundaryGap: [0, '100%'],
        // splitLine: {
        //   show: false
        // },
        // minInterval: 1,
      },
      visualMap: {
        show: false,
        min: 0,
        max: 100,
        calculable: false,
        orient: 'vertical',
        left: 'center',
        bottom: '15%',
        // color: ['#982C2F', '#C23433', '#E42329', '#F63A3B'] // 从大到小排列
        // color: ['#831211', '#A40A07', '#B70A05', '#D90A03', '#FC0900', '#C6C7C8'] // 从大到小排列
        color: ['#651818', '#751c1c', '#862020', '#972424', '#A82828', '#C7C7C7']

      },
      series: [{
        name: 'Punch Card',
        type: 'heatmap',
        data: [],//data,
        silent: true,
        label: {
          normal: {
            show: false
          }
        },
        itemStyle: {
          normal: {
            borderColor: '#fff',//'rgba(0,0,0,0)',//'#C6C7C8',
            borderWidth: 1
          },
          emphasis: {

          }
        }
      }],
      // backgroundColor: '#C6C7C8',
    };

    return option;
};

module.exports = {
	generateHeatMapOption,
};