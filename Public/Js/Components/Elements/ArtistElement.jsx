import React from 'react';
import { withRouter } from 'react-router-dom';
import Axios from 'axios';
import PropTypes from 'prop-types';
import ArtistItemCard from '../Items/ArtistItemCard';

class ArtistElement extends React.Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
		history: PropTypes.shape({
			push: PropTypes.func.isRequired,
		}).isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {
			ApiResult: '',
		};
	}

	componentDidMount = () => {
		const { id } = this.props;
		Axios.get(`/Music/Artist/id/${id}`).then((res) => {
			this.setState({
				ApiResult: res.data,
			});
		});
	}

	onCardClick = () => {
		const { ApiResult } = this.state;
		const { history } = this.props;
		if (ApiResult) history.push(`/Artist/${ApiResult._id}`);
	}

	render() {
		const { ApiResult } = this.state;
		return <ArtistItemCard Name={ApiResult ? ApiResult.Name : 'Loading...'} ImagePath={ApiResult ? ApiResult.ImagePath : '/Ressources/noMusic.jpg'} onClick={this.onCardClick} />;
	}
}

export default withRouter(ArtistElement);
