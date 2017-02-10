
import helperModal from './helperModal';
import crossfilter from 'crossfilter';
import PredictionWidget from '../PredictionWidget';
import BlockHeatMap from '../BlockHeatMap';
import getPrice from '../../backend/getPrice';
import OCLHTooltip from '../OCLHTooltip';

let { getLatestPrice, getPriceFromSina } = getPrice;

var scannerController = {};

var _$container = null;
var _$filterTable = null;
var _$listWrapper = null;
var _datafeed = null;
var _data = {date:'',list:[]};

var _aggregateRanges = [[-Infinity, 200],[200, 300],[300, 500],[500, 1000],[1000, 2000], [2000, Infinity]];

var _crossfilter = null; //统计信息

var _dimensions = [];
var _dimIndex = null;

//right panel
var _pieCharts = [];
var _barCharts = [];

//k线图
var _predictionCharts = [];
var _heatmapCharts = [];
var _resize = function() {
	_predictionCharts.forEach((chart) => {
		chart.resize();
	});
	_heatmapCharts.forEach((chart) => {
		chart.resize();
	});
};
var _tooltip = null;
var _triggerTooltip = (e) => {
	var x = e.pageX,
			y = e.pageY;
	var $item = $(e.target).closest('.item');
	var index = $item.prevAll().length;
	var predictionChart = _predictionCharts[index];
	if(predictionChart) {
		let isCursorOverBar = predictionChart.isCursorOverBar();
		if(isCursorOverBar) {
			let OCLH = predictionChart.getHoverOCLH();
			_tooltip.setOCLH(OCLH[0], OCLH[1], OCLH[2], OCLH[3], OCLH[4])
							.setPosition(x,y,'fixed')
							.show();
		} else {
			_tooltip.hide();
		}
	}
};

//price updater interval
var _interval = null;
var _priceUpdaters = [];
var _priceUpdate = (param, $item) => {
	var symbolInfo = $.extend({
		type: 'stock',
		symbol: '000001.SH',
	},param);
	getPriceFromSina(symbolInfo, null, (data)=>{ //data: [{open,close,high,low,lastClose}]
		if(data.length == 0) return;
		var {open, close, high, low, lastClose} = data[0];
		if(lastClose) {
			var upRate = (close - lastClose) / lastClose;
			let colorClass = '';
			if(upRate > 0) 
				colorClass = 'red';
			else if(upRate < 0) 
				colorClass = 'green';
			$item.find('[role="price"]').text(close).addClass(colorClass).animateCss('fadeIn');
			$item.find('[role="up-rate"]').text((upRate*100).toFixed(2) + '%').addClass(colorClass).animateCss('fadeIn');
		}
	}, (err)=>{
		console.warn(param, $item, err);
	});
};

