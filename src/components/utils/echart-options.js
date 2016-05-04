import echarts from 'echarts';
var factorCandleOption=function(){
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
		            itemStyle: {
		            	normal: {
		            		borderWidth: '1',
		            		color: 'transparent',
		            		color0: 'transparent',
		            		borderColor: '#aE0000',
		            		borderColor0: '#5A5A5A',
		            	},
		            	emphasis: {
		            		borderWidth: '1'
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