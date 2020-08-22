import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import MusicGroup from './Groups/MusicGroup';

class UserPlaylist extends React.Component {
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
			MusicsId: undefined,
			PlaylistName: '',
			CreatorName: '',
		};
	}

	componentDidMount = () => {
		const { match } = this.props;

		Axios.get(`/Music/Playlist/id/${match.params.id}`).then((res) => {
			this.setState({
				MusicsId: res.data.MusicsId.map((music) => music._id),
				PlaylistName: res.data.Name,
				CreatorName: res.data.Creator.username,
			});
		});
	};

	render() {
		const { MusicsId, PlaylistName, CreatorName } = this.state;

		if (MusicsId) {
			return <MusicGroup MusicIds={MusicsId} DetailType={`${PlaylistName} by ${CreatorName}`} />;
		}

		return <></>;
	}
}

export default UserPlaylist;
