import React from 'react';
import { Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import ArtistElement from '../../Elements/ArtistElement';

class ArtistGroup extends React.Component {
	static propTypes = {
		ArtistIds: PropTypes.arrayOf(PropTypes.string).isRequired,
		DetailType: PropTypes.string.isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {

		};
	}

	render() {
		const { ArtistIds, DetailType } = this.props;

		const ArtistItems = ArtistIds
			.map((id) => <ArtistElement key={id} id={id} />);

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
					{ArtistItems}
				</div>
			</div>
		);
	}
}

export default ArtistGroup;
