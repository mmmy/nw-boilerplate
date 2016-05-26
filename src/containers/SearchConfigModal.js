import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import ConfigModal from '../components/ConfigModal';

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

	render(){
		let { showConfigModal, searchConfig, dispatch } = this.props;
		return showConfigModal ? <ConfigModal searchConfig={searchConfig} dispatch={dispatch}/> : <div></div>;
	}

}

SearchConfigModal.propTypes = propTypes;
SearchConfigModal.defaultProps = defaultProps;


let stateToProps = function(state) {
	const {configModal, searchConfig} = state;
	const {showConfigModal} = configModal;
	return {
		showConfigModal,
		searchConfig,
	};
};

export default connect(stateToProps)(SearchConfigModal);