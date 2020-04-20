import React from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import AlbumElement from '../Elements/AlbumElement';


class Artist extends React.Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				id: PropTypes.string.isRequired,
			}).isRequired,
		}).isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {
			ArtistName: '',
			AlbumsId: [],
		};
	}

	componentDidMount = () => {
		const { match } = this.props;
		Axios.get(`/Music/Artist/id/${match.params.id}`).then((res) => {
			this.setState({
				ArtistName: res.data.Name,
				AlbumsId: res.data.AlbumsId,
			});
		});
	}


	render() {
		const { ArtistName, AlbumsId } = this.state;
		const Albums = AlbumsId
			.map((id) => <AlbumElement key={id} id={id} />);
		return (
			<div className="m-4">
				<Row className="p-1">
					<Col>
						<small className="text-muted">
							<h5>{ArtistName}</h5>
						</small>
					</Col>
				</Row>
				<div className="card-deck">
					{Albums}
				</div>
			</div>
		);
	}
}

export default Artist;
