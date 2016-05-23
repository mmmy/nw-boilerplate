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
		let { showConfigModal } = this.props;
		return showConfigModal ? <ConfigModal /> : <div></div>;
	}

}

SearchConfigModal.propTypes = propTypes;
SearchConfigModal.defaultProps = defaultProps;


let stateToProps = function(state) {
	const {configModal} = state;
	const {showConfigModal} = configModal;
	return {
		showConfigModal,
	};
};

export default connect(stateToProps)(SearchConfigModal);