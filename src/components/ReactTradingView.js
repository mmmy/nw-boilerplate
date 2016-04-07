import React, { PropTypes } from 'react';

let TradingView = window.TradingView;

const propTypes = {
	viewId: PropTypes.string.isRequired,
	options: PropTypes.object.isRequired,
};

const defaultProps = {

};

class ReactTradingView extends React.Component {
	constructor(props) {
		super(props);

	}

	componentDidMount(){
		console.log('componentDidMountm');
		let getParameterByName = (name) => {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

		let options = window.$.extend(this.props.options, {container_id: this.props.viewId});
		var widget = new window.TradingView.widget(options);

	}

	render(){
    let style = {
      position: 'absolute',
      height: '100%',
      width: '100%'
    };

		return (
    <div id={ this.props.viewId } style={ style } />
    )
	}
}

ReactTradingView.propTypes = propTypes;
ReactTradingView.defaultProps = defaultProps;
export default ReactTradingView;
