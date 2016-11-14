
import peakStatistic from './peakStatistic';  								//极值统计
import retracementStatistic from './retracementStatistic';    //回撤统计
import swingStatistic from './swingStatistic'; 								//振幅统计

//第二版的新界面
let statisticComponent = {};

statisticComponent.init = (wrapper) => {
	let container = $(`<div class="statistic-component-container"></div>`);
	$(wrapper).append(container);
	peakStatistic.init(container);
	retracementStatistic.init(container);
	swingStatistic.init(container);
};

statisticComponent.update = () => {
	peakStatistic.update();
	retracementStatistic.update();
	swingStatistic.update();
}

module.exports = statisticComponent;