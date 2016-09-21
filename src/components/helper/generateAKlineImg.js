// // import echarts from 'echarts';
// import {factorCandleOption , factorLineOption} from '../utils/echart-options';

// //let candleChart = true;
// let _initOption_200 = factorCandleOption(true),
// 		_initOption_80 = factorCandleOption(true);

// let _canvasNode_200 = (() => { 
// 										let node = window.document.createElement('canvas');
// 										node.width = 200;
// 										node.height = 140;
// 										return node;
// 									})();

// let _canvasNode_80 = (() => { 
// 										let node = window.document.createElement('canvas');
// 										node.width = 80;
// 										node.height = 97;
// 										return node;
// 									})();

// let _chart_200 = echarts.init(_canvasNode_200),
// 		_chart_80 = echarts.init(_canvasNode_80);

// _chart_200.setOption(_initOption_200);
// _chart_80.setOption(_initOption_80);

// function splitData(rawData, baseBars) {
// 	//console.log('baseBars', baseBars);
//     var categoryData = [];
//     var values = [];

//     var lowArr = [], highArr = [];

//     for (var i = 0; i < rawData.length; i++) {
//         categoryData.push(rawData[i].slice(0, 1)[0]);
//         values.push(rawData[i].slice(1));
//         lowArr.push(isNaN(+rawData[i][3]) ? Infinity : +rawData[i][3]);
//         highArr.push(isNaN(+rawData[i][4]) ? -Infinity : +rawData[i][4]);
//     }
//     //console.log(highArr);
//     var min = Math.min.apply(null, lowArr);
//     var max = Math.max.apply(null, highArr);

//     var arange10 = [];
//     for (var i=0; i < 20; i++) {
//     	arange10.push([categoryData[baseBars-1], min + (max - min) / 20 * i]);
//     }

//     var areaData = categoryData.slice(baseBars-1).map((e) => {
//     	return [e, max];
//     });

//     return {
//         categoryData: categoryData,
//         values: values,
//         lineData: arange10,
//         areaData: areaData,
//         yMin: min,
//         yMax: max,
//     };
// }

// //return a image data url
// export default (kline=[[]], baseBars=0, normalSize=true, smallSize=true) => {
// 	let urls = {normal:'', small:''};
// 	if(kline.length < 1 || (!normalSize && !smallSize)) return urls;

// 	let data0 = splitData(kline, baseBars);
// 	if(normalSize) {
// 		let oldOption200 = factorCandleOption(true);
// 		oldOption200.xAxis.data = data0.categoryData;
// 		oldOption200.series[0].data = data0.values;
// 		oldOption200.series[1].data = data0.lineData;
// 		oldOption200.series[2].data = data0.areaData;
// 		// oldOption200.yAxis.min = data0.yMin;
// 		oldOption200.yAxis.max = data0.yMax;
// 		_chart_200.setOption(oldOption200);
// 	  let normal = _chart_200.getDataURL();
// 	  urls.normal = normal;
// 	}
// 	if(smallSize) {
// 		let oldOption80 = _chart_80.getOption();
// 		oldOption80.xAxis.data = data0.categoryData;
// 		oldOption80.series[0].data = data0.values;
// 		oldOption80.series[1].data = data0.lineData;
// 		oldOption80.series[2].data = data0.areaData;
// 		// oldOption80.yAxis.min = data0.yMin;
// 		oldOption80.yAxis.max = data0.yMax;
// 		_chart_80.setOption(oldOption80);
// 	  let small = _chart_80.getDataURL();
// 	  urls.small = small;
// 	}
// 	return urls;
// };
