import React from 'react';
import ConfigModal from '../../src/components/ConfigModal';

export default React.createClass({
	getInitialState(){
		return {larger: false};
	},
	render(){
		//return <div>aaa</div>;
		return <ConfigModal show={true} />;
	},

});