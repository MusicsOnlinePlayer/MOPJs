import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import ArtistElement from '../Elements/ArtistElement';

const mapStateToProps = (state) => ({
	SearchResults: state.MusicSearchReducer.SearchResults.Artists,
	IsFetching: state.MusicSearchReducer.IsFetching,
});

class ArtistsContainerConnected extends React.Component {
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
					<small className="text-muted">
						<h5>Artists</h5>
					</small>
					<Spinner animation="border" role="status" size="lg">
						<span className="sr-only">Loading...</span>
					</Spinner>
				</div>
			);
		} if (SearchResults.length > 0) {
			const ArtistsElements = SearchResults
				.map((SearchRes) => <ArtistElement key={SearchRes} id={SearchRes} />);
			return (
				<div className="m-4">
					<small className="text-muted">
						<h5>Artists</h5>
					</small>
					<div className="card-deck">{ArtistsElements}</div>
				</div>
			);
		}
		return <div />;
	}
}

const ArtistsContainer = connect(mapStateToProps)(ArtistsContainerConnected);

export default ArtistsContainer;
