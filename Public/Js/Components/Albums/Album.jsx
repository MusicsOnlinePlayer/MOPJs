import React from 'react';
import Axios from 'axios';
import { Col, Row } from 'react-bootstrap';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ClearPlaylist as ClearPlaylistRedux, AddMultipleMusics as AddMultipleMusicsRedux } from '../../Actions/Action';
import MusicElement from '../Elements/MusicElement';

const mapDispatchToProps = (dispatch) => ({
	ClearPlaylist: () => {
		dispatch(ClearPlaylistRedux());
	},
	AddMusics: (Musics) => {
		dispatch(AddMultipleMusicsRedux(Musics));
	},
});

class AlbumConnected extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				id: PropTypes.string.isRequired,
			}).isRequired,
		}).isRequired,
		ClearPlaylist: PropTypes.func.isRequired,
		AddMusics: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {
			MusicsId: [],
			AlbumName: '',
			Musics: [],
		};
	}

	onDataReceived = (Music) => {
		this.setState((prev) => ({
			Musics: [...prev.Musics, Music],
		}));
	};

	componentDidMount = () => {
		const { match } = this.props;

		Axios.get(`/Music/Album/id/${match.params.id}?mode=all`).then((res) => {
			this.setState({
				MusicsId: res.data.MusicsId,
				AlbumName: res.data.Name,
			});
		});
	};

	onPlayAlbum = () => {
		const { ClearPlaylist, AddMusics } = this.props;
		const { Musics } = this.state;

		ClearPlaylist();
		AddMusics([...Musics].sort((a, b) => a.TrackNumber - b.TrackNumber));
	};

	render() {
		const { MusicsId, AlbumName } = this.state;

		const AlbumItems = MusicsId
			.map((id) => <MusicElement key={id} id={id} onDataReceived={this.onDataReceived} />);

		return (
			<div className="m-4">
				<Row className="p-1">
					<Col>
						<small className="text-muted">
							<h5>{AlbumName}</h5>
						</small>
					</Col>
					<Col className="">
						<FontAwesomeIcon onClick={this.onPlayAlbum} className="py-auto px-2" style={{ color: '#bebebe' }} icon={faPlay} size="lg" pull="right" />
					</Col>
				</Row>
				<table className="table table-hover">
					<tbody>{AlbumItems}</tbody>
				</table>
			</div>
		);
	}
}

const Album = connect(null, mapDispatchToProps)(AlbumConnected);

export default Album;
