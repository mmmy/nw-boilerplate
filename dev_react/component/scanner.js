
import React from 'react';
import scannerController from '../../src/ksControllers/scannerController';
import request from '../../src/backend/request';
import config from '../../src/backend/config';

window.actionsForIframe = {
	sendSymbolHistory: function(postData, callback, errorCb) {
		const { patternOptions } = config;
	  const options = { ...patternOptions };

	  const requestCb = (result) => {
	    callback && callback(result);
	  };

	  const errorCallback = (err) => {
	    console.error('getSymbolHistory error', err);
	    errorCb && errorCb(err);
	  };
	  // request(options, requestCb, errorCallback, JSON.stringify(postData));
	  setTimeout(function(){
			if(Math.random() < 2) {
	  		requestCb(responseSamples[Math.round(Math.random())]);
	  	} else {
				errorCallback({error:'sendSymbolHistory error'});
	  	}
	  }, 200);
	},
	sendSymbolList: function(postData, cb) {
		setTimeout(function(){
			cb && cb(symbolListSample);
		},300);
	},
	mockSearch: function(options, callback, errorCb, postData) {
		setTimeout(function(){
			if(Math.random() < 0.8) {
				callback(searchSamples[Math.round(Math.random())]);
			} else {
				errorCb({error:'mockSearch error'});
			}
		}, 200);
	},
	mockStorage: function() {
		var now = new Date();
		return  {
								list:[
											{
						symbolInfo:{
																	symbol: '000001.SH',
																	ticker: '上证综合指数',
																	type: 'index',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'ru',
																	ticker: '橡胶',
																	type: 'futures',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'a',
																	ticker: '豆一',
																	type: 'futures',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'hc',
																	ticker: '热卷',
																	type: 'futures',
																	exchange: '',
																}
															},{
																symbolInfo:{
																	symbol: 'cf',
																	ticker: '棉花',
																	type: 'futures',
																	exchange: '',
																}
															}
								].slice(0,1),
								resolution: 'D',
								baseBars: 30,
								searchConfig: {
										additionDate: {type:'days', value:30},
										searchSpace: '000010',
										dateRange: [{date:'1990/01/01', hour:'0', minute:'0', second:'0'}, {date:`${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`, hour:'23', minute:'59', second:'59'}],
										isLatestDate: true,
										similarityThreshold: {value: 0.6, on:true},
										spaceDefinition: { stock: true, future: false },
										matchType: '形态',
										searchLenMax: 200
								}
							};
	},
};

export default React.createClass({
	
	getInitialState(){
		return {};
	},
	componentDidMount() {
		scannerController.init(this.refs.container);
	},
	render(){
		return (<div ref="container" className="statistics-wrapper" style={{position:'relative',backgroundColor:'#222528',top:'20px',height:'700px',border:'1px solid rgba(0,0,0,0.2)'}}>
		</div>);
	}
});
