import React from 'react';
import { connect } from 'react-redux';
import Axios from 'axios';
import PropTypes from 'prop-types';
import LazyLoad from 'react-lazyload';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import MusicItemRow from '../Items/MusicItemRow';
import { ChangePlayingMusic as ChangePlayingMusicRedux, AddMusic as AddMusicRedux } from '../../Actions/Action';
import ButtonIcon from '../Helper/ButtonIcon';
import LikeButton from '../Helper/LikeButton';


const mapDispatchToProps = (dispatch) => ({
	ChangePlayingMusic: (Music) => {
		dispatch(ChangePlayingMusicRedux(Music));
	},
	AddMusic: (Music) => {
		dispatch(AddMusicRedux(Music));
	},
});

class MusicElementConnected extends React.Component {
	// TODO Add react viz for progressive loading
	static propTypes = {
		ChangePlayingMusic: PropTypes.func.isRequired,
		AddMusic: PropTypes.func.isRequired,
		id: PropTypes.string.isRequired,
		onDataReceived: PropTypes.func,
	}

	static defaultProps = {
		onDataReceived: () => { },
	}

	constructor(props) {
		super(props);
		this.state = {
			ApiResult: '',
		};
	}

	onClick = () => {
		const { ApiResult } = this.state;
		const { ChangePlayingMusic } = this.props;

		ChangePlayingMusic(ApiResult);
	};


	HandleAdd = () => {
		const { ApiResult } = this.state;
		const { AddMusic } = this.props;

		AddMusic(ApiResult);
	};

	HandleLike = () => {
		const { id } = this.props;

		Axios.get(`/Music/Music/Like/${id}`).then(() => {});
	}

	componentWillUnmount = () => {
		this.setState = () => {

		};
	}

	componentDidMount = () => {
		const { id, onDataReceived } = this.props;

		Axios.get(`/Music/Music/id/${id}`).then((res) => {
			this.setState({
				ApiResult: res.data,
			});
			onDataReceived(res.data);
		});
	};

	render() {
		const { ApiResult } = this.state;
		const isAvailable = ApiResult ? ApiResult.FilePath !== undefined : true;

		return (
			<LazyLoad>
				<MusicItemRow
					Image={ApiResult ? ApiResult.Image : undefined}
					ImageDz={ApiResult ? ApiResult.ImagePathDeezer : undefined}
					Title={ApiResult ? ApiResult.Title : 'Loading...'}
					Artist={ApiResult ? ApiResult.Artist : 'Loading...'}
					onClick={this.onClick}
					isAvailable={isAvailable}
				>
					<td className="align-middle">
						{
							ApiResult
								? (
									<LikeButton
										onLike={this.HandleLike}
										defaultLikeState={ApiResult ? ApiResult.IsLiked : undefined}
									/>
								)
								: undefined
						}

					</td>
					<td className="align-middle" style={{ width: '24px' }}>
						{
							ApiResult
								? (
									<ButtonIcon faIcon={faPlus} onClick={this.HandleAdd} buttonClass="float-right" />
								)
								: undefined
						}
					</td>
				</MusicItemRow>

			</LazyLoad>
		);
	}
}

const MusicElement = connect(null, mapDispatchToProps)(MusicElementConnected);

export default MusicElement;
