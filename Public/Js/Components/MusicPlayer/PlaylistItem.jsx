import React from 'react';
import MusicItemRow from '../MusicContainers/MusicItemRow';

class PlaylistItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	onPlaylistClick = () => {
		this.props.ChangePlayingId(this.props.PlaylistId);
	};

	render() {
		return <MusicItemRow Music={this.props.Music} onClick={this.onPlaylistClick} />;
	}
}

export default PlaylistItem;
