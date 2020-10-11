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
			AlbumId: PropTypes.shape({
				Image: PropTypes.string,
				ImagePathDeezer: PropTypes.string,
			}),
		}).isRequired,
	}

	onPlaylistClick = () => {
		const { ChangePlayingId, PlaylistId } = this.props;
		ChangePlayingId(PlaylistId);
	};

	render() {
		const { Music } = this.props;
		const {
			AlbumId, Title, Artist,
		} = Music;
		return (
			<MusicItemRow
				Image={AlbumId.Image || undefined}
				ImageDz={AlbumId.ImagePathDeezer || undefined}
				Title={Title}
				Artist={Artist}
				onClick={this.onPlaylistClick}
				isAvailable
			/>
		);
	}
}

export default PlaylistElement;
