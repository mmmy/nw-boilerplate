import * as types from '../constants/ActionTypes';

const initialState = {
	sampleSize: 		0,      //样本数
	riseProbability: 	0.66, 		//上涨概率
	earningAverage: 	0, 		//平均收益
	median: 			0, 		//收益中位数
	profitRiskRate: 	0, 		//收益风险比
	forecastCeilBound: 	0, 		//预测上限
	forecastFloorBound: 0,    	//预测下限

	searchSpace: 		0, 		//搜索空间
	searchDate: 		['2010-12-21','2015-5-1'],     //搜索时间
	spaceDefinition: 	'指数', 	//空间定义
	patternType: 		'形态', 	//匹配形态
};

const namespace = Object.keys(initialState);

export default function report(state = initialState, actions){

	switch (actions.type) {
		
		case types.CHANGE_REPORT:
			return {
				...state,
				...actions.statistics
			};

		default:
			return state;
	}
}