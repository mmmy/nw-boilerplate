import React, { PropTypes } from 'react';
import classNames from 'classnames';
import EChart from './EChart';

const propTypes = {
	kLine: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
};

const defaultProps = {
  
};

class Template extends React.Component {

	constructor(props) {
		super(props);
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
		const className = classNames('pattern-view');
		return (<div className={className}>
			<EChart {...this.props} />
		</div>);
	}
}

Template.propTypes = propTypes;
Template.defaultProps = defaultProps;

export default Template;