
let setSession = (name, value) => {
	if(!name) return;
	window.sessionStorage[name] = value;
};

let getSession = (name) => {
	if(!name) return;
	return window.sessionStorage[name];
};

var ConfirmModal = function({title, detail, isAlert, sessionName, onYes, onNo, width=470}) {
	let notShowNextTime = getSession(sessionName);
	if(notShowNextTime=='true') {
		onYes && onYes();
		return null;
	}
	this._isAlert = isAlert;
	this._width = width;
	this._onYes = onYes;
	this._onNo = onNo;
	this._title = title;
	this._detail = detail;
	this._sessionName = sessionName;
	this._notShowNextTime = false;
	this._init();
}

ConfirmModal.prototype._init = function() {
	let $wrapper = $(`<div class='modal-overlay flex-center'></div>`);

	let closeBtn = `<div class='close-btn'><span class='close-icon'></span></div>`;
	let title = `<div class='title ${this._isAlert ? "up" : ""}'>${this._title}</div>`;
	let detail = this._detail && `<div class="detail">${this._detail}</div>`;
	let yesBtn = `<button class='flat-btn button btn-yes ${this._isAlert ? "center" : ""}'>${this._isAlert ? "确定" : "是"}</button>`;
	let noBtn = !this._isAlert && `<button class='flat-btn button btn-no'>否</button>`;

	let footer = this._sessionName ? `<div class='footer'><span class='no-check-icon'></span>下次不再提醒</div>` : '';

	let $modal = $(`<div class='modal-confirm-container font-simsun'></div>`)
								.css({width: this._width})
								.append(closeBtn)
								.append(title)
								.append(detail)
								.append(yesBtn)
								.append(noBtn)
								.append(footer);

	this._$modal = $modal;
	this._$wrapper = $wrapper.append($modal);

	$(window.document.body).append(this._$wrapper);

	this._initHandle();
}

ConfirmModal.prototype._initHandle = function() {
	let me = this;
	this._$modal.find('.close-icon').click(function(event) {
		/* Act on the event */
		me._$wrapper.remove();
	});

	this._$modal.find('.btn-yes').click(function(event) {
		/* Act on the event */
		me._$wrapper.remove();
		let option = {notShowNextTime: me._notShowNextTime};
		setSession(me._sessionName, me._notShowNextTime);
		me._onYes && me._onYes(option);
	});

	this._$modal.find('.btn-no').click(function(event) {
		/* Act on the event */
		me._$wrapper.remove();
		me._onNo && me._onNo();
	});

	this._$modal.find('.no-check-icon').click(function(event) {
		/* Act on the event */
		me.toggleShowNextTime();
	});

}

ConfirmModal.prototype.toggleShowNextTime = function() {
	this._notShowNextTime = !this._notShowNextTime;
	this._$modal.find('.no-check-icon').toggleClass('check', this._showNextTime);
}

module.exports = ConfirmModal;
