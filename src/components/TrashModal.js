import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { SPACE_DEFINITION } from '../flux/constants/Const';
import { layoutActions, searchConfigActions } from '../flux/actions';
import lodash from 'lodash';

const propTypes = {
	resetTrash: PropTypes.func.isRequired,
};

const defaultProps = {
  
};

class TrashModal extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		// let searchConfig = lodash.cloneDeep(props.searchConfig);
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

	handleResetAll() {
		
	}

	renderContent() {

		return <div className='modal-content-contianer'>
			<div className='title'>搜索配置</div>
			
			<div className='footer'>
				<button onClick={this.handleResetAll.bind(this)}>一键恢复</button>
			</div>
		</div>;
	}

	render(){
		return <div> 
			<div className='modal-overlay'></div>

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
	}

}

TrashModal.propTypes = propTypes;
TrashModal.defaultProps = defaultProps;

export default TrashModal;
