import painter from './painter';

let handleShouCangFocus = (favoritesManager, favoritesController, dataObj, options, e) => { //options:{type:0,1,2} 0编辑 1详情页 2历史记录和收藏 
	let type = options && options.type || 0;
	let showSaveBtn = type === 0,
			showRename = type === 1;

	let $target = $(e.target);
	if($target.find('.shoucang-pop-menu').length > 0) {
		return;
	}
	let folders = favoritesManager.getFavoritesFolders();
	let optionsNode = $(`<div class='shoucang-pop-menu font-simsun'></div>`);
	let btnTemplate = `<span class='ks-input-wrapper border'><input placeholder='新建文件夹'><i class='button ks-check'></i><i class='button ks-delete'></i></span>`;
	let $btnGroup = $(`<div class='input-wrapper'></div>`).append($(btnTemplate));
	$btnGroup.find('input').blur(() => { $target.focus() });
	$btnGroup.find('.ks-check').click(function(event) {
																/* Act on the event */
																let name = $footer.find('input').val();
																if(name) {
																	favoritesController.addNewFolder(name);
																	let button = $(`<div class='item'>${name}</div>`).click((e) => {
																		favoritesController.addFavorites(name, dataObj);
																		$target.children().remove();
																	});
																	$content.append(button);
																}
																$btnGroup.toggleClass('show', false);
															});
	$btnGroup.find('.ks-delete').click(function(event) {
																	/* Act on the event */
																	$btnGroup.toggleClass('show', false);
																});
	let $saveBtn = $(`<span class='flat-btn save-btn ${showSaveBtn?"":"hide"}'>保存</span>`).click((e) => { 
																																														favoritesController.updateFavorites(dataObj);
																																														$target.children().remove();
															 																														});
	let $title = showRename ? $(`<div class='name-container'><h5>${dataObj.name || '未命名'}</h5></div>`).append($(`<div class='input-wrapper'></div>`).append(btnTemplate.replace('新建文件夹','自定义文件名')))
													: $(`<h4 class='title'>另存为</h4>`);
	$title.find('input').blur(() => { $target.focus(); });
	$title.find('.ks-check').click(function(event) {
		/* Act on the event */
		let name = $title.find('input').val();
		if(name) {
			$title.find('h5').text(name);
			dataObj.name = name;
			$title.find('input').val('');
		}
	});
	$title.find('.ks-delete').click(function(event) {
		/* Act on the event */
		$title.find('input').val('');
	});

  let $label = type===1 ? $(`<div class="label-title">收藏至</div>`) : '';

	let $content = $(`<div class='content transition-all'></div>`);
	let $footer = $(`<div class='footer-shoucang transition-all ${showSaveBtn?"heighter":""}'></div>`)
								.append($(`<span class='new-folder'>新建文件夹</span>`))
								.append($(`<i class='fa fa-plus toggle-btn'></i>`).click(function(event) {
									/* Act on the event */
									// $content.toggleClass('strech', true);
									$btnGroup.toggleClass('show', true);
								}))
								.append($btnGroup)
								.append($saveBtn);
								// .append($(`<div class='input-wrapper'></div>`).append($(`<input />`).blur(function() { $target.focus()/* 消除bug*/}))
								// 				.append($(`<i class='fa fa-plus add-btn'></i>`).click(function(event) {
								// 					/* Act on the event */
								// 					let name = $footer.find('input').val();
								// 					if(name) {
								// 						favoritesController.addNewFolder(name);
								// 						let button = $(`<div class='item'>${name}</div>`).click((e) => {
								// 							favoritesController.addFavorites(name, dataObj);
								// 							$target.children().remove();
								// 						});
								// 						$content.append(button);
								// 					}
								// 					$footer.find('.')
								// 				}))
								// 				.append(`<i class='clear-btn'></i>`).click(function(event) {
								// 					/* Act on the event */

								// 				}));

	folders.forEach((folder) => {
		let button = $(`<div class='item'>${folder}</div>`).click((e) => {
			favoritesController.addFavorites(folder, dataObj);
			$target.children().remove();
		});
		$content.append(button);
	});

	optionsNode.append($title).append($label).append($content).append($footer);
	$target.append(optionsNode);

};

