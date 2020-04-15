import React from 'react';
import { connect } from 'react-redux';
import PlaylistItem from './PlaylistItem';
import { ChangePlayingId } from '../../Actions/Action';
import { ListGroup } from 'react-bootstrap';

const mapStateToProps = (state) => {
	return {
		Musics: state.MusicPlayerReducer.Playlist.Musics,
		CurrentPlaying: state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId],
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		ChangePlayingId: (id) => {
			dispatch(ChangePlayingId(id));
		},
	};
};

class PlaylistConnected extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		let PlaylistItems = this.props.Musics.map((Music) => {
			return (
				<PlaylistItem
					key={this.props.Musics.indexOf(Music)}
					ChangePlayingId={this.HandlePlaylistItemClick}
					Music={Music}
					IsThisPlaying={this.props.CurrentPlaying.id == Music.id}
					PlaylistId={this.props.Musics.indexOf(Music)}
				/>
			);
		});

		return (
			<div className="m-5">
				<small className="text-muted">
					<h5>Current Playlist</h5>
				</small>
				<table className="table table-hover">
					<tbody>{PlaylistItems}</tbody>
				</table>
			</div>
		);
	}

	HandlePlaylistItemClick = (id) => {
		this.props.ChangePlayingId(id);
	};
}

const Playlist = connect(mapStateToProps, mapDispatchToProps)(PlaylistConnected);

export default Playlist;
