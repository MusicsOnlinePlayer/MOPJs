import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import LazyLoad from 'react-lazyload';
import { withRouter } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AlbumItemCard from '../Items/AlbumItemCard';


class UserPlaylistElement extends React.Component {
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
		if (ApiResult) history.push(`/Playlist/${ApiResult._id}`);
	};

	componentDidMount = () => {
		const { id } = this.props;
		Axios.get(`/Music/Playlist/id/${id}`).then((res) => {
			this.setState({
				ApiResult: res.data,
			});
		});
	};

	componentWillUnmount = () => {
		this.setState = () => {

		};
	}

	render() {
		const { ApiResult } = this.state;
		const {
			Image, Name, ImageFormat, ImagePathDeezer,
		} = ApiResult;
		return (
			<LazyLoad>
				<AlbumItemCard
					Image={Image}
					ImageFormat={ImageFormat}
					ImageDz={ImagePathDeezer}
					Name={Name}
					onClick={this.onClick}
				>
					<td className="align-middle" onClick={this.HandleAdd}>
						<FontAwesomeIcon style={{ color: '#bebebe' }} icon={faPlus} size="lg" pull="right" />
					</td>
				</AlbumItemCard>

			</LazyLoad>

		);
	}
}

export default withRouter(UserPlaylistElement);
