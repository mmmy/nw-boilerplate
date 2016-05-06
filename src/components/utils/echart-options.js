import echarts from 'echarts';
var factorCandleOption=function(candleBorder = true){

	var markLineOpt = {
	    animation: false,
	    // label: {
	    //     normal: {
	    //         formatter: 'y = 0.5 * x + 3',
	    //         textStyle: {
	    //             align: 'right'
	    //         }
	    //     }
	    // },
	    lineStyle: {
	        normal: {
	            type: 'solid',
	            color: '#f00',
	            width: '1',
	        }
	    },
	    // tooltip: {
	    //     formatter: 'y = 0.5 * x + 3'
	    // },
	    // data: [[{
	    //     coord: [0, 3],
	    //     symbol: 'none'
	    // }, {
	    //     coord: [20, 13],
	    //     symbol: 'none'
	    // }]]
	};

	var markPoint = {
		symbolSize: '10',
		itemStyle: {
			borderColor: '#0f0',
			borderWidth: 1,
			color: 'transparent',
		}
	};

	let option = {
			animation: false,
		    title: { show: false },
		    tooltip: {
		    	show: false,
		    	showContent: false,
		    },
		    toolbox: {
		    	show: false,
		    },
		    grid: {
		    	show: false,
		        left: '0',
		        right: '0',
		        bottom: '0'
		    },
		    xAxis: {
		        type: 'category',
		        data: [],
		        scale: true,
		        boundaryGap : false,
		        axisLine: {show: false},
		        splitLine: {show: false},
		        axisTick: {
		        	show: false
		        },
		        axisLabel:{
		        	show: false
		        },
		        splitNumber: 20,
		        min: 'dataMin',
		        max: 'dataMax'
		    },
		    yAxis: {
		        scale: true,
		        axisLine: {
		        	show: false
		        },
		        splitLine:{
		        	show: false
		        },
		        axisLabel:{
		        	show: false
		        },
		        axisTick: {
		        	show: false
		        },
		        splitArea: {
		            show: false
		        }
		    },
		    series: [
		        {
		            name: '上证指数',
		            type: 'candlestick',
		            data: [],
		            z: 1,
		            itemStyle: {
		            	normal: {
		            		borderWidth: candleBorder ? '1' : '0',
		            		color: candleBorder ? 'transparent' : '#aE0000',
		            		color0: candleBorder ? 'transparent' : '#5A5A5A',
		            		borderColor: '#aE0000',
		            		borderColor0: '#5A5A5A',
		            	},
		            	emphasis: {
		            		borderWidth: '1'
		            	}
		            },
		        },
		        {
		            name: 'dot line',
		            type: 'scatter',
		            symbolSize: 2,
		            itemStyle: {
		            	normal: {
		            		color: '#111',
		            	}
		            },
		            z: 3,
		            //xAxisIndex: [3],
		            //yAxisIndex: [3],
		            //data: dataAll[3],
		            markLine: markLineOpt,
		            markPoint: markPoint
		        },
		        {
		            name: '指数',
		            type: 'line',
		            smooth: true,
		            data: [],
		            symbol: 'none',
            		sampling: 'average',
		            showSymbol: false,
		            clipOverflow: false,
		            lineStyle: {
		            	normal: {
		            		width: '0',
		            	}
		            },
		            z: 2,
		            areaStyle: {
		                normal: {
		                    color: 'rgb(255,255,255)',
		                    opacity: 0.4
                		}
           		 	},
           		}
		    ]
		};
		return option;
}

var factorLineOption = function(){
	let lineOption = {
			animation: false,
			title: {
		        show: false,
		    },
		    tooltip: {
		    	show: false,
		    },
		    toolbox: {
		    	show: false,
		    },
		    grid: {
		    	show: false,
		        left: '0',
		        right: '0',
		        bottom: '0'
		    },
		    xAxis: {
		        type: 'value',
		        scale: true,
		        boundaryGap : false,
		        axisLine: {show: false},
		        splitLine: {show: false},
		        axisTick: {
		        	show: false
		        },
		        axisLabel:{
		        	show: false
		        },
		    },
		    yAxis: {
		        scale: true,
		        axisLine: {
		        	show: false
		        },
		        splitLine:{
		        	show: false
		        },
		        axisLabel:{
		        	show: false
		        },
		        axisTick: {
		        	show: false
		        },
		        splitArea: {
		            show: false
		        },
		    },
		    series: [
		        {
		            name: '指数',
		            type: 'line',
		            smooth: true,
		            data: [],
		            symbol: 'none',
            		sampling: 'average',
		            showSymbol: false,
		            lineStyle: {
		            	normal: {
		            		width: '1',
		            	}
		            },
		            areaStyle: {
		                normal: {
		                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
		                        offset: 0,
		                        color: 'rgb(255, 158, 68)'
		                    }, {
		                        offset: 1,
		                        color: 'rgb(255, 70, 131)'
		                    }])
                		}
           		 	},
           		 }
		    ],
			
		};
	return lineOption;
}

module.exports = {
	factorCandleOption,
	factorLineOption
};