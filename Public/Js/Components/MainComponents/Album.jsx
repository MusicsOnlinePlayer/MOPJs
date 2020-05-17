import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import MusicGroup from './MusicGroup';

class Album extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				id: PropTypes.string.isRequired,
			}).isRequired,
		}).isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {
			MusicIds: undefined,
			AlbumName: '',
		};
	}

	componentDidMount = () => {
		const { match } = this.props;

		Axios.get(`/Music/Album/id/${match.params.id}?mode=all`).then((res) => {
			this.setState({
				MusicIds: res.data.MusicsId,
				AlbumName: res.data.Name,
			});
		});
	};

	render() {
		const { MusicIds, AlbumName } = this.state;

		if (MusicIds) {
			return <MusicGroup MusicIds={MusicIds} DetailType={AlbumName} />;
		}

		return <></>;
	}
}

export default Album;
