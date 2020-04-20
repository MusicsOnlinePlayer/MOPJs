import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PlaylistElement from '../Elements/PlaylistElement';
import { ChangePlayingId as ChangePlayingIdRedux } from '../../Actions/Action';

const mapStateToProps = (state) => ({
	Musics: state.MusicPlayerReducer.Playlist.Musics,
	CurrentPlaying:
		state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId],
});

const mapDispatchToProps = (dispatch) => ({
	ChangePlayingId: (id) => {
		dispatch(ChangePlayingIdRedux(id));
	},
});

class PlaylistContainerConnected extends React.Component {
	static propTypes = {
		ChangePlayingId: PropTypes.func.isRequired,
		Musics: PropTypes.array.isRequired,
		CurrentPlaying: PropTypes.shape({
			id: PropTypes.string,
		}).isRequired,
	}

	HandlePlaylistItemClick = (id) => {
		const { ChangePlayingId } = this.props;
		ChangePlayingId(id);
	};

	render() {
		const { Musics, CurrentPlaying } = this.props;

		const PlaylistItems = Musics.map((Music) => (
			<PlaylistElement
				key={Musics.indexOf(Music)}
				ChangePlayingId={this.HandlePlaylistItemClick}
				Music={Music}
				IsThisPlaying={CurrentPlaying.id === Music.id}
				PlaylistId={Musics.indexOf(Music)}
			/>
		));

		return (
			<div className="m-4">
				<small className="text-muted">
					<h5>Current Playlist</h5>
				</small>
				<table className="table table-hover">
					<tbody>{PlaylistItems}</tbody>
				</table>
			</div>
		);
	}
}

const PlaylistContainer = connect(mapStateToProps, mapDispatchToProps)(PlaylistContainerConnected);

export default PlaylistContainer;
