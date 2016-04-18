import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import PatternCollection from '../components/PatternCollection';
import classNames from 'classnames';

const propTypes = {
	fullView: PropTypes.bool.isRequired,
	patternSmallView: PropTypes.bool
};

const defaultProps = {
  
};

class PatternContainer extends React.Component {

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
		const { fullView, patternSmallView } = this.props;
		const className = classNames('transition-all', 'pattern-container', {
			'full': fullView,
			'smaller': patternSmallView,
		});
		const toolbarClass = classNames('transition-all', 'pattern-toolbar-container', {
			'hide': !fullView,
		});
		const collectionClass = classNames('transition-all', 'pattern-collection-container', {
			'stretch': !fullView,
		});

		return (<div className={ className }>
			<div className={ toolbarClass }>
				
			</div>
			<div className={ collectionClass }>
				<PatternCollection {...this.props}/>
			</div>
		</div>);
	}
}

PatternContainer.propTypes = propTypes;
PatternContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
	const {layout, patterns, filter} = state;
	const {stockView, patternSmallView, waitingForPatterns} = layout;
	//const {crossFilter,rawData} = patterns;
	return {fullView: !stockView, patternSmallView, patterns, filter, waitingForPatterns};
};

export default connect(stateToProps)(PatternContainer);