let handleShouCangBlur = (e) => {
	let $target = $(e.target);
	if($target.find(e.relatedTarget).length > 0) {
		return;
	}
	$target.children().remove();
};

function splitData(rawData, predictionBars) {
  predictionBars += 1;
    var categoryData = [];
    var values = [];

    var lowArr = [], highArr = [];

    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].slice(0, 1)[0]);
        values.push(rawData[i].slice(1));
        lowArr.push(isNaN(+rawData[i][3]) ? Infinity : +rawData[i][3]);
        highArr.push(isNaN(+rawData[i][4]) ? -Infinity : +rawData[i][4]);
    }
    for (var i=0; i<predictionBars; i++) {
      categoryData.push(i+'');
      // values.push([undefined,undefined,undefined,undefined]);
    }
    //console.log(highArr);
    var min = Math.min.apply(null, lowArr);
    var max = Math.max.apply(null, highArr);

    // var arange10 = [];
    // for (var i=0; i < 15; i++) {
    //  arange10.push([categoryData[baseBars], min + (max - min) / 15 * i]);
    // }

    // var areaData = categoryData.slice(baseBars).map((e) => {
    //  return [e, max];
    // });

    return {
        categoryData: categoryData,
        values: values,
        // lineData: arange10,
        // areaData: areaData,
        yMin: min,
        yMax: max,
    };
}

var generateSeries = function(closePricesArr, startPrice) {
  var lineSeries = [],
      maxPrice = -Infinity,
      minPrice = Infinity;

  lineSeries = closePricesArr.map(function(e,i) {
    var rate = startPrice / e[0];
    return {
      data: e.map(function(price, i){return [i+'', price * rate]}),
        type: 'line',
        yAxisIndex: 1,
        name: i,
        showSymbol: false,
        smooth: false,
        hoverAnimation: false,
        lineStyle: {
          normal: {
            color: (i==0) ? '#862020' : 'rgba(200, 200, 200, 0.5)',
            width: 1
          }
        },
        z: (i==0) ? 1 : -1
    };
  });
  lineSeries.forEach((series) => {
    series.data.forEach((data) => {
      var price = data[1];
      minPrice = minPrice < price ? minPrice : price;
      maxPrice = maxPrice > price ? maxPrice : price;
    });
  });
  return {
    lineSeries,
    max: maxPrice,
    min: minPrice,
  };
};

let generateKlineOption = () => {
	var option = {
    backgroundColor: '#fff',
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
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
        xAxis: {
            type: 'category',
            data: [],
            scale: true,
            boundaryGap : false,
            axisLine: {show: false},
            splitLine: {show: false},
            minInterval: 1,
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
        yAxis: [{
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
        },{
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
        }],
        series: [
            {
                name: '上证指数',
                type: 'candlestick',
                data: [],
                z: 1,
                itemStyle: {
                  normal: {
                    borderWidth: true ? '1' : '0',
                    color: true ? '#AC1822' : '#aE0000',
                    color0: true ? 'rgba(0, 0, 0, 0)' : '#5A5A5A',
                    borderColor: '#8D151B',
                    borderColor0: '#050505',
                  },
                  emphasis: {
                    borderWidth: '1'
                  }
                },
            },
        ]
    };
  return option;
};


let getKlineImgSrc = (kline) => {
  if(!kline || kline.length==0) {
    return './image/kline.png';
  }
  let len = kline.length;
  let perfectW = len * 5;
  perfectW = perfectW > 500 ? 500 : perfectW;
  let canvas = document.createElement('canvas');
  canvas.height = 100;
  canvas.width = perfectW;
  painter.drawKline(canvas, kline);
  return canvas.toDataURL();
};

module.exports = {
	handleShouCangFocus,
	handleShouCangBlur,
	splitData,
	generateSeries,
	generateKlineOption,
  getKlineImgSrc,
};
