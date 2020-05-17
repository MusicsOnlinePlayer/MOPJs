import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ClearPlaylist as ClearPlaylistRedux, AddMultipleMusics as AddMultipleMusicsRedux } from '../../../Actions/Action';
import MusicElement from '../../Elements/MusicElement';
import ButtonIcon from '../../Helper/ButtonIcon';

const mapDispatchToProps = (dispatch) => ({
	ClearPlaylist: () => {
		dispatch(ClearPlaylistRedux());
	},
	AddMusics: (Musics) => {
		dispatch(AddMultipleMusicsRedux(Musics));
	},
});

class MusicGroupConnected extends React.Component {
	static propTypes = {
		ClearPlaylist: PropTypes.func.isRequired,
		AddMusics: PropTypes.func.isRequired,
		MusicIds: PropTypes.arrayOf(PropTypes.string).isRequired,
		DetailType: PropTypes.string.isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {
			Musics: [],
		};
	}

	onDataReceived = (Music) => {
		this.setState((prev) => ({
			Musics: [...prev.Musics, Music],
		}));
	};

	onPlayAll = () => {
		const { ClearPlaylist, AddMusics } = this.props;
		const { Musics } = this.state;

		ClearPlaylist();
		AddMusics([...Musics].sort((a, b) => a.TrackNumber - b.TrackNumber));
	};

	render() {
		const { MusicIds, DetailType } = this.props;

		const MusicItems = MusicIds
			.map((id) => <MusicElement key={id} id={id} onDataReceived={this.onDataReceived} />);

		return (
			<div className="m-4">
				<Row className="p-1">
					<Col>
						<small className="text-muted">
							<h5>{DetailType}</h5>
						</small>
					</Col>
					<Col className="">
						<ButtonIcon faIcon={faPlay} onClick={this.onPlayAll} buttonClass="py-auto pr-4 float-right" />
					</Col>
				</Row>
				<table className="table table-hover">
					<tbody>{MusicItems}</tbody>
				</table>
			</div>
		);
	}
}

const MusicGroup = connect(null, mapDispatchToProps)(MusicGroupConnected);

export default MusicGroup;
