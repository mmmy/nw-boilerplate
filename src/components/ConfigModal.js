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
	keyboardNavigation: false
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
		$(this.refs.startDate).datepicker(datePickerOptions);
		$(this.refs.endDate).datepicker(datePickerOptions);
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

		const stockSelected = spaceDefinition.stock;
		const furtureSelected = spaceDefinition.furture;

		let stockClass = classNames('stock fa', {
			'fa-check-square-o': stockSelected,
			'fa-square-o': !stockSelected,
			'selected': stockSelected,
		});
		
		let furtureClass = classNames('furture fa', {
			'fa-check-square-o': furtureSelected,
			'fa-square-o': !furtureSelected,
			'selected': furtureSelected,
		});


		return <div className='modal-content-contianer'>
			<div className='title'>搜索配置</div>
			<div className='item-title'>选择时间</div>
			<div className='item-body-container date'>
				<input ref='startDate' value={dateRange[0]} onChange={this.changeStartDate.bind(this)}/><span className='date-icon fa fa-calendar-o'></span><span className='zhi'>至</span><input ref='endDate' value={dateRange[1]} onChange={this.changeEndDate.bind(this)}/><span className='date-icon fa fa-calendar-o'></span>
			</div>
			<div className='item-title'>标的类型</div>
			<div className='item-body-container sid'>
				<span className={stockClass} onClick={this.toggleType.bind(this, 'stock')}>股票</span><span className={furtureClass} onClick={this.toggleType.bind(this, 'furture')}>期货</span>
			</div>
			<div className='item-title'>统计天数</div>
			<div className='item-body-container days'>
				<button>-</button><input type='number' value={additionDate.value} onChange={this.changeDays.bind(this)}/><button>+</button><span>天</span>
			</div>
			<div className='footer'>
				<button onClick={this.handleSaveConfig.bind(this)}>保存配置</button><span onClick={this.resetState.bind(this)}>重置</span>
			</div>
		</div>;
	}

	render(){
		return <div> 
			<div className='modal-overlay'></div>

			<div className='config-modal-container'>
				<div className='close-icon fa fa-close' onClick={this.closeModal.bind(this)}></div>
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

	changeStartDate(e) {
		let str = e.target.value;
		let { searchConfig } = this.state;
		searchConfig.dateRange[0] = str;
		this.setState({searchConfig});
	}
	
	changeEndDate(e) {
		let str = e.target.value;
		let { searchConfig } = this.state;
		searchConfig.dateRange[1] = str;
		this.setState({searchConfig});
	}

	resetState() {
		let searchConfig = lodash.cloneDeep(this.props.searchConfig);
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
