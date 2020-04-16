import React from 'react';
import { ChangePlayingMusic, AddMusic } from '../../Actions/Action';
import { connect } from 'react-redux';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MusicItemCard from './MusicItemCard';

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
		if (this.state.ApiResult) this.props.history.push('/Album/' + this.state.ApiResult._id);
	};

	render() {
		return (
			<MusicItemCard Image={this.state.ApiResult.Image} Name={this.state.ApiResult.Name} onClick={this.onClick}>
				<td className="align-middle" onClick={this.HandleAdd}>
					<FontAwesomeIcon style={{ color: '#bebebe' }} icon={faPlus} size="lg" pull="right" />
				</td>
			</MusicItemCard>
		);
	}

	componentWillMount = () => {
		Axios.get('/Music/Album/id/' + this.props.id).then((res) => {
			this.setState({
				ApiResult: res.data,
			});
		});
	};
}

const MusicElement = connect(null, mapDispatchToProps)(MusicElementConnected);

export default withRouter(MusicElement);
