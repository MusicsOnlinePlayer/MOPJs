import React from 'react';
import Axios from 'axios';
import MusicGroup from './MusicGroup';

class Favorites extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			MusicIds: undefined,
		};
	}

	componentDidMount() {
		Axios.get('/User/LikedMusics').then((res) => {
			this.setState({
				MusicIds: res.data.MusicsId,
			});
		});
	}

	render() {
		const { MusicIds } = this.state;

		if (MusicIds) {
			return <MusicGroup MusicIds={MusicIds} DetailType="Favorites" />;
		}

		return <></>;
	}
}
export default Favorites;
