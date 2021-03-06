
import getSineWaves from '../../vendor/sine-waves';

function KsWave(canvas, config){
	this._canvas = canvas;
	this._slow = config && config.slow || true;
	this._slowSpeed = 1 * 2;
	this._baseSpeed = 3 * 2;
	this._waves = null;
	this._init();
}

KsWave.prototype._init = function() {
	let el = this._canvas;
	const speed = this._slow ? this._slowSpeed : this._baseSpeed;
	let SineWaves = getSineWaves();
	this._waves = new SineWaves({
		// Canvas Element
		el: el,

		// General speed of entire wave system
		speed: speed,
    width: () => { return el.parentNode.clientWidth; },
    height: () => { return  el.parentNode.clientHeight; },
    wavesWidth: "200%",
    ease: "SineInOut",
    waves: [{
        timeModifier: 4,
        lineWidth: 1,
        amplitude: 30,
        wavelength: 100,
        segmentLength: 1,
        type:'sine'
    }, {
        timeModifier: 2,
        lineWidth: 1,
        amplitude: 20,
        wavelength: 150,
        segmentLength: 1
    }, {
        timeModifier: 1,
        lineWidth: 1,
        amplitude: 10,
        wavelength: 80,
        segmentLength: 1
    }],
    initialize: function() {},
    resizeEvent: function() {
        var a0 = this.ctx.createLinearGradient(0, 0, this.width, 0);
        a0.addColorStop(0, "rgba(255, 255, 255, 0.03)"),
        a0.addColorStop(.5, "rgba(255, 255, 255, 0.1)"),
        a0.addColorStop(1, "rgba(255, 255, 255, 0.03)");
        var a1 = this.ctx.createLinearGradient(0, 0, this.width, 0);
        a1.addColorStop(0, "rgba(255, 255, 255, 0.03)"),
        a1.addColorStop(.5, "rgba(255, 255, 255, 0.07)"),
        a1.addColorStop(1, "rgba(255, 255, 255, 0.03)");
        var a2 = this.ctx.createLinearGradient(0, 0, this.width, 0);
        a2.addColorStop(0, "rgba(255, 255, 255, 0.03)"),
        a2.addColorStop(.5, "rgba(255, 255, 255, 0.04)"),
        a2.addColorStop(1, "rgba(255, 255, 255, 0.03)");
        var a = [a0,a1,a2];
        for (var b = -1, c = this.waves.length; ++b < c; )
            this.waves[b].strokeStyle = a[b] ? a[b] : a[0];
        b = void 0,
        c = void 0,
        a = void 0
    }
	});
}
//颜色红亮一下
KsWave.prototype.shiningWaves = function() {
	let waves = this._waves;
	let base = 150;
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

KsWave.prototype.setWaveFaster = function() {
	if(this._slow) {
		this._slow = false;
		let waves = this._waves,
				baseSpeed = this._baseSpeed,
				slowSpeed = this._slowSpeed;

		waves.waves[0].timeModifier = waves.waves[0].timeModifier * baseSpeed/slowSpeed;
		waves.waves[1].timeModifier = waves.waves[1].timeModifier * baseSpeed/slowSpeed;
		waves.waves[2].timeModifier = waves.waves[2].timeModifier * baseSpeed/slowSpeed;
		this.shiningWaves();
	}
}

KsWave.prototype.dispose = function() {
	this._waves.running = false;
	let ctx = this._canvas.getContext('2d');
	ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
	delete this._waves;
	this._waves = null;
}

module.exports = KsWave;
