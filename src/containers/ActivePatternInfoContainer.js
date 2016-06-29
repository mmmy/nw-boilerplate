import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

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
		return (
      <div className={ 'active-pattern-info-container' }>
        <span className={'active-pattern-info-similarity'}>相似度：{ similarity } %</span>
        <span className={'active-pattern-info-yield'}>返回：{yieldRate} %</span>
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
