import React from 'react';
import Favorites from './Favorites';
import History from './History';
import Selection from './Selection'

class MainPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { };
	}

	render() {
		return (
			<>
				<Selection />
				<Favorites Size={10} />
				<History Size={10} />
			</>
		);
	}
}

export default MainPage;
