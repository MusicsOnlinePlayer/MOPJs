import React from 'react';
import Axios from 'axios';
import MusicGroup from './MusicGroup';

class History extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			MusicIds: undefined,
		};
	}

	componentDidMount() {
		Axios.get('/User/ViewedMusics').then((res) => {
			this.setState({
				MusicIds: res.data.MusicsId,
			});
		});
	}

	render() {
		const { MusicIds } = this.state;

		if (MusicIds) {
			return <MusicGroup MusicIds={MusicIds} DetailType="History" />;
		}

		return <></>;
	}
}
export default History;
