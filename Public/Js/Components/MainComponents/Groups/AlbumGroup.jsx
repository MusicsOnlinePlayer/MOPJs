import React from 'react';
import { Col, Row, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import AlbumElement from '../../Elements/AlbumElement';

class AlbumGroup extends React.Component {
	static propTypes = {
		Albums: PropTypes.arrayOf(PropTypes.any).isRequired,
		DetailType: PropTypes.string.isRequired,
		IsFetching: PropTypes.bool,
	}

	static defaultProps = {
		IsFetching: false,
	}

	constructor(props) {
		super(props);
		this.state = {

		};
	}

	render() {
		const { Albums, DetailType, IsFetching } = this.props;

		const AlbumItems = Albums
			.map((Album) => <AlbumElement key={Album._id} Album={Album} />);

		// TODO add empty graphic here

		if (IsFetching) {
			return (
				<div className="m-5">
					<small className="text-muted">
						<h5>Albums</h5>
					</small>
					<Spinner animation="border" role="status" size="lg">
						<span className="sr-only">Loading...</span>
					</Spinner>
				</div>
			);
		}

		return (
			<div className="m-4">
				<Row className="p-1">
					<Col>
						<small className="text-muted">
							<h5>{DetailType}</h5>
						</small>
					</Col>
				</Row>
				<div className="card-deck">
					{AlbumItems}
				</div>
			</div>
		);
	}
}

export default AlbumGroup;
