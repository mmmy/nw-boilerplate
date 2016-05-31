import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
	width: PropTypes.string,
	height: PropTypes.string,
	onColor: PropTypes.string,
	offColor: PropTypes.string,
	on: PropTypes.bool,
	onToggle: PropTypes.func,
};

const defaultProps = {
	on: false
};

class Switch extends React.Component {

	constructor(props) {
		super(props);
		let {on} = this.props;
		this.state = {on};
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

	toggle(e) {
		e.stopPropagation();
		let {onToggle} = this.props;
		let {on} = this.state;
		this.setState({on: !on});
		onToggle && onToggle(!on);
	}

	render(){
		let {width, height, onColor, offColor} = this.props;
		let style = {width, height};
		let className = classNames('switch-pin transition-all transition-duration2 transition-ease', {'on': !this.state.on});
		return (
      <div style={style} className="switch-contianer" onClick={this.toggle.bind(this)}>
      	<div className={className}></div>
      </div>
    );
	}
}

Switch.propTypes = propTypes;
Switch.defaultProps = defaultProps;

export default Switch;
