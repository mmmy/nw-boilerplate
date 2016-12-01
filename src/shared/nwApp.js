
let _nwWindow = null;

let getNwWindow = () => {
	if(_nwWindow) {
		return _nwWindow;
	} else {
		try {
			let gui = window.require('nw.gui');
			_nwWindow = gui.Window.get();
			return _nwWindow;
		} catch(e) {
			console.error(e);
			return;
		}
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

let appSetSize = (width, height) => {
	// height > 0 && (getNwWindow().height = height);
	// width > 0 &&	(getNwWindow().width = width);
	var heightOffset = 22;
	getNwWindow().resizeTo(width, height+heightOffset);
	// getNwWindow().width += 1;
	// getNwWindow().height -= 1;
	// setTimeout(() => {
	// 	getNwWindow().restore();
	// 	getNwWindow().focus();
	// }, 500);
	setTimeout(() => {
		// getNwWindow().blur();
		// getNwWindow().restore();
		// getNwWindow().focus();
	}, 500);
	// getNwWindow().focus(false);

};

let appSetMaximumSize = (width, height) => {
	getNwWindow().setMaximumSize(width, height);
};

let appSetMinimumSize = (width, height) => {
	getNwWindow().setMinimumSize(width, height);
};

let appSetResizable = (resizable) => {
	getNwWindow().setResizable(resizable);
};

let updateAppDragable = () => {
	// getNwWindow().width += 1;
	// getNwWindow().width -= 1;
	// setTimeout(() => {
		// getNwWindow().focus();
	// }, 50);
	// getNwWindow().restore();
	// getNwWindow().setPosition('mouse');
	// getNwWindow().focus(false);
};

let appMoveTo = (x, y) => {
	getNwWindow().moveTo(x, y);
};

let appSetCenter = () => {
	getNwWindow().setPosition('center');
};

let appGetSize = () => {
	if(getNwWindow()) {
		return {width:getNwWindow().width, height:getNwWindow().height}
	} else {
		let $body = $(document.body);
		return {width: $body.width(), height: $body.height};
	}
};

module.exports = {
	appMaximize,
	appMinimize,
	appClose,
	appSetSize,
	appSetMinimumSize,
	appSetMaximumSize,
	appSetResizable,
	updateAppDragable,
	appMoveTo,
	appSetCenter,
	appGetSize
};
