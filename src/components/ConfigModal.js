import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { SPACE_DEFINITION } from '../flux/constants/Const';
import { layoutActions, searchConfigActions } from '../flux/actions';
import lodash from 'lodash';

const propTypes = {
	showConfigModal: PropTypes.bool,
	searchConfig: PropTypes.object.isRequired,
};

const defaultProps = {
  
};

let datePickerOptions = {
	format: "yyyy/mm/dd",
	language: "zh-CN",
	todayBtn: "linked",
	keyboardNavigation: false,
	autoclose: true,
};

class SearchConfigModal extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		let searchConfig = lodash.cloneDeep(props.searchConfig);
		this.state = {searchConfig};
	}

	componentDidMount() {
		let that = this;
		let { searchConfig } = this.state;

		$(this.refs.startDate).datepicker(datePickerOptions).on('hide', (e) => { 
			let dateStr = e.format();
			searchConfig.dateRange[0].date = dateStr;
			that.setState({searchConfig});
		});

		$(this.refs.endDate).datepicker(datePickerOptions).on('hide', (e) => { 
			let dateStr = e.format();
			searchConfig.dateRange[1].date = dateStr;
			that.setState({searchConfig});
		});
		$(this.refs.root).find('[data-kstooltip]').ksTooltip();
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	renderContent() {

		let { dateRange, additionDate, spaceDefinition, isLatestDate, similarityThreshold, vsimilarityThreshold, dateThreshold } = this.state.searchConfig;
		let d0 = dateRange[0],
				d1 = dateRange[1];
		const stockSelected = spaceDefinition.stock;
		const futureSelected = spaceDefinition.future;

		let stockClass = classNames('stock fa', {
			'fa-check-square-o': stockSelected,
			'fa-square-o': !stockSelected,
			'selected': stockSelected,
		});
		
		let futureClass = classNames('future fa', {
			'fa-check-square-o': futureSelected,
			'fa-square-o': !futureSelected,
			'selected': futureSelected,
		});

		// let warningClass = classNames('warning', {
		// 	'hide': !similarityThreshold.on || similarityThreshold.on && similarityThreshold.value < 0.8
		// });
		let hide1 = !similarityThreshold.on || similarityThreshold.on && similarityThreshold.value < 0.8;
		let hide2 = !vsimilarityThreshold.on || vsimilarityThreshold.on && vsimilarityThreshold.value < 0.8;
		let warningClass2 = classNames('warning', {
			'hide': hide1 && hide2
		});

		return <div className='modal-content-contianer' ref="root">
			<div className='title'>搜索配置</div>
			<div className='item-title font-simsun'>后向统计范围</div>
			<div className='item-body-container days'>
				<div className='inputs-wrapper'><button onClick={this.reduceDays.bind(this)}>-</button><input type='number' min={1} max={100} value={additionDate.value} onChange={this.changeDays.bind(this)} onBlur={this.validateDays.bind(this)}/><button onClick={this.addDays.bind(this)}>+</button></div><span className='font-simsun'>根</span>
			</div>
			<div className='item-title font-simsun'>搜索时间范围<span className="check-box-wrapper"><input type="checkbox" checked={ isLatestDate } onChange={this.toggleLastTimeAuto.bind(this)}/>当前时间</span></div>
			<div className='item-body-container date'>
				<div className="inputs-groups">
					<div className="inputs-wrapper date"><input ref='startDate' value={dateRange[0].date} onChange={this.changeStartDate.bind(this)}/><span className='date-icon fa fa-calendar-o'></span></div>
					<div className="times">
						<input type="number" min='0' max='23' value={d0.hour} onChange={this.changeTime.bind(this, 0,'hour')}/>
						<span>:</span>
						<input type="number" min='0' max='59' value={d0.minute} onChange={this.changeTime.bind(this, 0,'minute')}/>
						<span>:</span>
						<input type="number" min='0' max='59' value={d0.second} onChange={this.changeTime.bind(this, 0,'second')}/>
					</div>
				</div>
				<span className='zhi'>至</span>
				<div className="inputs-groups">
					<div className="inputs-wrapper date"><input disabled={isLatestDate} ref='endDate' value={dateRange[1].date} onChange={this.changeEndDate.bind(this)}/><span className='date-icon fa fa-calendar-o'></span></div>
					<div className="times">
						<input disabled={isLatestDate} type="number" min='0' max='24' value={d1.hour} onChange={this.changeTime.bind(this, 1,'hour')}/>
						<span>:</span>
						<input disabled={isLatestDate} type="number" min='0' max='59' value={d1.minute} onChange={this.changeTime.bind(this, 1,'minute')}/>
						<span>:</span>
						<input disabled={isLatestDate} type="number" min='0' max='59' value={d1.second} onChange={this.changeTime.bind(this, 1,'second')}/>
					</div>
				</div>
			</div>
			<div className='item-title font-simsun'>
				<input type='checkbox' checked={dateThreshold.on} onChange={this.toggleDateThresholdOn.bind(this)} />
				排除所选图形相同时间区间
				<img src="./image/tooltip.png" data-kstooltip='排除所选图形相同时间区间'/>
			</div>
			<div className='item-title font-simsun similarity'>
				<input type='checkbox' checked={similarityThreshold.on} onChange={this.toggleSimilarityOn.bind(this)}/>
				只显示价相似度大于
				<select value={similarityThreshold.value} disabled={!similarityThreshold.on} onChange={this.changeSimilarity.bind(this)}>
					<option value='0.9'>90%</option>
					<option value='0.8'>80%</option>
					<option value='0.7'>70%</option>
					<option value='0.6'>60%</option>
				</select>
				{/*<div className={warningClass}>(搜索结果数量可能比较小或为零)</div>*/}
			</div>
			<div className='item-title font-simsun similarity'>
				<input type='checkbox' checked={vsimilarityThreshold.on} onChange={this.toggleVSimilarityOn.bind(this)}/>
				只显示量相似度大于
				<select value={vsimilarityThreshold.value} disabled={!vsimilarityThreshold.on} onChange={this.changeVSimilarity.bind(this)}>
					<option value='0.9'>90%</option>
					<option value='0.8'>80%</option>
					<option value='0.7'>70%</option>
					<option value='0.6'>60%</option>
				</select>
			</div>
			<div className={warningClass2}>(搜索结果数量可能比较小或为零)</div>
			<div className='item-title font-simsun hide'>标的类型</div>
			<div className='item-body-container sid hide'>
				<span className={stockClass} onClick={this.toggleType.bind(this, 'stock')}>股票</span><span className={futureClass} onClick={this.toggleType.bind(this, 'future')}>期货</span>
			</div>
			<div className='footer font-simsun'>
				<button onClick={this.handleSaveConfig.bind(this)}>保存配置</button><span onClick={this.resetState.bind(this)}>重置</span>
			</div>
		</div>;
	}

	render(){
		return <div className='modal-overlay flex-center'>

			<div className='config-modal-container' onMouseUp = {function(e){ e.stopPropagation(); }}>
				<div className='close-icon' onClick={this.closeModal.bind(this)}><span className='fa fa-close'></span></div>
				<div className='modal-content-wrapper'>
					{this.renderContent()}
				</div>
			</div>

			</div>
		
	}

	closeModal(e) {
		let { dispatch } = this.props;
		dispatch(layoutActions.closeConfigModal());
		var $$ = document.querySelector('iframe').contentWindow.$;
		var dom = document.querySelector('iframe').contentWindow.document.querySelector('.header-chart-panel');
		var $dom = $$(dom);
		// $dom.mousedown();
		// $dom.mouseup();
		var event = new window.MouseEvent('mouseup',{
			'view': window,
			'bubbles': true,
			'cancelable': true
		});
		dom.dispatchEvent(event);
	}

	changeDays(event) {
		let days = event.target.value;
		let { searchConfig } = this.state;
		searchConfig.additionDate.value = days;
		this.setState({searchConfig});
	}

	validateDays(event) {
		let days = event.target.value;
		let min = +event.target.min;
		let max = +event.target.max;
		if(days < min) days = min;
		if(days > max) days = max;
		
		let { searchConfig } = this.state;
		searchConfig.additionDate.value = days;
		this.setState({searchConfig});
	}

	toggleType(type, event) {
		let { searchConfig } = this.state;
		searchConfig.spaceDefinition[type] = !searchConfig.spaceDefinition[type];
		this.setState({searchConfig});
	}

	changeTime(index, name, e) {
		let value = e.target.value || '0';
		let { searchConfig } = this.state;
		searchConfig.dateRange[index][name] = value;
		this.setState({searchConfig});
	}

	changeStartDate(e) {
		let str = e.target.value;
		let { searchConfig } = this.state;
		searchConfig.dateRange[0].date = str;
		this.setState({searchConfig});
	}
	
	changeEndDate(e) {
		let str = e.target.value;
		let { searchConfig } = this.state;
		searchConfig.dateRange[1].date = str;
		this.setState({searchConfig});
	}

	resetState() {
		let searchConfig = lodash.cloneDeep(this.props.searchConfig);
		this.setState({searchConfig});
	}

	reduceDays() {
		let { searchConfig } = this.state;
		if(searchConfig.additionDate.value > 1) {
			searchConfig.additionDate.value = parseInt(searchConfig.additionDate.value) - 1;
			this.setState({searchConfig});
		}
	}

	addDays() {
		let { searchConfig } = this.state;
		if(searchConfig.additionDate.value < 100) {
			searchConfig.additionDate.value = parseInt(searchConfig.additionDate.value) + 1;
			this.setState({searchConfig});
		}
	}

	toggleLastTimeAuto() {
		let { searchConfig } = this.state;
		searchConfig.isLatestDate = !searchConfig.isLatestDate;
		this.setState({searchConfig});
	}

	handleSaveConfig() {
		let { searchConfig } = this.state;
		let { dispatch } = this.props;
		dispatch(searchConfigActions.setSearchConfig(searchConfig));
		this.closeModal();
	}

	changeSimilarity(e) {
		let value = e.target.value;
		let { searchConfig } = this.state;
		searchConfig.similarityThreshold.value = value;
		this.setState({searchConfig});
	}
	
	changeVSimilarity(e) {
		let value = e.target.value;
		let { searchConfig } = this.state;
		searchConfig.vsimilarityThreshold.value = value;
		this.setState({searchConfig});
	}

	toggleSimilarityOn() {
		let { searchConfig } = this.state;
		searchConfig.similarityThreshold.on = !searchConfig.similarityThreshold.on;
		this.setState({searchConfig});
	}

	toggleVSimilarityOn() {
		let { searchConfig } = this.state;
		searchConfig.vsimilarityThreshold.on = !searchConfig.vsimilarityThreshold.on;
		this.setState({searchConfig});
	}

	toggleDateThresholdOn() {
		let { searchConfig } = this.state;
		searchConfig.dateThreshold.on = !searchConfig.dateThreshold.on;
		this.setState({searchConfig});
	}
}

SearchConfigModal.propTypes = propTypes;
SearchConfigModal.defaultProps = defaultProps;

export default SearchConfigModal;
