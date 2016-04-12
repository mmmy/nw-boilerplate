import React, { PropTypes } from 'react';
import classNames from 'classnames';
import EChart from './EChart';

const propTypes = {
	pattern: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
};

const defaultProps = {
  
};

class PatternView extends React.Component {

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
		let {show} = this.props;
		const className = classNames('transition-all', 'pattern-view', {'hide': !show});
		return (<div className={className}>
			<EChart {...this.props} />
		</div>);
	}
}

PatternView.propTypes = propTypes;
PatternView.defaultProps = defaultProps;

export default PatternView;