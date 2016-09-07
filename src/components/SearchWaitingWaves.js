import React, { PropTypes } from 'react';
import classNames from 'classnames';
import getSineWaves from './lib/sine-waves';

const propTypes = {
	slow: PropTypes.bool
};

const defaultProps = {
	slow: true
};

const baseSpeed = 3;
const slowSpeed = 0.4;

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

	componentDidUpdate() {
		this.setWaveSpeed();
		this.shiningWave(this.waves);
	}

	componentWillUnmount(){
		this.waves.running = false;
		delete this.waves;
		this.waves = null;
	}

	initWaves(){
		let { slow } = this.props;
		let el = this.refs.waves;
		// let width = el.parentNode.clientWidth,
			// height = el.parentNode.clientHeight;

		const speed = slow ? slowSpeed : baseSpeed;
		let SineWaves = getSineWaves();
		let waves = new SineWaves({
			// Canvas Element
			el: el,

			// General speed of entire wave system
			speed: speed,
	        width: () => { return el.parentNode.clientWidth; },
	        height: () => { return  el.parentNode.clientHeight; },
	        wavesWidth: "200%",
	        ease: "SineInOut",
	        waves: [{
	            timeModifier: 3,
	            lineWidth: 1,
	            amplitude: 50,
	            wavelength: 100,
	            segmentLength: 1,
	            type:'sine'
	        }, {
	            timeModifier: 2,
	            lineWidth: 1,
	            amplitude: 35,
	            wavelength: 150,
	            segmentLength: 1
	        }, {
	            timeModifier: 1,
	            lineWidth: 1,
	            amplitude: 20,
	            wavelength: 80,
	            segmentLength: 1
	        }],
	        initialize: function() {},
	        resizeEvent: function() {
	            var a = this.ctx.createLinearGradient(0, 0, this.width, 0);
	            a.addColorStop(0, "rgba(220, 220, 220, 0.2)"),
	            a.addColorStop(.5, "rgba(220, 220, 220, 0.8)"),
	            a.addColorStop(1, "rgba(220, 220, 220, 0.2)");
	            for (var b = -1, c = this.waves.length; ++b < c; )
	                this.waves[b].strokeStyle = a;
	            b = void 0,
	            c = void 0,
	            a = void 0
	        }
		});
		this.waves = waves;
		window.waves = waves;
		this.shiningWave(this.waves);
	}

	setWaveSpeed() {
		let { slow } = this.props;
		if(!slow) {
			// let interval = Math.round(this.waves.time/0.05);
			// this.waves.options.speed = 5;
			this.waves.waves[0].timeModifier = this.waves.waves[0].timeModifier * baseSpeed/slowSpeed;
			this.waves.waves[1].timeModifier = this.waves.waves[1].timeModifier * baseSpeed/slowSpeed;
			this.waves.waves[2].timeModifier = this.waves.waves[2].timeModifier * baseSpeed/slowSpeed;
		}
		//this.waves.options.speed = slow ? slowSpeed : baseSpeed;
	}

	shiningWave(waves) {
		// if (this._interval) {
		// 	return;
		// }
		if(this.props.slow) return;

		let base = 220;
		let count = 0;
		let ctx = waves.ctx;
		let that = this;
		if(this._interval || this.shiningFinish) return;
		this.shiningFinish = true;
		this._interval = setInterval(function() {
			count ++ ;
			if(count >= 50) {
				clearInterval(that._interval);
				that._interval = null;
				return;
			}
			let rest = count % 25;
			let offset = count < 25 ? rest : (25 - rest);
			//let color = `rgba(${base+rest},${base-rest},${base-rest}, 1)`;
			let color = ctx.createLinearGradient(0, 0, waves.width, 0);
          color.addColorStop(0, `rgba(${base-Math.round(offset/2)},${base-offset*2},${base-offset*2},0.2)`),
          color.addColorStop(.5, `rgba(${base-Math.round(offset/2)},${base-offset*2},${base-offset*2},0.8)`),
          color.addColorStop(1, `rgba(${base-Math.round(offset/2)},${base-offset*2},${base-offset*2},0.2)`);
			waves.waves[0].strokeStyle = color;
			waves.waves[1].strokeStyle = color;
			waves.waves[2].strokeStyle = color;
		}, 0);
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
