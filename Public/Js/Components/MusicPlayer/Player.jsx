import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Col, Image, Navbar, Row, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import Playlist from './Playlist';
import { ChangePlayingId } from '../../Actions/Action';

const mapStateToProps = (state) => {
	return {
		PlayingMusic: state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId],
		NextMusic: state.MusicPlayerReducer.Playlist.Musics[state.MusicPlayerReducer.Playlist.PlayingId + 1],
		CurrentMusicId: state.MusicPlayerReducer.Playlist.PlayingId,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		ChangePlayingId: (id) => {
			dispatch(ChangePlayingId(id));
		},
	};
};

class PlayerConnected extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			IsPlaying: true,
			SliderValue: 0,
			Counter: false,
		};

		// this.refreshPlayer = setInterval(() => {
		// 	this.setState((prev) => ({
		// 		Counter: !prev.Counter,
		// 	}));
		// }, 10);
	}

	render() {
		let PlayingIcon = !this.state.IsPlaying ? faPlay : faPause;

		document.title = (this.props.PlayingMusic ? this.props.PlayingMusic.Title : '') + ' MOP Js Edition';

		if (this.props.PlayingMusic) {
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
									max={this.player ? (this.player.duration ? this.player.duration : 0) : 0}
								/>

								<Image
									className="PlayerImage my-auto"
									height="75em"
									rounded
									src={this.props.PlayingMusic.Image ? 'data:image/jpeg;base64,' + this.props.PlayingMusic.Image.toString('base64') : '/Ressources/noMusic.jpg'}
								/>
								<Col className="my-1 col-md-auto">
									<h6>{this.props.PlayingMusic.Title}</h6>
									<p>
										{this.props.PlayingMusic.Album} - {this.props.PlayingMusic.Artist}
									</p>
								</Col>
								<div className="my-auto ml-auto mr-1" onClick={this.HandlePlay}>
									<FontAwesomeIcon style={{ color: '#bebebe' }} icon={PlayingIcon} size="lg" pull="right" />
								</div>

								<Button variant="light" className="my-auto ml-1" onClick={this.HandleOpenPlaylist}>
									{this.props.NextMusic ? 'Next: ' + this.props.NextMusic.Title : 'Queue'}
								</Button>
							</Row>

							<audio ref={(ref) => (this.player = ref)} src={this.props.PlayingMusic.FilePath} onTimeUpdate={this.HandleTimeUpdate} onEnded={this.OnPlayerEnd} />
							{/*<ReactHowler preload={true} onEnd={this.OnPlayerEnd} playing={this.state.IsPlaying} src={this.props.PlayingMusic.FilePath} ref={(ref) => (this.player = ref)} />
							 */}
						</div>
					</Navbar>
				</>
			);
		} else {
			return <div></div>;
		}
	}

	HandleOpenPlaylist = () => {
		this.props.history.push('/Playlist/Current');
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
		if (this.player) {
			this.state.IsPlaying ? this.player.play() : this.player.pause();
		}
	};

	OnPlayerEnd = () => {
		this.props.NextMusic ? this.props.ChangePlayingId(this.props.CurrentMusicId + 1) : this.setState({ IsPlaying: false });
	};
}

const Player = connect(mapStateToProps, mapDispatchToProps)(PlayerConnected);

export default Player;
