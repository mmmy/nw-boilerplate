/*
显示试用期即将结束 或 已经结束
 */
var trialReminder = {}

trialReminder.show = (loginState, callback)=>{
	var isExpired = loginState.code == 10003;
	var daysRemain = loginState.expireInDay;

	var $overlay = $(`<div class="modal-overlay ${isExpired ? 'black' : ''} flex-center"></div>`);
	var $wrapper = $('<div class="modal-wrapper trial-reminder"></div>');
	var $title = $(`<div class="title"><img src="./image/${isExpired ? 'warn.png' : 'dengpao.png'}"></div>`)
								.append(isExpired ? '您的试用期已经结束' : '您的试用期即将结束')

	var $body = $(`<div class="body"></body>`)
							.append(isExpired ? '<p>很抱歉, 您的免费试用期已经结束</p>' : `<p>您的试用期仅剩 <span class="days">${daysRemain}</span> 天</p>`)
							.append('<p class="info">如需继续使用, 请联系我们:<br/>info@stone.com</p>');
	
	var $footer = $(`<div class="footer"><button class="flat-btn gray-light round">${isExpired ? '关闭' : '知道了'}</button></div>`);

	$wrapper.append($title).append($body).append($footer);
	$overlay.append($wrapper);
	$(document.body).append($overlay);

	$footer.find('button').click(function(event) {
		callback && callback(isExpired);
		if(isExpired) { //关闭app
			require('../shared/nwApp').appClose();
		} else {
			$overlay.remove();
		}
	});
};

trialReminder.check = (info, callback) => {
	var loginState = info.loginState;
	if(loginState.expireInDay <= 15) {    //小于15天, 提醒
		trialReminder.show(loginState, callback);
	} else { //
		callback && callback(false);
	}
	if(loginState.expireInDay === 0 || loginState.code == 10003) {
		return false;
	}
	return true;
};

module.exports = trialReminder;