import React from 'react';
import { Card } from 'react-bootstrap';

class MusicItemCard extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<Card style={{ width: '18rem' }} className="m-2" onClick={this.props.onClick}>
				<Card.Img variant="top" src={this.props.Image ? 'data:image/jpeg;base64,' + this.props.Image.toString('base64') : '/Ressources/noMusic.jpg'} />
				<Card.Body>
					<Card.Title>{this.props.Name}</Card.Title>
					<Card.Text>{this.props.Artist}</Card.Text>
				</Card.Body>
			</Card>
		);
	}
}

export default MusicItemCard;
