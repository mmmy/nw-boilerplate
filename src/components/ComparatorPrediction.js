import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { layoutActions } from '../flux/actions';

const propTypes = {

};

const defaultProps = {

};

class ComparatorPrediction extends React.Component {

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

  togglePredictionPanel() {
    this.props.dispatch(layoutActions.togglePredictionPanel());
  }

	render(){
    let className = classNames('comparator-prediction');
    return (
      <div className={ className }>
        <div className='comparator-prediction-header'>
          <span>走势预测</span>
            <span
              className='glyphicon glyphicon-chevron-right'
              style={{float: "right"}}
              onClick={ this.togglePredictionPanel.bind(this) }>
            </span>
        </div>
      </div>
    );
	}
}

ComparatorPrediction.propTypes = propTypes;
ComparatorPrediction.defaultProps = defaultProps;

var stateToProps = function(state){
	const { layout } = state;
	const { stockView, isPredictionShow } = layout;
	return {
		fullView: !stockView,
    isPredictionShow: isPredictionShow
	}
};

export default connect(stateToProps)(ComparatorPrediction);
