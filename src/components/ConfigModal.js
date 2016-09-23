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
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	renderContent() {

		let { dateRange, additionDate, spaceDefinition } = this.state.searchConfig;
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


		return <div className='modal-content-contianer'>
			<div className='title'>搜索配置</div>
			<div className='item-title font-simsun'>统计天数</div>
			<div className='item-body-container days'>
				<div className='inputs-wrapper'><button onClick={this.reduceDays.bind(this)}>-</button><input type='number' value={additionDate.value} onChange={this.changeDays.bind(this)}/><button onClick={this.addDays.bind(this)}>+</button></div><span className='font-simsun'>根</span>
			</div>
			<div className='item-title font-simsun'>选择时间</div>
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
					<div className="inputs-wrapper date"><input ref='endDate' value={dateRange[1].date} onChange={this.changeEndDate.bind(this)}/><span className='date-icon fa fa-calendar-o'></span></div>
					<div className="times">
						<input type="number" min='0' max='24' value={d1.hour} onChange={this.changeTime.bind(this, 1,'hour')}/>
						<span>:</span>
						<input type="number" min='0' max='59' value={d1.minute} onChange={this.changeTime.bind(this, 1,'minute')}/>
						<span>:</span>
						<input type="number" min='0' max='59' value={d1.second} onChange={this.changeTime.bind(this, 1,'second')}/>
					</div>
				</div>
			</div>
			<div className='item-title font-simsun'>标的类型</div>
			<div className='item-body-container sid'>
				<span className={stockClass} onClick={this.toggleType.bind(this, 'stock')}>股票</span><span className={futureClass} onClick={this.toggleType.bind(this, 'future')}>期货</span>
			</div>
			<div className='footer font-simsun'>
				<button onClick={this.handleSaveConfig.bind(this)}>保存配置</button><span onClick={this.resetState.bind(this)}>重置</span>
			</div>
		</div>;
	}

	render(){
		return <div className='modal-overlay flex-center'>

			<div className='config-modal-container'>
				<div className='close-icon' onClick={this.closeModal.bind(this)}><span className='fa fa-close'></span></div>
				<div className='modal-content-wrapper'>
					{this.renderContent()}
				</div>
			</div>

			</div>
		
	}

	closeModal() {
		let { dispatch } = this.props;
		dispatch(layoutActions.closeConfigModal());
	}

	changeDays(event) {
		let days = event.target.value;
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
		if(searchConfig.additionDate.value > 0) {
			searchConfig.additionDate.value = parseInt(searchConfig.additionDate.value) - 1;
			this.setState({searchConfig});
		}
	}

	addDays() {
		let { searchConfig } = this.state;
		searchConfig.additionDate.value = parseInt(searchConfig.additionDate.value) + 1;
		this.setState({searchConfig});
	}

	handleSaveConfig() {
		let { searchConfig } = this.state;
		let { dispatch } = this.props;
		dispatch(searchConfigActions.setSearchConfig(searchConfig));
		this.closeModal();
	}

}

SearchConfigModal.propTypes = propTypes;
SearchConfigModal.defaultProps = defaultProps;

export default SearchConfigModal;
