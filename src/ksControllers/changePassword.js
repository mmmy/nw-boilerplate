
var udf = require('../backend/udf');

var changePassword = {};

changePassword.show = function() {
	var account = window.store.getState().account;

	var $overlay = $('<div class="modal-overlay flex-center font-msyh"></div>');
	var $wrapper = $('<div class="modal-wrapper change-password"></div>');

	var $inputOrigin = $('<input type="password" placeholder="原密码">');
	var $inputNew = $('<input type="password" placeholder="使用6-20位数字、字母或符号">');
	var $inputNewConfirm = $('<input type="password" placeholder="请再次输入密码">');
	var $error1 = $('<div class="error red"></div>');
	var $error2 = $('<div class="error red"></div>');

	$wrapper.append('<h4 class="title">更改密码</h4>')
	var $content = $('<div class="content"></div>')
					.append(`<div class="label-block">请输入${account.username}的原密码</div>`)
					.append($inputOrigin)
					.append($error1)
					.append('<div class="label-block">设置新密码</div>')
					.append($inputNew)
					.append($inputNewConfirm)
					.append($error2)
					.append('<div><button class="flat-btn btn-red round">保存</button><button class="flat-btn btn-cancel">关闭</button></div>')
	
	$wrapper.append($content);

	//actions
	var handleError = (e) => {
		$error2.text('修改密码失败, 请稍后重试');
		$content.find('.flat-btn.btn-red').text('保存');
	};
	var handleSuccess = (state) => {
		if(state && state.code === 0) {
			account.password = $inputNew.val();
			$content.empty().append($('<div class="success-wrapper"></div>').append([
					'<div><i class="icon-success"></i></div>',
					'<p>修改密码成功!</p>',
					'<div><button class="flat-btn btn-gray">关闭</button></div>',
				]));
			$content.find('.flat-btn').click(()=>{ $overlay.remove(); });
		} else {
			handleError();
		}
	};
	var onSave = () => {
		$error1.text('');
		$error2.text('');
		//verify
		if($inputOrigin.val() !== account.password) {
			$error1.text('原密码输入有误');
			return;
		}
		var passwordNew = $inputNew.val();
		var passwordNewConfirm = $inputNewConfirm.val();
		if(passwordNew.length < 6 || passwordNew.length > 20) {
			$error2.text('密码长度为6-20位');
			return;
		}
		if(passwordNew !== passwordNewConfirm) {
			$error2.text('两次密码输入不一致');
			return;
		}
		$content.find('.flat-btn.btn-red').html('<i class="fa fa-spinner fa-spin"></i>');
		var postData = {
			username: account.username,
			password: account.password,
			passwordNew: passwordNew,
		};
		new Promise((resolve, reject)=>{
			udf.changePassword(postData, resolve, reject);
		}).then(handleSuccess).catch(handleError);
	};
	var onCancel = () => {
		$overlay.remove();
	};

	$content.find('.flat-btn.btn-red').click(onSave);
	$content.find('.flat-btn.btn-cancel').click(onCancel);
	//
	$overlay.append($wrapper);
	$(document.body).append($overlay);
	$inputOrigin.focus();
}

module.exports = changePassword;
