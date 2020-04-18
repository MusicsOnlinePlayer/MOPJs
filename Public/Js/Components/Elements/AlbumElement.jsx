import React from 'react';
import { connect } from 'react-redux';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChangePlayingMusic, AddMusic } from '../../Actions/Action';
import AlbumItemCard from '../Items/AlbumItemCard';

const mapDispatchToProps = (dispatch) => ({
	ChangePlayingMusic: (Music) => {
		dispatch(ChangePlayingMusic(Music));
	},
	AddMusic: (Music) => {
		dispatch(AddMusic(Music));
	},
});

class AlbumElementConnected extends React.Component {
	static propTypes = {
		history: PropTypes.shape({
			push: PropTypes.func.isRequired,
		}).isRequired,
		id: PropTypes.string.isRequired,
	}

	// TODO Add react viz for progressive loading
	constructor(props) {
		super(props);
		this.state = {
			ApiResult: '',
		};
	}

	onClick = () => {
		const { ApiResult } = this.state;
		const { history } = this.props;
		if (ApiResult) history.push(`/Album/${ApiResult._id}`);
	};

	componentDidMount = () => {
		const { id } = this.props;
		Axios.get(`/Music/Album/id/${id}`).then((res) => {
			this.setState({
				ApiResult: res.data,
			});
		});
	};

	render() {
		const { ApiResult } = this.state;
		const { Image, Name } = ApiResult;
		return (
			<AlbumItemCard Image={Image} Name={Name} onClick={this.onClick}>
				<td className="align-middle" onClick={this.HandleAdd}>
					<FontAwesomeIcon style={{ color: '#bebebe' }} icon={faPlus} size="lg" pull="right" />
				</td>
			</AlbumItemCard>
		);
	}
}

const AlbumElement = connect(null, mapDispatchToProps)(AlbumElementConnected);

export default withRouter(AlbumElement);
