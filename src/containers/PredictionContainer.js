import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ComparatorPrediction from '../components/ComparatorPrediction';

const propTypes = {

};

const defaultProps = {

};

class PredictionContainer extends React.Component {

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
		let className = classNames();
    const {stretchView, patterns, activeId} = this.props;
		return (
      <div className={ 'prediction-main' }>
        <div className={ 'comparator-header' }>
          <span>走势分布</span>
        </div>
        <ComparatorPrediction
          stretchView={ stretchView }
          patterns={ patterns }
          activeId={ activeId }/>
      </div>
    );
	}
}

PredictionContainer.propTypes = propTypes;
PredictionContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
  const {layout, patterns, active} = state;
  const {stockView} = layout;
  const {id} = active;
	return {
    stretchView: !stockView,
    patterns: patterns,
    activeId: id,
  };
};

export default connect(stateToProps)(PredictionContainer);
