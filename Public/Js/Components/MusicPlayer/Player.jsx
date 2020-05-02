import {
	faPlay, faPause, faStepForward, faStepBackward, faForward,
} from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import {
	Col, Image, Navbar, Row, Button,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Axios from 'axios';
import ButtonIcon from '../Helper/ButtonIcon';
import { ChangePlayingId as ChangePlayingIdRedux, AddCustomFilePath as AddCustomFilePathRedux } from '../../Actions/Action';

const mapStateToProps = (state) => ({
	PlayingMusic:
		state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId],
	NextMusic:
		state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId + 1],
	CurrentMusicId: state.MusicPlayerReducer.Playlist.PlayingId,
	PlaylistLength: state.MusicPlayerReducer.Playlist.Musics.length,
	MusicFilePath:
		state.MusicPlayerReducer.CustomFilePath ? state.MusicPlayerReducer.CustomFilePath : undefined,
});

const mapDispatchToProps = (dispatch) => ({
	ChangePlayingId: (id) => {
		dispatch(ChangePlayingIdRedux(id));
	},
	AddCustomFilePath: (path) => {
		dispatch(AddCustomFilePathRedux(path));
	},
});

class PlayerConnected extends React.Component {
	static propTypes = {
		history: PropTypes.shape({
			push: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
			location: PropTypes.shape({
				pathname: PropTypes.string.isRequired,
			}),
		}).isRequired,
		ChangePlayingId: PropTypes.func.isRequired,
		AddCustomFilePath: PropTypes.func.isRequired,
		MusicFilePath: PropTypes.string,
		PlayingMusic: PropTypes.shape({
			_id: PropTypes.string.isRequired,
			Title: PropTypes.string.isRequired,
			Image: PropTypes.string,
			Album: PropTypes.string.isRequired,
			Artist: PropTypes.string.isRequired,
			FilePath: PropTypes.string.isRequired,
			ImagePathDeezer: PropTypes.string,
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
		MusicFilePath: undefined,
	}

	constructor(props) {
		super(props);
		this.state = {
			IsPlaying: true,
		};
	}


	HandleTimeUpdate = () => {
		this.forceUpdate();
	};

	HandlePlay = () => {
		this.setState((prevState) => ({ IsPlaying: !prevState.IsPlaying }), () => {
			const { IsPlaying } = this.state;
			if (this.player) {
				IsPlaying ? this.player.play() : this.player.pause();
			}
		});
	};

	HandleNext = () => {
		const { NextMusic, ChangePlayingId, CurrentMusicId } = this.props;
		if (NextMusic) ChangePlayingId(CurrentMusicId + 1);
	}

	HandleBack = () => {
		const { ChangePlayingId, CurrentMusicId } = this.props;
		if (CurrentMusicId !== 0) ChangePlayingId(CurrentMusicId - 1);
	}

	HandleSliderChange = (event) => {
		this.player.currentTime = event.target.value;
		this.forceUpdate();
	};

	componentWillUnmount = () => {
		clearInterval(this.refreshPlayer);
	};

	componentDidMount = () => {
		const { IsPlaying } = this.state;
		if (this.player) {
			IsPlaying ? this.player.play() : this.player.pause();
		}
	}

	componentDidUpdate = (prevProps) => {
		const { PlayingMusic, MusicFilePath } = this.props;
		if (PlayingMusic) {
			if (!MusicFilePath || prevProps.PlayingMusic !== PlayingMusic) {
				this.GetNewFilePath();
			}
		}
	}

	GetNewFilePath = () => {
		const { PlayingMusic, AddCustomFilePath } = this.props;

		Axios.get(`/Music/Music/get/${PlayingMusic._id}`)
			.then((res) => {
				AddCustomFilePath(res.data.FilePath);
				// this.forceUpdate();
			});
	}


	OnPlayerEnd = () => {
		const { NextMusic, ChangePlayingId, CurrentMusicId } = this.props;
		NextMusic ? ChangePlayingId(CurrentMusicId + 1) : this.setState({ IsPlaying: false });
	};

	OnPlay = () => {
		this.setState({
			IsPlaying: true,
		});
	}

	OnPause = () => {
		this.setState({
			IsPlaying: false,
		});
	}

	GetSliderMaxValue = () => {
		if (this.player) {
			return this.player.duration ? this.player.duration : 0;
		}
		return 0;
	}


	HandleOpenPlaylist = () => {
		const { history } = this.props;
		if (history.location.pathname === '/Playlist/Current') {
			history.goBack();
		} else {
			history.push('/Playlist/Current');
		}
	};

	render() {
		const { IsPlaying } = this.state;
		const { PlayingMusic, NextMusic, MusicFilePath } = this.props;

		const PlayingIcon = !IsPlaying ? faPlay : faPause;

		document.title = `${PlayingMusic ? PlayingMusic.Title : ''} MOP Js Edition`;

		if (PlayingMusic) {
			return (
				<>
					<Navbar fixed="bottom" bg="light" className="px-2 mh-50 pt-0">
						<div className="d-flex flex-column w-100 overflow-auto">
							<Row className="w-100 mx-0 py-0">
								<input
									className="PlayerSlider mb-1"
									type="Range"
									step="0.1"
									onChange={this.HandleSliderChange}
									value={this.player ? this.player.currentTime : 0}
									max={this.GetSliderMaxValue()}
								/>
								{PlayingMusic.ImagePathDeezer ? <Image className="PlayerImage my-auto" rounded height="75em" src={PlayingMusic.ImagePathDeezer} />
									: <Image className="PlayerImage my-auto" rounded height="75em" src={PlayingMusic.Image ? `data:image/jpeg;base64,${PlayingMusic.Image.toString('base64')}` : '/Ressources/noMusic.jpg'} />}

								<Col className="my-1 mt-0 col-md-auto  text-truncate" onClick={this.HandleOpenPlaylist}>
									<h6>{PlayingMusic.Title}</h6>
									<p>
										{PlayingMusic.Artist}
									</p>
								</Col>
								<ButtonIcon buttonClass="my-auto mx-2 ml-auto p-0" iconFontSize="1.75rem" onClick={this.HandleBack} faIcon={faStepBackward} />

								<ButtonIcon buttonClass="my-auto mx-2 p-0" iconFontSize="1.75rem" onClick={this.HandlePlay} faIcon={PlayingIcon} />

								<ButtonIcon buttonClass="my-auto ml-2 p-0 mr-0" iconFontSize="1.75rem" onClick={this.HandleNext} faIcon={faStepForward} />


								<Button variant="light" className="my-auto ml-1 mt-1 d-none d-lg-block" onClick={this.HandleOpenPlaylist}>
									{NextMusic ? `Next: ${NextMusic.Title}` : 'Queue'}
								</Button>
							</Row>

							<audio
								ref={(ref) => { this.player = ref; }}
								src={MusicFilePath}
								onTimeUpdate={this.HandleTimeUpdate}
								onEnded={this.OnPlayerEnd}
								onPlay={this.OnPlay}
								onPause={this.OnPause}
								autoPlay
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
