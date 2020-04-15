import React from 'react';
import { ChangePlayingMusic, AddMusic } from '../../Actions/Action';
import { connect } from 'react-redux';
import Axios from 'axios';
import MusicItemRow from './MusicItemRow';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const mapDispatchToProps = (dispatch) => {
	return {
		ChangePlayingMusic: (Music) => {
			dispatch(ChangePlayingMusic(Music));
		},
		AddMusic: (Music) => {
			dispatch(AddMusic(Music));
		},
	};
};

class MusicElementConnected extends React.Component {
	//TODO Add react viz for progressive loading
	constructor(props) {
		super(props);
		this.state = {
			ApiResult: '',
		};
	}

	onClick = () => {
		this.props.ChangePlayingMusic({
			Title: this.state.ApiResult.Title,
			Artist: this.state.ApiResult.Artist,
			Album: this.state.ApiResult.Album,
			Image: this.state.ApiResult.Image,
			FilePath: this.state.ApiResult.FilePath,
			id: this.state.ApiResult._id,
		});
	};

	render() {
		return (
			<MusicItemRow Music={this.state.ApiResult} onClick={this.onClick}>
				<td className="align-middle" onClick={this.HandleAdd}>
					<FontAwesomeIcon style={{ color: '#bebebe' }} icon={faPlus} size="lg" pull="right" />
				</td>
			</MusicItemRow>
		);
	}

	HandleAdd = () => {
		this.props.AddMusic({
			Title: this.state.ApiResult.Title,
			Artist: this.state.ApiResult.Artist,
			Album: this.state.ApiResult.Album,
			Image: this.state.ApiResult.Image,
			FilePath: this.state.ApiResult.FilePath,
			id: this.state.ApiResult._id,
		});
	};

	componentWillMount = () => {
		Axios.get('/Music/Music/id/' + this.props.id).then((res) => {
			this.setState({
				ApiResult: res.data,
			});
		});
	};
}

const MusicElement = connect(null, mapDispatchToProps)(MusicElementConnected);

export default MusicElement;
