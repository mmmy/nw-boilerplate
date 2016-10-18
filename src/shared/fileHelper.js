
var chooseFile = function(dom, cb) {
	var chooser = $(dom);
	chooser.unbind('change');
	chooser.change(function(event) {
		/* Act on the event */
		// console.log($(this).val());
		cb($(this).val());
	});
	// chooser.trigger('click');
}

module.exports = {
	chooseFile
};