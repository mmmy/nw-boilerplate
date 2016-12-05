
/*
options: {
	isOn: false,
	dom:
	width:
	height:
	onOn:
	onOff:
}
 */

function Switch(options) {
	this._$root = $(options.dom);
	this._width = options.width || 60;
	this._onOn = options.onOn;
	this._onOff = options.onOff;
	this._isOn = options.isOn || false;
	var switchDoms = '<div class="ks-switch-container"><div class="switch-hole"><span class="switch-pin"></span></div></div>';
	this._$root.append(switchDoms);
	this._$switch = this._$root.find('.switch-hole');

	this._$switch.width(this._width);

	var that = this;
	this._$switch.on('click',function(e){
		var $target = that._$switch;
		var $pin = $target.find('.switch-pin');
		$pin.toggleClass('on');
		if($pin.hasClass('on')) {
			that._onOn && that._onOn();
		} else {
			that._onOff && that._onOff();
		}
	});
}

module.exports = Switch;