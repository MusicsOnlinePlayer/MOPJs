import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import MusicGroup from './Groups/MusicGroup';
import { OWN_PLAYLIST_CONTEXT, PLAYLIST_CONTEXT } from '../../Constants/MusicsConstants';

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
			PlaylistId: '',
			CreatorName: '',
			OwnPlaylist: false,
		};
	}

	componentDidMount = () => {
		const { match } = this.props;

		Axios.get(`/Music/Playlist/id/${match.params.id}`).then((res) => {
			this.setState({
				MusicsId: res.data.MusicsId.map((music) => music._id),
				PlaylistName: res.data.Name,
				PlaylistId: res.data._id,
				CreatorName: res.data.Creator.username,
				OwnPlaylist: res.data.HasControl,
			});
		});
	};

	render() {
		const {
			MusicsId,
			PlaylistName,
			CreatorName,
			OwnPlaylist,
			PlaylistId,
		} = this.state;

		if (MusicsId) {
			return (
				<MusicGroup
					MusicIds={MusicsId}
					DetailType={`${PlaylistName} by ${CreatorName}`}
					ContextType={OwnPlaylist ? OWN_PLAYLIST_CONTEXT : PLAYLIST_CONTEXT}
					ContextPlaylistId={PlaylistId}
				/>
			);
		}

		return <></>;
	}
}

export default UserPlaylist;
