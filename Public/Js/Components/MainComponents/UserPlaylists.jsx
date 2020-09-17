import React from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';
import UserPlaylistGroup from './Groups/UserPlaylistGroup';


class UserPlaylists extends React.Component {
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
			CreatorName: '',
			PlaylistsId: [],
		};
	}

	componentDidMount = () => {
		const { match } = this.props;
		Axios.get(`/User/${match.params.id}/Playlists`).then((res) => {
			this.setState({
				CreatorName: res.data.Creator.username,
				PlaylistsId: res.data.PlaylistsId,
			});
		});
	}


	render() {
		const { CreatorName, PlaylistsId } = this.state;

		return <UserPlaylistGroup PlaylistsId={PlaylistsId} DetailType={`Playlists of ${CreatorName}`} />;
	}
}

export default UserPlaylists;
