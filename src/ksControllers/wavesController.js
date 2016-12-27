
import KsWave from './KsWave';
let _ksWave = null;
let _$root = null;
let _$wavesDoms = null;


let wavesController = {};

wavesController.init = (root) => {
	_$root = $(root);
	// _$wavesDoms = $(`<div class="waves-container float transition-all transition-duration2"><div class="waves-wrapper"><canvas class="transition-all"></canvas></div></div>`);
	_$wavesDoms = $(`<div class="waves-container float"><div class="waves-wrapper"><canvas></canvas></div></div>`);
	_$root.append(_$wavesDoms);
};

wavesController.start = (isSlow=true) => {
	if(_ksWave) {
		return;
		// _ksWave.dispose();
		// _ksWave = null;
	}
	let canvas = _$wavesDoms.find('canvas')[0];
	_ksWave = new KsWave(canvas, {slow: isSlow});
	_$wavesDoms.css('z-index', 1);
};

wavesController.speedUp = () => {
	if(_ksWave) {
		_ksWave.setWaveFaster();
	}
};

wavesController.stop = () => {
	_ksWave && _ksWave.dispose();
	_ksWave = null;
	_$wavesDoms.css('z-index', 0);
};

module.exports = wavesController;