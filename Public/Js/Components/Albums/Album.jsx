import React from 'react';
import Axios from 'axios';
import MusicElement from '../MusicContainers/MusicElement';
import { Col, Row } from 'react-bootstrap';
import { faPlay, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ClearPlaylist, AddMultipleMusics } from '../../Actions/Action';
import { connect } from 'react-redux';

const mapDispatchToProps = (dispatch) => {
	return {
		ClearPlaylist: () => {
			dispatch(ClearPlaylist());
		},
		AddMusics: (Musics) => {
			dispatch(AddMultipleMusics(Musics));
		},
	};
};

class AlbumConnected extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			MusicsId: [],
			AlbumName: '',
			Musics: [],
		};
	}

	onDataReceived = (Music) => {
		this.setState((prev) => {
			return {
				Musics: [...prev.Musics, Music],
			};
		});
	};

	render() {
		let AlbumItems = this.state.MusicsId.map((id) => {
			return <MusicElement key={id} id={id} onDataReceived={this.onDataReceived} />;
		});

		return (
			<div className="m-5">
				<Row className="p-1">
					<Col>
						<small className="text-muted">
							<h5>{this.state.AlbumName}</h5>
						</small>
					</Col>
					<Col>
						<FontAwesomeIcon onClick={this.onPlayAlbum} className="py-auto px-2" style={{ color: '#bebebe' }} icon={faPlay} size="lg" pull="right" />
					</Col>
				</Row>
				<table className="table table-hover">
					<tbody>{AlbumItems}</tbody>
				</table>
			</div>
		);
	}

	componentDidMount = () => {
		Axios.get('/Music/Album/id/' + this.props.match.params.id).then((res) => {
			this.setState({
				MusicsId: res.data.MusicsId,
				AlbumName: res.data.Name,
			});
		});
	};

	onPlayAlbum = () => {
		this.props.ClearPlaylist();
		this.props.AddMusics([...this.state.Musics].sort((a, b) => a.TrackNumber - b.TrackNumber));
	};
}

const Album = connect(null, mapDispatchToProps)(AlbumConnected);

export default Album;
