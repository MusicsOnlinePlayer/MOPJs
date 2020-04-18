import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {
	Col, Image, Navbar, Row, Button,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ChangePlayingId as ChangePlayingIdRedux } from '../../Actions/Action';

const mapStateToProps = (state) => ({
	PlayingMusic:
		state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId],
	NextMusic:
		state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId + 1],
	CurrentMusicId: state.MusicPlayerReducer.Playlist.PlayingId,
});

const mapDispatchToProps = (dispatch) => ({
	ChangePlayingId: (id) => {
		dispatch(ChangePlayingIdRedux(id));
	},
});

class PlayerConnected extends React.Component {
	static propTypes = {
		history: PropTypes.shape({
			push: PropTypes.func.isRequired,
		}).isRequired,
		ChangePlayingId: PropTypes.func.isRequired,
		PlayingMusic: PropTypes.shape({
			Title: PropTypes.string.isRequired,
			Image: PropTypes.string.isRequired,
			Album: PropTypes.string.isRequired,
			Artist: PropTypes.string.isRequired,
			FilePath: PropTypes.string.isRequired,
		}),
		NextMusic: PropTypes.shape({
			Title: PropTypes.string.isRequired,
		}),
		CurrentMusicId: PropTypes.number,
	}

	static defaultProps = {
		PlayingMusic: undefined,
		NextMusic: undefined,
		CurrentMusicId: undefined,
	}

	constructor(props) {
		super(props);
		this.state = {
			IsPlaying: true,
		};
	}

	HandleOpenPlaylist = () => {
		const { history } = this.props;
		history.push('/Playlist/Current');
	};

	HandleTimeUpdate = () => {
		this.forceUpdate();
	};

	HandlePlay = () => {
		this.setState((prevState) => ({ IsPlaying: !prevState.IsPlaying }));
	};

	HandleSliderChange = (event) => {
		this.player.currentTime = event.target.value;
		this.forceUpdate();
	};

	componentWillUnmount = () => {
		clearInterval(this.refreshPlayer);
	};

	componentDidUpdate = () => {
		const { IsPlaying } = this.state;
		if (this.player) {
			IsPlaying ? this.player.play() : this.player.pause();
		}
	};

	OnPlayerEnd = () => {
		const { NextMusic, ChangePlayingId, CurrentMusicId } = this.props;
		NextMusic ? ChangePlayingId(CurrentMusicId + 1) : this.setState({ IsPlaying: false });
	};

	GetSliderMaxValue = () => {
		if (this.player) {
			return this.player.duration ? this.player.duration : 0;
		}
		return 0;
	}

	render() {
		const { IsPlaying } = this.state;
		const { PlayingMusic, NextMusic } = this.props;

		const PlayingIcon = !IsPlaying ? faPlay : faPause;

		document.title = `${PlayingMusic ? PlayingMusic.Title : ''} MOP Js Edition`;

		if (PlayingMusic) {
			return (
				<>
					<Navbar fixed="bottom" bg="light" className="px-2 mh-50">
						<div className="d-flex flex-column w-100 overflow-auto">
							<Row className="w-100 mx-0 py-0">
								<input
									className="PlayerSlider my-1"
									type="Range"
									step="0.1"
									onChange={this.HandleSliderChange}
									value={this.player ? this.player.currentTime : 0}
									max={this.GetSliderMaxValue()}
								/>

								<Image
									className="PlayerImage my-auto"
									height="75em"
									rounded
									src={PlayingMusic.Image ? `data:image/jpeg;base64,${PlayingMusic.Image.toString('base64')}` : '/Ressources/noMusic.jpg'}
								/>
								<Col className="my-1 col-md-auto">
									<h6>{PlayingMusic.Title}</h6>
									<p>
										{PlayingMusic.Album}
										{' '}
										-
										{PlayingMusic.Artist}
									</p>
								</Col>
								<div className="my-auto ml-auto mr-1" onClick={this.HandlePlay}>
									<FontAwesomeIcon style={{ color: '#bebebe' }} icon={PlayingIcon} size="lg" pull="right" />
								</div>

								<Button variant="light" className="my-auto ml-1" onClick={this.HandleOpenPlaylist}>
									{NextMusic ? `Next: ${NextMusic.Title}` : 'Queue'}
								</Button>
							</Row>

							<audio
								ref={(ref) => { this.player = ref; }}
								src={PlayingMusic.FilePath}
								onTimeUpdate={this.HandleTimeUpdate}
								onEnded={this.OnPlayerEnd}
							>
								No html5 player
							</audio>
						</div>
					</Navbar>
				</>
			);
		}
		return <div />;
	}
}

const Player = connect(mapStateToProps, mapDispatchToProps)(PlayerConnected);

export default Player;
