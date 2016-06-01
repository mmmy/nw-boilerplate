import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { SPACE_DEFINITION } from '../flux/constants/Const';
import { layoutActions, searchConfigActions } from '../flux/actions';
import lodash from 'lodash';

const propTypes = {
	resetTrash: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};

const defaultProps = {
  
};


let generatePattenView = (symbol, imgSrc, similarity, yieldRate) => {
	let infoContainer = `<div class='pattern-info-container'><div class='flex-container'><div><h5>相似度</h5><p class='font-number'>${similarity}</p></div><div><h5>返回</h5><p class='font-number'>${yieldRate}</p></div></div></div>`;
	return `<div class='pattern-view'><div class='symbol-container'>${symbol}</div><div class='echart-row-wrapper'><div class='echart'><img src='${imgSrc}'/></div></div>${infoContainer}</div>`;
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
		setTimeout(this.showTrashPanel.bind(this));
	}

	componentWillReceiveProps(){

	}

	shouldComponentUpdate(){
		return true;
	}

	componentWillUnmount(){

	}

	showTrashPanel() {
		let that = this;
		let { resetTrash } = this.props;
		let parent = $(this.refs.trash_modal_content_wrapper);
		let panel = $(`<div class='trash-panel-container'></div>`);

		let trashedNodes = $('.trashed-info', '.pattern-collection').parent().parent().parent().map((i, patternView) => {
			let node = $(patternView);

			let idStr = patternView.id,
					id = parseInt(idStr.replace('pattern_view_',''));
			
			that._idArr.push(id);

			let symbol = node.find('.symbol-container').text();
			let imgSrc = node.find('img').attr('src');
			let infoNode = node.find('.font-number');
			let similarity = $(infoNode[0]).text();
			let yieldRate = $(infoNode[1]).text();

			let patternViewNode = $(generatePattenView(symbol, imgSrc, similarity, yieldRate));
			patternViewNode.mouseenter(function() {
				/* Stuff to do when the mouse enters the element */
				patternViewNode.append(`<div class='reset-container flex-center'><i class='fa fa-undo'></i></div>`);
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
		$('.pattern-view', this.refs.trash_modal_content_wrapper).remove();
		this.setNumber(0);
	}

	renderContent() {

		return <div className='modal-content-contianer'>
			<div className='title'>搜索配置</div>
			
			<div className='footer'>
				<button onClick={this.handleResetAll.bind(this)}>一键恢复</button>
			</div>
		</div>;
	}

	setNumber(number) {
		if (number === undefined) {
			number = $('.pattern-view', this.refs.trash_modal_content_wrapper).length;
		}
		$(this.refs.object_number).text(number);
	}

	render(){
		return <div className='modal-overlay flex-center'>

			<div className='trash-modal-container'>
				<div className='close-icon' onClick={this.closeModal.bind(this)}><span className='fa fa-close'></span></div>
				<div className='title'>剔除的图形</div>
				<div className='trash-modal-content-wrapper' ref='trash_modal_content_wrapper'>

				</div>
				<div className='footer flex-center'>
					<span className='info-container'><span className='font-number' ref='object_number'></span>个对象</span>
					<button onClick={this.handleResetAll.bind(this)}>一键恢复</button>
				</div>
			</div>

			</div>
		
	}

	closeModal() {
		let { onClose } = this.props;
		onClose && onClose();
	}

}

TrashModal.propTypes = propTypes;
TrashModal.defaultProps = defaultProps;

export default TrashModal;
