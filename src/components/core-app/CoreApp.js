import React from 'react';

class MainChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount(){
		
	}

	render(){
		return <div className='container-coreapp'>
			{ this.props.children }
		</div>;
	}
}

export default MainChart;