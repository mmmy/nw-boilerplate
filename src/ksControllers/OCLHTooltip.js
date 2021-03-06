
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
	return this;
}

OCLHTooltip.prototype.setOCLH = function(o, c, l, h, v) {
	this._$O.text(o.toFixed(2));
	this._$C.text(c.toFixed(2));
	this._$L.text(l.toFixed(2));
	this._$H.text(h.toFixed(2));

	var vStr = $.keyStone.volumeFormatter(v);
	this._$V.text(vStr);
	return this;
}

OCLHTooltip.prototype.show = function() {
	this._$container.show();
	return this;
}

OCLHTooltip.prototype.hide = function() {
	this._$container.hide();
	return this;
}

module.exports = OCLHTooltip;