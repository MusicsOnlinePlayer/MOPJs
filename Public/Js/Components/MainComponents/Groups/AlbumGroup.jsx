import React from 'react';
import { Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import AlbumElement from '../../Elements/AlbumElement';

class AlbumGroup extends React.Component {
	static propTypes = {
		AlbumIds: PropTypes.arrayOf(PropTypes.string).isRequired,
		DetailType: PropTypes.string.isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {

		};
	}

	render() {
		const { AlbumIds, DetailType } = this.props;

		const AlbumItems = AlbumIds
			.map((id) => <AlbumElement key={id} id={id} />);

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
