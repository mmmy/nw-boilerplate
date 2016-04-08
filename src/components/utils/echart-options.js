var factorCandleOption=function(){
	let option = {
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
		        axisLine: {onZero: false},
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
		            		borderWidth: '0.5'
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
		        axisLine: {onZero: false},
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
		        }
		    },
		    series: [
		        {
		            name: '指数',
		            type: 'line',
		            data: [],
		            showSymbol: false,
		        }
		    ]
		};
	return lineOption;
}

module.exports = {
	factorCandleOption,
	factorLineOption
};