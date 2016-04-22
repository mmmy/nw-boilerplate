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
    // console.log(tv.canvas.style.height);
    // console.log(tv.canvas.style.width);
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
    let className = classNames('comparator-prediction', {
      // 'comparator-prediction-hide': !this.props.isPredictionShow
    });
    return (
      <div className={ className }>
        <div className='comparator-prediction-header'>
          <span className='header'>走势预测</span>
          <i className="fa fa-chevron-right"
            aria-hidden="true"
            style={ { "top": "5px" } }
            onClick={ this.togglePredictionPanel.bind(this) }>
          </i>
        </div>
        <div className='comparator-prediction-panel'>
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
