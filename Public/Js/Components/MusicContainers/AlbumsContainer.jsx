import AlbumElement from './AlbumElement';
import { connect } from 'react-redux';
import { Spinner, CardDeck, Container, CardColumns, CardGroup } from 'react-bootstrap';
import React from 'react';

const mapStateToProps = (state) => {
	return {
		SearchResults: state.MusicSearchReducer.SearchResults.Albums,
		IsFetching: state.MusicSearchReducer.IsFetching,
	};
};

class AlbumsContainerConnected extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		if (this.props.IsFetching) {
			return (
				<Spinner animation="border" role="status" size="lg" className="mx-auto">
					<span className="sr-only">Loading...</span>
				</Spinner>
			);
		} else if (this.props.SearchResults) {
			let MusicsItems = this.props.SearchResults.map((SearchRes) => {
				return <AlbumElement key={SearchRes} id={SearchRes} />;
			});
			return (
				<div className="m-4 ">
					<small className="text-muted">
						<h5>Albums</h5>
					</small>
					<div className="card-deck">{MusicsItems}</div>
				</div>
			);
		} else {
			return <div />;
		}
	}
}

const AlbumsContainer = connect(mapStateToProps)(AlbumsContainerConnected);

export default AlbumsContainer;
