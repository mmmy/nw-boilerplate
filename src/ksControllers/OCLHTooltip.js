
function OCLHTooltip(parent, config){
	let newDoms = $(`<div class="OCLH-tooltip-container">
										<div class="oclh-item oclh-o"><span class="label">O</span><span class="value">NaN</span></div>
										<div class="oclh-item oclh-c"><span class="label">C</span><span class="value">NaN</span></div>
										<div class="oclh-item oclh-l"><span class="label">L</span><span class="value">NaN</span></div>
										<div class="oclh-item oclh-h"><span class="label">H</span><span class="value">NaN</span></div>
										<div class="oclh-item oclh-v"><span class="label">V</span><span class="value">NaN</span></div>
									</div>`);
	this._$parent = $(parent);
	this._$container = newDoms;
	this._$O = newDoms.find('.oclh-o .value');
	this._$C = newDoms.find('.oclh-c .value');
	this._$L = newDoms.find('.oclh-l .value');
	this._$H = newDoms.find('.oclh-h .value');
	this._$V = newDoms.find('.oclh-v .value');

	this._$parent.append(newDoms);

	this._offset = 10;
	this._init();
}

OCLHTooltip.prototype._init = function() {
	// this._$container.on('mousemove', (e)=>{
	// 	e.preventDefault();
	// 	e.stopPropagation();
	// });
	this.hide();
}

OCLHTooltip.prototype.setPosition = function(left, top, cssPosition) {
	left += this._offset;
	top += this._offset;
	let h = this._$container.height();
	let maxTop = document.body.clientHeight - h - 50;
	top = (top > maxTop) ? maxTop : top;
	let position = cssPosition || 'absolute';
	this._$container.css({left, top, position});
}

OCLHTooltip.prototype.setOCLH = function(o, c, l, h, v) {
	this._$O.text(o.toFixed(2));
	this._$C.text(c.toFixed(2));
	this._$L.text(l.toFixed(2));
	this._$H.text(h.toFixed(2));

	v = v / 100;
	var vStr = 'N/A';
	if(9995 > v) vStr = v + ' 手';
	else {
		var num = v / 1E4;
		vStr = num >= 10000 ? num.toFixed(0) : (num + '').slice(0,6);
		vStr += ' 万手'
	}
	this._$V.text(vStr);
}

OCLHTooltip.prototype.show = function() {
	this._$container.show();
}

OCLHTooltip.prototype.hide = function() {
	this._$container.hide();
}

module.exports = OCLHTooltip;