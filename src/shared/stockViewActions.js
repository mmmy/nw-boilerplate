
let _stockViewDom = null;

let setPrediction = (type='days', value) => {
	_stockViewDom = _stockViewDom || window.document.querySelectorAll('iframe')[1];
	if(_stockViewDom && _stockViewDom.contentWindow) {
		let context = _stockViewDom.contentWindow;
		let ksLayout = context.__ksLayout;
		let prediction = ksLayout && ksLayout.prediction;
		if(prediction){
			prediction.type = type;
			prediction.value = value;
			try {
				let selectedSource = context.Q5.getAll()[0].R99.selectedSource();
				selectedSource && selectedSource.updateAllViewsAndRedraw();
				ksLayout.hoverSearchConfig = false;
			} catch (e) {
				console.error(e);
			}
		}
	}
};

module.exports = {
	setPrediction
}