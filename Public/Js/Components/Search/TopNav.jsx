import React from 'react';
import { Navbar, Button, FormControl, Form } from 'react-bootstrap';

export default class TopNav extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			SearchValue: '',
		};
	}

	render() {
		return (
			<Navbar bg="light" expand="lg" className="justify-content-between">
				<Navbar.Brand href="#home">Mop - Js Edition</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
					<Form inline onSubmit={this.handleSearch}>
						<FormControl type="text" placeholder="Search for musics" value={this.state.SearchValue} onChange={this.handleInputChange} className=" mr-sm-4 my-1" />
						<Button type="submit" className="my-1" variant="outline-primary">
							Search
						</Button>
					</Form>
				</Navbar.Collapse>
			</Navbar>
		);
	}

	handleSearch = () => {
		this.props.history.push('/Search?q=' + this.state.SearchValue);
	};

	handleInputChange = (event) => {
		this.setState({
			SearchValue: event.target.value,
		});
	};
}
