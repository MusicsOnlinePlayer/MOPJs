import { Row, Col, Image, ListGroup } from 'react-bootstrap';
import React from 'react';

class MusicItemRow extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<tr className={'w-100 mx-0 p-1 '}>
				<td className="align-middle" onClick={this.props.onClick} style={{ width: '50px' }}>
					<Image
						className="PlayerImage my-auto"
						rounded
						height="50em"
						src={this.props.Music.Image ? 'data:image/jpeg;base64,' + this.props.Music.Image.toString('base64') : '/Ressources/noMusic.jpg'}
					/>
				</td>
				<td className="align-middle" style={{ maxHeight: '50em' }} onClick={this.props.onClick}>
					<p>{this.props.Music.Title}</p>
				</td>
				<td className="align-middle" onClick={this.props.onClick}>
					<p className="text-middle">{this.props.Music.Artist}</p>
				</td>

				{this.props.children}
			</tr>
		);
	}
}

export default MusicItemRow;
