
let _nwWindow = null;

let getNwWindow = () => {
	if(_nwWindow) {
		return _nwWindow;
	} else {
		let gui = window.require('nw.gui');
		_nwWindow = gui.Window.get();
		return _nwWindow;
	}
};

let appMinimize = () => {
	getNwWindow().minimize();
};
let appMaximize = () => {
	getNwWindow().maximize();
};
let appClose = () => {
	getNwWindow().close();
};

module.exports = {
	appMaximize,
	appMinimize,
	appClose,
};