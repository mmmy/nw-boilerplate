import React from 'react';

class MainChart extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount(){

	}

	render(){
		return (
      <div className="container-main">
        { this.props.children }
      </div>;
    )
	}
}

export default MainChart;
