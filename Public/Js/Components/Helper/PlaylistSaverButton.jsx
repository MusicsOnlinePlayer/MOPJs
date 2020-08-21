import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Modal, Button, Form } from 'react-bootstrap';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import ButtonIcon from './ButtonIcon';

class PlaylistSaverButton extends React.Component {
	static propTypes = {
		MusicsId: PropTypes.arrayOf(PropTypes.string).isRequired,
		history: PropTypes.shape({ push: PropTypes.func }).isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			ShowModal: false,
		};
	}

	handleSubmit = (event) => {
		event.preventDefault();
		const { MusicsId, history } = this.props;
		const { Name, IsPublic } = event.target.elements;

		Axios.post('/Playlist/Create/', { Name, IsPublic, MusicsId })
			.then((res) => {
				history.push(`/Playlist/${res.data.CreatedPlaylistId}`);
			})
			.catch((err) => console.log(err));
	};

	closeModal = () => {
		this.setState({ ShowModal: false });
	};

	openModal = () => {
		this.setState({ ShowModal: true });
	};

	render() {
		const { ShowModal } = this.state;

		return (
			<>
				<ButtonIcon faIcon={faSave} buttonClass="float-right d-none d-lg-block" onClick={this.openModal} />

				<Modal show={ShowModal} onHide={this.closeModal}>
					<Modal.Header closeButton>
						<Modal.Title>Save playlist</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form onSubmit={this.handleSubmit}>
							<Form.Group controlId="Name">
								<Form.Label>Name</Form.Label>
								<Form.Control placeholder="Enter a playlist name" />
							</Form.Group>
							<Form.Group controlId="IsPublic">
								<Form.Check type="checkbox" label="Public" checked />
							</Form.Group>
							<Button variant="primary" type="submit">
								Save
							</Button>
						</Form>
					</Modal.Body>
				</Modal>
			</>
		);
	}
}

export default withRouter(PlaylistSaverButton);
