import { connect } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import React from 'react';
import PropTypes from 'prop-types';
import AlbumElement from '../Elements/AlbumElement';

const mapStateToProps = (state) => ({
	SearchResults: state.MusicSearchReducer.SearchResults.Albums,
	IsFetching: state.MusicSearchReducer.IsFetching,
});

class AlbumsContainerConnected extends React.Component {
	static propTypes = {
		IsFetching: PropTypes.bool.isRequired,
		SearchResults: PropTypes.array,
	}

	static defaultProps = {
		SearchResults: [],
	}

	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { IsFetching, SearchResults } = this.props;

		if (IsFetching) {
			return (
				<div className="m-5">
					<Spinner animation="border" role="status" size="lg">
						<span className="sr-only">Loading...</span>
					</Spinner>
				</div>
			);
		} if (SearchResults) {
			const MusicsItems = SearchResults
				.map((SearchRes) => <AlbumElement key={SearchRes} id={SearchRes} />);
			return (
				<div className="m-4">
					<small className="text-muted">
						<h5>Albums</h5>
					</small>
					<div className="card-deck">{MusicsItems}</div>
				</div>
			);
		}
		return <div />;
	}
}

const AlbumsContainer = connect(mapStateToProps)(AlbumsContainerConnected);

export default AlbumsContainer;
