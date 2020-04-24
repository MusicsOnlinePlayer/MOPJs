import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';

const AlbumItemCard = ({
	onClick, Image, Name, Artist,
}) => (
	<Card style={{ width: '18rem' }} className="m-2" onClick={onClick}>
		<Card.Img variant="top" src={Image ? `data:image/jpeg;base64,${Image.toString('base64')}` : '/Ressources/noMusic.jpg'} />
		<Card.Body>
			<Card.Title>{Name}</Card.Title>
			<Card.Text>{Artist}</Card.Text>
		</Card.Body>
	</Card>
);

AlbumItemCard.propTypes = {
	onClick: PropTypes.func.isRequired,
	Image: PropTypes.string,
	Name: PropTypes.string,
	Artist: PropTypes.string,
};

AlbumItemCard.defaultProps = {
	Image: undefined,
	Name: 'Loading...',
	Artist: '', // TODO Pass artist
};

export default AlbumItemCard;