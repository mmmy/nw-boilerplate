import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { SPACE_DEFINITION } from '../flux/constants/Const';
import { layoutActions, searchConfigActions } from '../flux/actions';
import lodash from 'lodash';
import painter from '../ksControllers/painter';
import store from '../store';

const propTypes = {
	resetTrash: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};

const defaultProps = {
  
};

let generatePattenView = (symbol, imgSrc, similarity, yieldRate, describe) => {
	let infoContainer = `<div class='pattern-info-container'><div class='flex-container'><div><h5 class='font-simsun'>相似度</h5><p class='font-number'>${similarity}</p></div><div><h5 class='font-simsun'>涨跌</h5><p class='font-number'>${yieldRate}</p></div></div></div>`;
	return `<div class='pattern-view trashed'>
						<div class='symbol-container font-arial'>
							<span class='symbol'>${symbol}</span>
							<p class='describe font-simsun'>${describe}</p>
						</div>
						<div class='echart-row-wrapper'>
							<div class='echart'>
								<div class='kline-canvas-wrapper'>
									<canvas class='kline-canvas' width='140' height='80'/>
								</div>
							</div>
						</div>
						${infoContainer}
						</div>`;
}

class TrashModal extends React.Component {

	constructor(props) {
		super(props);
		this.defaultProps = {

		};
		// let searchConfig = lodash.cloneDeep(props.searchConfig);
		this.state = {};
		this._idArr = [];
	}

	componentDidMount() {
		this.initWrapDoms();
		setTimeout(this.showTrashPanel.bind(this));
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){
		this._$root && this._$root.remove();
	}

	initWrapDoms() {
		let domStr = `<div class='modal-overlay flex-center'>

			<div class='trash-modal-container'>
				<div class='close-icon'><span class='fa fa-close'></span></div>
				<div class='title'>剔除的图形</div>
				<div class='trash-modal-content-wrapper'>

				</div>
				<div class='footer flex-center'>
					<span class='info-container'><span class='font-number trash-numers'></span>个对象</span>
					<button>一键恢复</button>
				</div>
			</div>

			</div>`;

		let $dom = $(domStr);
		$dom.find('.close-icon').click(this.closeModal.bind(this));
		$dom.find('.footer button').click(this.handleResetAll.bind(this));
		this._patternsWrapper = $dom.find('.trash-modal-content-wrapper')[0];
		this._$root = $dom;
		this._$trashNumbers = $dom.find('.trash-numers');
		$(window.document.body).append($dom);
	}

	showTrashPanel() {
		let that = this;
		let { resetTrash } = this.props;
		let parent = $(this._patternsWrapper);
		let panel = $(`<div class='trash-panel-container'></div>`);
		let patterns = store.getState().patterns;

		let trashedNodes = $('.trashed-info', '.pattern-collection').parent().parent().parent().map((i, patternView) => {
			let node = $(patternView);

			let idStr = patternView.id,
					id = parseInt(idStr.replace('pattern_view_',''));
			
			that._idArr.push(id);

			let symbol = node.find('.symbol-container').text();
			let describe = node.find('.describe').text();
			let imgSrc = node.find('img').attr('src');
			let infoNode = node.find('.font-number');
			let similarity = $(infoNode[0]).text();
			let yieldRate = $(infoNode[1]).text();
			let pattern = patterns.rawData[id];

			let patternViewNode = $(generatePattenView(symbol, imgSrc, similarity, yieldRate, describe));
			
			painter.drawKline(patternViewNode.find('canvas')[0], pattern && pattern.kLine || []);

			patternViewNode.mouseenter(function() {
				/* Stuff to do when the mouse enters the element */
				// patternViewNode.append(`<div class='reset-container flex-center'><i class='fa fa-undo'></i></div>`);
				patternViewNode.append(`<div class='reset-container flex-center'><i class='ks-undo-icon'></i></div>`);
			}).mouseleave(function(event) {
				/* Act on the event */
				patternViewNode.find('.reset-container').remove();
			}).click(function(event) {
				/* Act on the event */
				console.log(id, patternViewNode);
				resetTrash([id]);
				patternViewNode.remove();
				that.setNumber();
			});;
			patternViewNode.mouseenter(function(event) {
				/* Act on the event */
			});
			panel.append(patternViewNode);
		});
		// panel.append(trashedNodes);

		parent.append(panel);
		// $(window.document.body).append(`<div id='__modal_overlay' class='modal-overlay'></div>`);
		// panel.addClass('animated slideInRight');
		this.setNumber(this._idArr.length);
	}

	handleResetAll() {
		this.props.resetTrash(this._idArr);
		$('.pattern-view', this._patternsWrapper).remove();
		this.setNumber(0);
	}

	renderContent() {

		return <div className='modal-content-contianer'>
			<div className='title'>搜索配置</div>
			
			<div className='footer'>
				<button className='font-simsun' onClick={this.handleResetAll.bind(this)}>一键恢复</button>
			</div>
		</div>;
	}

	setNumber(number) {
		if (number === undefined) {
			number = $('.pattern-view', this._patternsWrapper).length;
		}
		this._$trashNumbers.text(number);
	}

	render(){
		return <div></div>;
	}

	closeModal() {
		let { onClose } = this.props;
		onClose && onClose();
	}

}

TrashModal.propTypes = propTypes;
TrashModal.defaultProps = defaultProps;

export default TrashModal;
