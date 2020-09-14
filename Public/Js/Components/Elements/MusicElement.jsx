import React from 'react';
import { connect } from 'react-redux';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import MusicItemRow from '../Items/MusicItemRow';
import { ChangePlayingMusic as ChangePlayingMusicRedux, AddMusic as AddMusicRedux } from '../../Actions/Action';
import LikeButton from '../Helper/LikeButton';
import AddToPlaylistModal from '../Helper/AddToPlaylistModal';
import { OWN_PLAYLIST_CONTEXT } from '../../Constants/MusicsConstants';
import PlaylistCreateModal from '../Helper/PlaylistCreateModal';

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
		history: PropTypes.shape({ go: PropTypes.func }).isRequired,
		ChangePlayingMusic: PropTypes.func.isRequired,
		AddMusic: PropTypes.func.isRequired,
		id: PropTypes.string.isRequired,
		onDataReceived: PropTypes.func,
		ContextType: PropTypes.string.isRequired,
		ContextPlaylistId: PropTypes.string,
	}

	static defaultProps = {
		ContextPlaylistId: undefined,
	}

	static defaultProps = {
		onDataReceived: () => { },
	}

	constructor(props) {
		super(props);
		this.state = {
			ApiResult: '',
			ShowAddToPlaylistModal: false,
			ShowAddToNewPlaylistModal: false,
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

	ShowAddToNewPlaylistModal = () => {
		this.setState({
			ShowAddToNewPlaylistModal: true,
		});
	}

	CloseAddToPlaylistModal = () => {
		this.setState({
			ShowAddToPlaylistModal: false,
		});
	}

	CloseAddToNewPlaylistModal = () => {
		this.setState({
			ShowAddToNewPlaylistModal: false,
		});
	}

	HandleDeletePlaylistMusic = () => {
		const { ContextPlaylistId, id, history } = this.props;
		Axios.delete(`/Music/Playlist/id/${ContextPlaylistId}/Remove/`, {
			data: { MusicId: id },
		}).then(() => history.go(0));
	}

	render() {
		const { ApiResult, ShowAddToPlaylistModal, ShowAddToNewPlaylistModal } = this.state;
		const { ContextType, id } = this.props;
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
				{ShowAddToNewPlaylistModal
					&& <PlaylistCreateModal MusicsId={[id]} OnClose={this.CloseAddToNewPlaylistModal} />}

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
					<Dropdown.Item onClick={this.ShowAddToNewPlaylistModal}>Add to a new playlist</Dropdown.Item>
					<Dropdown.Divider />
					<Dropdown.Item onClick={this.HandleLike}>Like</Dropdown.Item>
					{ContextType === OWN_PLAYLIST_CONTEXT && (
						<>
							<Dropdown.Divider />
							<Dropdown.Item onClick={this.HandleDeletePlaylistMusic}>Delete</Dropdown.Item>
						</>
					)}
				</MusicItemRow>

			</>
		);
	}
}

const MusicElement = connect(null, mapDispatchToProps)(MusicElementConnected);

export default withRouter(MusicElement);
