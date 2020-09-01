import React from 'react';
import { connect } from 'react-redux';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import MusicItemRow from '../Items/MusicItemRow';
import { ChangePlayingMusic as ChangePlayingMusicRedux, AddMusic as AddMusicRedux } from '../../Actions/Action';
import LikeButton from '../Helper/LikeButton';
import AddToPlaylistModal from '../Helper/AddToPlaylistModal';

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
			ShowAddToPlaylistModal: false,
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

	ShowAddToPlaylistModal = () => {
		this.setState({
			ShowAddToPlaylistModal: true,
		});
	}

	CloseAddToPlaylistModal = () => {
		this.setState({
			ShowAddToPlaylistModal: false,
		});
	}

	render() {
		const { ApiResult, ShowAddToPlaylistModal } = this.state;
		const isAvailable = ApiResult ? ApiResult.FilePath !== undefined : true;

		const LikeButtonAccessory = (
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
		);


		return (
			<>
				{ShowAddToPlaylistModal
					&& <AddToPlaylistModal Music={ApiResult} OnClose={this.CloseAddToPlaylistModal} />}
				<MusicItemRow
					Image={ApiResult ? ApiResult.Image : undefined}
					ImageDz={ApiResult ? ApiResult.ImagePathDeezer : undefined}
					Title={ApiResult ? ApiResult.Title : 'Loading...'}
					Artist={ApiResult ? ApiResult.Artist : 'Loading...'}
					onClick={this.onClick}
					isAvailable={isAvailable}
					AccessoryRight={LikeButtonAccessory}
				>
					<Dropdown.Item onClick={this.onClick}>Play</Dropdown.Item>
					<Dropdown.Item onClick={this.HandleAdd}>Add to current playlist</Dropdown.Item>
					<Dropdown.Item onClick={this.ShowAddToPlaylistModal}>Add to playlist</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item onClick={this.HandleLike}>Like</Dropdown.Item>
				</MusicItemRow>

			</>
		);
	}
}

const MusicElement = connect(null, mapDispatchToProps)(MusicElementConnected);

export default MusicElement;
