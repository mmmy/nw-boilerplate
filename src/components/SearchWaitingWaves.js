import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { SineWaves } from './lib/sine-waves';

const propTypes = {
	slow: PropTypes.bool
};

const defaultProps = {

};

class SearchWaitingWaves extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.initWaves();
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){
	}

	initWaves(){
		let { slow } = this.props;
		let el = this.refs.waves;
		let width = el.parentNode.clientWidth,
			height = el.parentNode.clientHeight;

		const speed = slow ? (5 * 0.3) : 5;
		let waves = new SineWaves({
			// Canvas Element
			el: el,

			// General speed of entire wave system
			speed: speed,
	        width: width,
	        height: height,
	        wavesWidth: "200%",
	        ease: "SineInOut",
	        waves: [{
	            timeModifier: 1,
	            lineWidth: 1,
	            amplitude: 50,
	            wavelength: 100,
	            segmentLength: 1,
	            type:'sine'
	        }, {
	            timeModifier: 0.66,
	            lineWidth: 1,
	            amplitude: 35,
	            wavelength: 150,
	            segmentLength: 1
	        }, {
	            timeModifier: 0.5,
	            lineWidth: 1,
	            amplitude: 20,
	            wavelength: 80,
	            segmentLength: 1
	        }],
	        initialize: function() {},
	        resizeEvent: function() {
	            var a = this.ctx.createLinearGradient(0, 0, this.width, 0);
	            a.addColorStop(0, "rgba(33, 33, 33, 0)"),
	            a.addColorStop(.5, "rgba(150, 150, 150, 0.2)"),
	            a.addColorStop(1, "rgba(33, 33, 33, 0)");
	            for (var b = -1, c = this.waves.length; ++b < c; )
	                this.waves[b].strokeStyle = a;
	            b = void 0,
	            c = void 0,
	            a = void 0
	        }
		});
		this.waves = waves;
		window.waves = waves;
	}

	shiningWave(waves) {

	}

	render(){
		return (
      		<div className="waves-wrapper">
      			<canvas ref='waves'></canvas>
      		</div>
    	);
	}
}

SearchWaitingWaves.propTypes = propTypes;
SearchWaitingWaves.defaultProps = defaultProps;

export default SearchWaitingWaves;