//初始化需要缓存的dom
var _initCache = () => {
	_$filterTable = $(`<div class="filter-wrapper">
											<div class="filter-table"><table><thead><tr></tr></thead><tr></tr><tbody></tbody></table></div>
											<div class="reset-container"><span class="info"><span class="value">0</span>支股票</span><button class="flat-btn reset"><span>重置筛选</span></button></div>
										</div>`);
	_$filterTable.find('thead>tr').append(['板块（概念）','行业','总市值'].map(name=>{ return `<th>${name}</th>` }));
	
	_$listWrapper = $(`<div class="list-wrapper"></div>`);
	_datafeed = new window.Kfeeds.UDFCompatibleDatafeed("", 10000 * 1000, 2, 0);

	_pieCharts = [
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
		$(`<span><svg class="pie-process"></svg><figcaption>---</figcaption></span>`).svgPercent(),
	];
	_barCharts = [
		$(`<div class="chart-wrapper"><figcaption>板块划分条形图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
		$(`<div class="chart-wrapper"><figcaption>行业划分条形图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
		$(`<div class="chart-wrapper"><figcaption>总市值分布图</figcaption><div class="svg-container"><svg class="svg-bar-chart"></svg></div></div>`).barChart(),
	];
}

scannerController.init = (container) => {
	helperModal.check();
	_initCache();

	var $title = $(`<div class="title"><span>扫描</span><img src="./image/tooltip.png"/><span class="date-info"></span></div>`)
	var $left = $(`<div class="scanner-left"></div>`);
	var $right = $(`<div class="scanner-right"></div>`);
	_$container = $(container).append($(`<div class="scanner-wrapper"></div>`).append([$title, $left, $right]));


	$left.append(`<h4 class="sub-title">Report<br/>结果列表</h4>`);
	$left.append(_$filterTable);
	$left.append(_$listWrapper);
	$left.append(`<div class="footer">
									注：选取的结果不代表其未来的绝对收益或概率；据历史回测统计，
									持续按照扫描结果进行交易操作，有相当概率跑赢基准(大盘)。
									欲了解更多关于我们的历史回测统计报告，请联系info@stone.io						
								</div>`);


	//right panel
	$right.append(`<h4 class="sub-title">Report<br/>简报</h4>`);
	$right.append(`<div class="scanner-info">
									<div class="row">
										<div class="col">
											<p>本次扫描根据最近:<span>20根日线</span></p>
											<p>搜索K线相似度高于:<span>80%</span></p>
										</div>
										<div class="col">
											<p>统计历史相似图形后向:<span>10天的走势</span></p>
											<p>成交量相似度高于:<span>70%的历史相似图形</span></p>
										</div>
									</div class="row">
								</div>`);
	$right.append(`<p class="clearfix red">选取涨跌品均值高于2倍标准差的7支个股呈现于此</p>`);
	$right.append($(`<div class="row charts-container"></div>`).append([$(`<div class="col piecharts-wrapper flex-between"></div>`).append(_pieCharts), $(`<div class="col barcharts-wrapper"></div>`).append(_barCharts)]));

	scannerController._initActions();
	scannerController._fetchData();
};

scannerController._initActions = () => {
	_$filterTable.find('button.reset').click(function(event) {
		if(_dimIndex) {
			_dimensions.forEach(function(dim){ dim.filterAll(); });
			_$filterTable.find('input[type="checkbox"]').prop('checked', false);
			_$filterTable.find('tr.active').removeClass('active');
			_redrawFilterUI();
		}
	});
	_$container.find('.title').click(function(event) {
		/* Act on the event */
		scannerController._fetchData();
	});
	_$container.find('.title img').click(function(event) {
		helperModal.show();
	});
	window.addEventListener('resize',_resize);
	_interval = setInterval(()=>{
		// _priceUpdaters.forEach((updater)=>{ updater(); });
	}, 6000);

	_tooltip = new OCLHTooltip(_$container);
};

scannerController.dispose = () => {
	window.removeEventListener('resize',_resize);
	clearInterval(_interval);  //clear updater
};

scannerController._fetchData = () => {
	_data.list = [];
	_data.date = '';
	scannerController._update();

	var fetch = () => {
		var data = {
			date: '2019.12.12',
			list: [],
		};
		var categories = ['手机游戏','智能制造','虚拟运行商','物联网','4G5G','海洋工程','美女主播'];
		var industries = ['酿酒','石油石化','酒店餐饮','航天国防','医药流通','中药'];
		var subIndustries = ['高速公路','机场','电子元器件','生态园林','水上运输','工程器械'];
		var names = ['首旅酒店','全聚德','罗顿发展','华天酒店','金陵饭店','锦江股份'];
		var symbols = ['600258.SH','002186.SZ','600209.SH','000428.SZ','601007.SH','601007.SH'];
		var closePrice = [[20.068105697631836,19.715347290039062,20.577646255493164,20.087703704833984,18.078933715820312,16.27593994140625,16.912866592407227,15.217658996582031,16.736486434936523,16.315135955810547,15.296051025390625],[15.175044059753418,15.194841384887695,15.48190975189209,14.937469482421875,14.967164993286133,15.35322380065918,14.858277320861816,16.343114852905273,16.41240882873535,16.254024505615234,16.19463348388672],[5.119999885559082,5.119999885559082,5.1999993324279785,5.019999980926514,5.059999942779541,5,4.929999828338623,4.96999979019165,5.099999904632568,5.130000114440918,5.169999599456787],[4.572672367095947,4.353024482727051,4.299776077270508,4.42624044418335,4.5966339111328125,4.506112098693848,4.9573893547058105,5.452595233917236,4.906803607940674,4.415590763092041,4.020224094390869],[52.506187438964844,55.95128631591797,54.3913688659668,54.86266326904297,53.31602096557617,55.280853271484375,55.02861404418945,55.32732009887695,52.77834701538086,49.18721389770508,49.087642669677734],[6.309234619140625,6.348626613616943,6.105710983276367,6.230450630187988,6.118841171264648,6.276408672332764,6.289538383483887,6.118841171264648,6.079449653625488,6.000666618347168,6.020362377166748],[4.545780181884766,4.504580020904541,4.717448711395264,4.621314525604248,4.703714847564697,4.841050148010254,4.834183216094971,4.48397970199585,4.387845516204834,4.353511810302734,4.216176986694336],[6.0260138511657715,6.079817295074463,6.496796131134033,6.425057888031006,6.555083274841309,6.321934223175049,6.147071838378906,6.156039237976074,6.115686893463135,6.115686893463135,5.972209930419922],[10.539999961853027,10.479999542236328,10.640000343322754,10.399999618530273,10.399999618530273,10.380000114440918,10.260000228881836,10.300000190734863,10.319999694824219,10.40999984741211,10.369999885559082],[9.260000228881836,9.260000228881836,9.420000076293945,8.649999618530273,8.90999984741211,8.720000267028809,8.630000114440918,8.770000457763672,8.800000190734863,8.930000305175781,8.869999885559082],[9.675497055053711,9.695363998413086,9.761589050292969,9.78145694732666,9.854304313659668,9.867548942565918,9.788079261779785,9.774834632873535,9.708609580993652,9.89404010772705,10.006622314453125],[12.058268547058105,12.430404663085938,13.676030158996582,15.045701026916504,16.549755096435547,18.203697204589844,17.500770568847656,19.206398010253906,21.129104614257812,23.24304962158203,25.568906784057617],[2.3553662300109863,2.2468178272247314,2.241586446762085,2.288667678833008,2.1748883724212646,2.066340208053589,1.9917949438095093,1.8924014568328857,1.79823899269104,1.7080001831054688,1.7890844345092773],[1.7206833362579346,1.6534054279327393,1.6656378507614136,1.7186447381973267,1.6595216989517212,1.641173243522644,1.6167083978652954,1.5963211059570312,1.6167083978652954,1.661560297012329,1.6330183744430542],[11.94121265411377,12.196744918823242,12.177088737487793,12.452277183532715,12.855232238769531,12.737293243408203,12.796262741088867,12.550559043884277,12.609527587890625,11.94121265411377,11.862586975097656],[10.020000457763672,10.180000305175781,10.479999542236328,10.399999618530273,10.359999656677246,10.600000381469727,10.619999885559082,10.209999084472656,10.5,10.930000305175781,10.199999809265137],[0.9747716784477234,0.9830715656280518,0.9637051820755005,0.932350218296051,0.9305058717727661,0.9332724213600159,0.9637051820755005,0.9683429002761841,0.9618502259254456,0.9470097422599792,0.9377343654632568],[19.110000610351562,19.309999465942383,18.850000381469727,19.110000610351562,18.420000076293945,19.09000015258789,18.979999542236328,19.260000228881836,17.920000076293945,17.889999389648438,17.799999237060547],[2.560692310333252,2.5007643699645996,2.5687904357910156,2.5768887996673584,2.6109020709991455,2.5396366119384766,2.523439884185791,2.5023841857910156,2.523439884185791,2.6109020709991455,2.627098321914673],[33.500038146972656,34.330081939697266,35.6124267578125,33.813167572021484,35.71680450439453,39.29047393798828,42.89396667480469,40.43364715576172,41.88498306274414,44.05702209472656,45.28469467163086],[18.27692413330078,18.52307891845703,18.69230842590332,19.107694625854492,18.4692325592041,17.538461685180664,17.576923370361328,18.038463592529297,18.415386199951172,18.323078155517578,18.615385055541992],[71.9743423461914,72.68418884277344,74.84371948242188,74.78373718261719,67.30536651611328,62.73635482788086,64.8858871459961,58.397300720214844,59.43707275390625,53.49836349487305,52.61855697631836],[7.76928186416626,7.792850971221924,7.567872047424316,7.59572696685791,7.604297637939453,7.737142562866211,7.799279689788818,7.600012302398682,7.413600444793701,7.610725402832031,7.302182674407959],[3.68999981880188,3.809999942779541,3.9000000953674316,4.03000020980835,4.150000095367432,4.159999847412109,4.389999866485596,4.570000171661377,4.710000038146973,4.690000057220459,4.739999771118164],[11.138118743896484,11.064127922058105,10.408074378967285,10.38340950012207,10.565921783447266,10.314352035522461,10.038119316101074,10.294621467590332,10.482065200805664,10.422872543334961,10.235428810119629],[18,18.209999084472656,18.389999389648438,18.489999771118164,18.170000076293945,17.780000686645508,17.6299991607666,17.649999618530273,17.530000686645508,17.549999237060547,17.700000762939453],[13.180000305175781,13.380000114440918,13.210000991821289,12.739998817443848,12.479999542236328,12.180000305175781,12.420000076293945,12.789999961853027,12.800000190734863,13.1899995803833,13.149998664855957],[37.209999084472656,36.88999938964844,38.290000915527344,37.09000015258789,33.380001068115234,33.189998626708984,33.29999923706055,33.93000030517578,30.53999900817871,29.899999618530273,30.700000762939453],[34.779998779296875,36.849998474121094,38,38.349998474121094,38.11000061035156,36.83000183105469,37.08000183105469,36,35.880001068115234,37.25,37.349998474121094],[1.695746660232544,1.7379435300827026,1.7629756927490234,1.7307915687561035,1.776564598083496,1.7865774631500244,1.7980207204818726,1.775849461555481,1.7787103652954102,1.773703694343567,1.7379435300827026],[103.52538299560547,102.35577392578125,105.41474151611328,115.96122741699219,112.55236053466797,110.06319427490234,110.87293243408203,107.96389770507812,100.84627532958984,99.21682739257812,96.01789855957031],[0.7844881415367126,0.7955959439277649,0.813646137714386,0.8275308609008789,0.846969485282898,0.8303077816963196,0.8455810546875,0.8247538805007935,0.833084762096405,0.749776303768158,0.813646137714386],[1.0471584796905518,1.0552948713302612,1.0349539518356323,1.020308256149292,1.0137991905212402,1.0178673267364502,1.0357674360275269,1.033326506614685,1.0349539518356323,1.0373947620391846,0.9999671578407288],[2.367832660675049,2.4539356231689453,2.3924336433410645,2.413959503173828,2.530813217163086,2.490837335586548,2.429334878921509,2.521588087081909,2.580015182495117,2.5154378414154053,2.5154378414154053],[4.182549953460693,4.1519083976745605,4.190209865570068,4.182549953460693,4.121267318725586,4.159568786621094,4.144248008728027,4.0216827392578125,4.0676445960998535,4.136587619781494,4.1136064529418945],[6.810133457183838,7.00279426574707,7.371363162994385,7.421621322631836,7.522140026092529,7.689671993255615,8.150381088256836,8.041486740112305,8.083368301391602,7.765060901641846,7.798566818237305],[16.123929977416992,16.484241485595703,16.51126480102539,16.313095092773438,15.952781677246094,16.0068302154541,14.41245174407959,14.142217636108398,13.439611434936523,12.926167488098145,13.097315788269043],[4.508033275604248,4.312803268432617,4.330551624298096,4.513949394226074,4.584941864013672,4.6855149269104,4.703262805938721,4.797919750213623,4.839332103729248,4.892577171325684,5.200211524963379],[38.209999084472656,37.38999938964844,38.29999923706055,35.650001525878906,35.88999938964844,39.47999954223633,39.869998931884766,38.9900016784668,39.11000061035156,39.29999923706055,40.31999969482422],[36.849998474121094,35.68000030517578,35.65999984741211,35.349998474121094,36.04999923706055,32.88999938964844,33.18000030517578,32.779998779296875,31.8799991607666,32.18000030517578,32.290000915527344],[2.168254852294922,2.186361312866211,2.1976778507232666,2.267840623855591,2.299527168273926,2.2429442405700684,2.152411699295044,2.134305238723755,2.150148391723633,2.170518159866333,2.2089943885803223],[2.1561009883880615,2.081409215927124,2.1312038898468018,2.14614200592041,2.0963475704193115,2.051532506942749,2.0664708614349365,2.0913681983947754,2.081409215927124,2.0714502334594727,2.076429843902588],[8.415892601013184,8.377406120300293,8.241416931152344,8.52365779876709,8.159310340881348,7.848846435546875,7.697463035583496,7.594830513000488,7.797529697418213,7.2561421394348145,7.292063236236572],[6.94004487991333,7.00472354888916,6.978851795196533,7.1276140213012695,7.1276140213012695,7.056467056274414,7.179357051849365,6.64252233505249,6.862430095672607,7.315182685852051,7.386329174041748],[4.505788803100586,4.625596523284912,4.505788803100586,4.729776382446289,4.427653789520264,4.193248748779297,3.7765285968780518,3.5525412559509277,4.052606105804443,3.7817375659942627,3.7921557426452637],[2.7363860607147217,2.6269307136535645,2.662238836288452,2.5810298919677734,2.595153331756592,2.708139419555664,2.6798927783966064,2.6869544982910156,2.746978521347046,2.7858173847198486,2.7152011394500732],[8.580842971801758,8.723372459411621,8.830997467041016,8.857175827026367,8.874628067016602,8.752460479736328,8.726282119750977,8.668106079101562,8.598295211791992,8.6273832321167,8.604113578796387],[6.513322353363037,6.437408924102783,6.581644535064697,6.7866082191467285,7.006755828857422,7.264859676361084,7.120625019073486,7.0598955154418945,7.355955123901367,7.712745189666748,7.485006809234619],[10.578829765319824,10.653182983398438,10.24423885345459,9.913780212402344,10.372292518615723,10.901026725769043,11.132349014282227,11.64869213104248,11.731306076049805,11.086910247802734,11.318231582641602],[4.266105651855469,4.233489990234375,4.2008748054504395,4.168259143829346,4.328075408935547,4.256320953369141,4.168259143829346,4.236751556396484,4.181305408477783,4.2269673347473145,4.331336498260498]];
		var kline = [[1466991000,2840.559,2895.703,2840.277,2895.731,15669747200],[1467077400,2885.011,2912.557,2878.824,2913.582,17387104700],[1467163800,2918.534,2931.592,2915.062,2933.997,19321558600],[1467250200,2931.481,2929.606,2922.312,2938.137,15446493000],[1467336600,2931.802,2932.476,2925.81,2944.989,14124622700],[1467595800,2924.293,2988.604,2922.52,2992.498,22201713200],[1467682200,2991.752,3006.392,2990.642,3010.275,23520445000],[1467768600,2998.521,3017.292,2984.828,3017.652,21237092000],[1467855000,3009.353,3016.847,2994.643,3024.109,22268166700],[1467941400,3000.326,2988.094,2983.881,3001.551,16898685900],[1468200600,2993.749,2994.917,2990.907,3022.944,22433822400],[1468287000,2992.52,3049.381,2984.421,3049.681,25948629500],[1468373400,3049.513,3060.689,3048.199,3069.047,25365938400],[1468459800,3054.975,3054.018,3036.523,3057.046,18019480400],[1468546200,3056.682,3054.296,3044.538,3062.683,17286639800],[1468805400,3047.637,3043.564,3031.639,3058.321,17749656200],[1468891800,3040.226,3036.598,3014.289,3043.6,15536146600],[1468978200,3034.714,3027.9,3022.631,3042.997,13824281500],[1469064600,3027.604,3039.009,3027.368,3053.334,16376737000],[1469151000,3038.118,3012.816,3007.457,3039.27,16201018100]];
		// var closePrice = [];
		// var kline = [];

		for(var i=0; i<30; i++) {
			var item = {
				index: i,
				symbol: symbols[Math.round(Math.random() * 5)],
				name: names[Math.round(Math.random() * 5)],
				categoryIndustry: categories[Math.round(Math.random() * 6)],
				categoryConcept: categories[Math.round(Math.random() * 6)],
				industry: industries[Math.round(Math.random() * 5)],
				subIndustry: subIndustries[Math.round(Math.random() * 5)],
				meta: {
					fullName: '上海浦东发展银行股份有限公司',
				},
				statistic: {
					up: Math.random(),
					mean: Math.random() * 2 - 1,
				},
				aggregateValue: Math.round(Math.random() * 2000),
				volume: Math.round(Math.random() * 50),
				pattern: {
					closePrice: closePrice,
					kline: kline
				}
			};
			data.list.push(item);
		}
		return data;
	}

	var beforeFetch = () => {
		_$listWrapper.find('.waiting-overlay').remove();
		_$listWrapper.append('<div class="waiting-overlay flex-center"><i class="fa fa-spin fa-circle-o-notch"></i></div>');
	};
	var afterFetch = (data) => {
		_data = data;
		scannerController._update();
	};
	var failFetch = (error) => {
		console.error(error);
		var errorDom = $(`<div class="waiting-overlay flex-center error red"><i class="fa fa-warning"></i><span>更新失败!</span><a class="flat-btn">重试</a></div>`);
		errorDom.find('a.flat-btn').click(()=>{
			scannerController._fetchData();
		});
		_$listWrapper.find('.waiting-overlay').remove();
		_$listWrapper.append(errorDom);
	};

	beforeFetch();
	setTimeout(()=>{
		if(Math.random()>0) {
			afterFetch(fetch());
		} else {
			failFetch();
		}
	},200);

};

scannerController._update = () => {
	var data = _data;
	var list = data.list;

	//统计信息
	_updateDimensions();
	//reset
	_predictionCharts = [];        //clear charts
	_priceUpdaters = [];
	//remove list
	_$listWrapper.empty();

	var $list = list.map(function(item){
		var dom = $(`<div class="item expand">
									<div class="section1"></div>
									<div class="section2"></div>
									<button class="flat-btn detail"><i class="fa fa-play"></i><span class="name">详情</span></button>
							</div>`)
							.data({data: item});
		return dom;
	});
	_$listWrapper.append($list);
	_updateList();

	//update filter UI
	_updateFilterTable();

	//update right
	_updateRightPanel();

	//update title
	_$container.find('.date-info').text(_data.date + '期扫描结果');
}
function _updateDimensions() {
	var newDims = _generateDimensions();
	_crossfilter = newDims.crossfilter;
	_dimensions = newDims.dimensions;
	_dimIndex = newDims.dimIndex;
}
function _generateDimensions() {
	//板块, 行业, 总市值, 成交量
	var list = _data.list;
	var crossf = crossfilter(list);
	var _dimCategory = crossf.dimension((data)=>{
		return data.categoryConcept;
	});
	var _dimIndustry = crossf.dimension((data)=>{
		return data.industry;
	});
	var _dimAggregateValue = crossf.dimension((data)=>{
		var ranges = _aggregateRanges;
		var aggregateValue = data.aggregateValue;
		for(var i=0; i<ranges.length; i++) {
			if(aggregateValue >= ranges[i][0] && aggregateValue < ranges[i][1]) {
				return ranges[i];
			}
		}
	});
	// var _dimVolume = crossf.dimension((data)=>{
	// 	var ranges = [[-Infinity, 5],[5, 10],[10, 20],[20, 50],[50, 100],[100, Infinity]];
	// 	var volume = data.volume;
	// 	for(var i=0; i<ranges.length; i++) {
	// 		if(volume >= ranges[i][0] && volume < ranges[i][1]) {
	// 			return ranges[i];
	// 		}
	// 	}
	// });
	var dimIndex = crossf.dimension((data)=>{
		return data.index;
	});
	var dimensions = [_dimCategory, _dimIndustry, _dimAggregateValue];

	return {
		crossfilter: crossf,
		dimensions: dimensions,
		dimIndex: dimIndex,
	};
}

var dimsToGroups = (dimensions) => {
	var groups = dimensions.map((dim, i)=>{
		var group = dim.group().all();
		if(i>1) {  //总市值, 交易量
			return group.sort((a,b)=>{ return a.key[0] - b.key[0] });
		}
		return group;
	});
	//总市值 固定为6条
	var ranges = _aggregateRanges;
	var aggregateGroup = groups[2];
	if(aggregateGroup.length > 0 && aggregateGroup.length < ranges.length) {
		for(var i=0; i<ranges.length; i++) {
			var key = ranges[i].concat([]);
			var keyS = JSON.stringify(key);
			var item = aggregateGroup[i];
			if(!item || (JSON.stringify(item.key) != keyS)) {
				var newItem = {key:key, value:0};
				aggregateGroup.splice(i,0,newItem); //插入
			}
		}
	}

	return groups;
};
//table row click
var _onFilter = (event) => {
	var $cur = $(event.currentTarget);
	if($cur.hasClass('disabled')) {
		return;
	}
	var $curCheckbox = $cur.find('input[type="checkbox"]');
	$curCheckbox.prop('checked', !$curCheckbox.prop('checked'));
	$cur.toggleClass('active', $curCheckbox.prop('checked'));

	var $table = $cur.closest('table');
	var $trChecked = $table.find('tr').has(':checked');
	var filterArr = [];
	$trChecked.each((index, ele)=>{
		filterArr.push(JSON.stringify($(ele).data().key));
	});
	var dim = $table.data().dim;
	if(filterArr.length > 0) {
		dim.filter((key)=>{
			return filterArr.indexOf(JSON.stringify(key)) > -1 ;
		});
	} else {
		dim.filterAll();
	}
	_redrawFilterUI();
};

function _redrawFilterUI() {
	//update UI
	var groups = dimsToGroups(_dimensions);
	var $tables = _$filterTable.find('td table');
	groups.forEach((group, i)=>{
		var $table = $($tables[i]);
		var $rows = $table.find('tr');
		group.forEach((obj, j)=>{
			updateTr($($rows[j]).data(obj));
		});
	});
	//filter list view
	_filterList();
}
var aggregateFormatter = (key) => {
		var unit = '亿';
		var str = '';
		if(key[0] == -Infinity) {
			str = '小于' + key[1];
		} else if(key[1] == Infinity) {
			str = '大于' + key[0];
		} else {
			str = key[0] + '-' + key[1];
		}
		str += unit;
		return str;
};

function updateTr($tr) {
	var { key, value } = $tr.data();
	if($.isArray(key)) {
		key = aggregateFormatter(key);
	}
	$tr.find('td:nth-child(2)').html(`<span>${key}</span>`);
	$tr.find('td:nth-child(3)').html(`<span>${value}</span>`);
	$tr.toggleClass('disabled', value <= 0);
	return $tr;
}
function _updateFilterTable() {
	var dims = _dimensions;
	var filters = dimsToGroups(_dimensions);
	var tables = filters.map((group, i)=>{
		var $table = $(`<table><tbody></tbody></table>`).data('dim',dims[i]);
		$table.find('tbody').append(group.map(item=>{
			var $tr =  $(`<tr><td><input type="checkbox"/><label></label></td><td></td><td></td></tr>`).data(item).click(_onFilter);
			return updateTr($tr);
		}));
		return $table;
	});
	_$filterTable.find('tbody>tr').empty().append(tables.map(table=>{
		return $('<td></td>').append(table);
	}));
}
//更新股票列表
function _updateList() {
	var $list = _$listWrapper.children();
	var handleClick = (e) => {

	};
	var expandItem = (e) => {
		var $item = $(e.target).closest('.item');
		$item.toggleClass('expand');
	};
	for(var i=0; i<$list.length; i++) {
		var $item = $($list[i]);
		var dataObj = $item.data().data;
		var { name, symbol, category, industry, subIndustry, statistic } = dataObj;

		var section1Children = [
			`<span><div>${name}</div><div>${symbol}</div></span>`,
			`<span><div role="price">${'--'}</div><div role="up-rate">${'--'}</div></span>`,
			`<span><div>${'上涨比例'}</div><div class="red">${statistic.up.toFixed(1)+'%'}</div></span>`,
			`<span><div>${'涨跌平均数'}</div><div class="red">${statistic.mean.toFixed(1)+'%'}</div></span>`,
			`<span><div>${industry}</div><div>${subIndustry}</div></span>`,
			`<span><div>${''}</div><div>${category}</div></span>`,
		];
		//section1
		$item.find('.section1').append(section1Children);
		
		//section2
		var $predictionPane = $(`<div class="prediction-wrapper"><div class="chart"><div class="prediction-chart"></div><div class="heatmap-chart"></div></div><div class="statistic flex-around"></div></div>`);
		var $infoPane = $(`<div class="info-wrapper"><div class="info-container"></div><button class="flat-btn btn-red">加入智能监控</button><button class="flat-btn btn-dark">详细搜索结果</button></div>`);
		$item.find('.section2').append([$predictionPane, $infoPane]);
				//charts
		var predictionChart = new PredictionWidget($predictionPane.find('.prediction-chart')[0], {showRange: false, slient: true, axis: true, padding: {right: 70}});
		var heatmapChart = new BlockHeatMap($predictionPane.find('.heatmap-chart')[0], {textColor: '#999'});
		predictionChart.setData(dataObj.pattern.kline, dataObj.pattern.closePrice, null, 10);
		var {yMin, yMax} = predictionChart.getLineChartMinMax();
		var labelDecimal = 3;
		heatmapChart.setData(predictionChart.getLastPrices(), yMin, yMax, {labelDecimal});

		_predictionCharts.push(predictionChart);
		_heatmapCharts.push(heatmapChart);
				//statistic
		var nodes = [
			`<span><div>上涨比例</div><div class="red">76.01%</div></span>`,
			`<span><div>下跌比例</div><div class="red">44.33%</div></span>`,
			`<span><div>涨跌平均</div><div class="red">21.22%</div></span>`,
			`<span><div>涨跌中位数</div><div class="red">23.66%</div></span>`,
		];
		$predictionPane.find('.statistic').append(nodes);
				//info sections
		var infoNodes = [
			[
				`<div title="${dataObj.meta.fullName}">${dataObj.meta.fullName}</div>`,
				`<div><span>${dataObj.industry}</span><span>${dataObj.subIndustry}</span></div>`,
				`<div><span>${dataObj.categoryIndustry}</span><span>${dataObj.categoryConcept}</span></div>`,
			],
			[
				`<div><span class="des">近10日平均换手率:</span><span>33.33%</span></div>`,
				`<div><span class="des">总市值:</span><span>364亿</span></div>`,
				`<div><span class="des">市盈率:</span><span>6.55</span></div>`,
				`<div><span class="des">市盈率[动]:</span><span>7.22</span></div>`,
				`<div><span class="des">市净率:</span><span>53.44</span></div>`,
			],
			[
				`<div><span class="des">最新解禁:</span><span>2017-02-03</span></div>`,
				`<div><span class="des">解禁数量:</span><span>65423万股</span></div>`,
				`<div><span class="des">占总股本比例:</span><span>10.22%</span></div>`,
			]
		];
		var $infoContainer = $infoPane.find('.info-container');
		infoNodes.forEach((nodeArr) => {
			$infoContainer.append($('<div class="info-section"></div>').append(nodeArr));
		});
		//others
		$item.find('button.detail').click(expandItem);
		//udpater
		_priceUpdaters[i] = _priceUpdate.bind(null, {symbol:dataObj.symbol}, $item);
	}

	_$filterTable.find('.info .value').text($list.length);
	//init tooltip trigger
	$list.find('.main-wrapper').on('mousemove', _triggerTooltip);
};
//filter list 
function _filterList() {
	var filteredList = _dimIndex.top(Infinity);
	var ids = filteredList.map((item)=>{ return item.index });
	_$listWrapper.children().each((i, ele)=>{
		var data = $(ele).data().data;
		var index = data.index;
		$(ele).toggleClass('hide', ids.indexOf(index) == -1);
	});
	_$filterTable.find('.info .value').text(filteredList.length);
}

//update right panel
function _updateRightPanel() {
	var list = _data.list;
	var newDims = _generateDimensions();
	var dimensions = newDims.dimensions;
	var dimIndex = newDims.dimIndex;
	var groups = dimsToGroups(dimensions);

	var total = dimIndex.top(Infinity).length;
	var tops = groups.map((group)=>{
		var maxValueObj = group.reduce((pre, cur)=>{
			return cur.value > pre.value ? cur : pre;
		},{value:0});
		return maxValueObj;
	});
	_pieCharts.forEach(function(chart, i){
		$(chart).svgPercent({count:tops[i].value, total:total, caption:tops[i].key});
	});
	_barCharts.forEach((chart, i)=>{
		var keyFormatter = null;
		if(i==2) {
			keyFormatter = aggregateFormatter;
		}
		$(chart).barChart({data:groups[i], keyFormatter:keyFormatter});
	});

}

module.exports = scannerController;
