import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

const propTypes = {

};

const defaultProps = {

};

class ActivePatternInfoContainer extends React.Component {

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
    let { similarity, yieldRate } = this.props;
    similarity = Math.round(similarity * 1000) / 10;
    yieldRate = Math.round(yieldRate * 1000) / 10;

    const similarityClassNames = classNames('active-pattern-info font-number');

    const yieldRateClassNames = classNames('active-pattern-info font-number', {
      'red-color': (yieldRate > 0)
    });

    let similarityDiv = <span className={ similarityClassNames }>{similarity + '%' }</span>
    let yieldDiv = <span className={ yieldRateClassNames }>{ yieldRate + '%' }</span>

		return (
      <div className={ 'active-pattern-info-container font-simsun' }>
        <div>相似度   {similarityDiv}</div>
        <div>回报   {yieldDiv}</div>
		  </div>
    );
	}
}

ActivePatternInfoContainer.propTypes = propTypes;
ActivePatternInfoContainer.defaultProps = defaultProps;

let stateToProps = function(state) {
  let { active } = state;
  let { similarity, yieldRate } = active;
	return {
    similarity: similarity,
    yieldRate: yieldRate
  };
};

export default connect(stateToProps)(ActivePatternInfoContainer);
