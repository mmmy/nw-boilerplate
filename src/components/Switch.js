import React, { PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
	width: PropTypes.string,
	height: PropTypes.string,
	onColor: PropTypes.string,
	offColor: PropTypes.string,
	trashed: PropTypes.bool,
	onToggle: PropTypes.func,
};

const defaultProps = {
	trashed: false
};

class Switch extends React.Component {

	constructor(props) {
		super(props);
		let {trashed} = this.props;
		this.state = {trashed};
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
		let {trashed} = this.state;
		this.setState({trashed: !trashed});
		onToggle && onToggle(!trashed);
	}

	render(){
		let {width, height, onColor, offColor} = this.props;
		let style = {width, height};
		let { trashed } = this.state;
		// let className = classNames('switch-pin transition-all transition-duration2 transition-ease', {'on': !this.state.on});
		let className = classNames('fa', {'fa-trash': !trashed, 'fa-refresh': trashed});
		return (
      <div style={style} className="switch-contianer" onClick={this.toggle.bind(this)}>
      	<i className={className}></i>
      </div>
    );
	}
}

Switch.propTypes = propTypes;
Switch.defaultProps = defaultProps;

export default Switch;
