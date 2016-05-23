import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
	showConfigModal: PropTypes.bool
};

const defaultProps = {
  
};

class SearchConfigModal extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		this.state = {};
	}

	componentDidMount() {

	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	renderContent() {
		return <div className='modal-content-contianer'>
			<div className='title'>搜索配置</div>
			<div className='item-title'>选择时间</div>
			<div className='item-body-container date'>
				<input />至<input />
			</div>
			<div className='item-title'>标的类型</div>
			<div className='item-body-container sid'>
				<span className='stock fa fa-check-square-o'>股票</span><span className='furture fa fa-check-square-o'>期货</span>
			</div>
			<div className='item-title'>统计天数</div>
			<div className='item-body-container days'>
				<button>-</button><input /><button>+</button><span>天</span>
			</div>
			<div className='footer'>
				<button>保存配置</button><span>重置</span>
			</div>
		</div>;
	}

	render(){
		return <div> 
			<div className='modal-overlay'></div>

			<div className='config-modal-container'>
				<div className='close-icon fa fa-close'></div>
				<div className='modal-content-wrapper'>
					{this.renderContent()}
				</div>
			</div>

			</div>
		
	}

}

SearchConfigModal.propTypes = propTypes;
SearchConfigModal.defaultProps = defaultProps;

export default SearchConfigModal;
