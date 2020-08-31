import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import LazyLoad from 'react-lazyload';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import AlbumItemCard from '../Items/AlbumItemCard';


class AlbumElement extends React.Component {
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
					MoreOptions
				>
					<Dropdown.Item>Play</Dropdown.Item>
					{/* //TODO Implement this */ }
					<Dropdown.Item>Add to current playlist</Dropdown.Item>
					{/* //TODO Implement this */ }
				</AlbumItemCard>
			</LazyLoad>

		);
	}
}

export default withRouter(AlbumElement);
