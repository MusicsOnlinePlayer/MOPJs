import React from 'react';
import PropTypes from 'prop-types';
import MusicItemRow from '../Items/MusicItemRow';

class PlaylistElement extends React.Component {
	static propTypes = {
		ChangePlayingId: PropTypes.func.isRequired,
		PlaylistId: PropTypes.number.isRequired,
		Music: PropTypes.shape({
			Title: PropTypes.string.isRequired,
			Artist: PropTypes.string.isRequired,
			Image: PropTypes.string,
			ImagePathDeezer: PropTypes.string,
		}).isRequired,
	}

	onPlaylistClick = () => {
		const { ChangePlayingId, PlaylistId } = this.props;
		ChangePlayingId(PlaylistId);
	};

	render() {
		const { Music } = this.props;
		const {
			Image, Title, Artist, ImagePathDeezer,
		} = Music;
		return (
			<MusicItemRow
				Image={Image || undefined}
				ImageDz={ImagePathDeezer || undefined}
				Title={Title}
				Artist={Artist}
				onClick={this.onPlaylistClick}
			/>
		);
	}
}

export default PlaylistElement;
