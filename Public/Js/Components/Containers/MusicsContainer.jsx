import { connect } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import React from 'react';
import PropTypes from 'prop-types';
import MusicElement from '../Elements/MusicElement';

const mapStateToProps = (state) => ({
	SearchResults: state.MusicSearchReducer.SearchResults.Musics,
	IsFetching: state.MusicSearchReducer.IsFetching,
});

class MusicsContainerConnected extends React.Component {
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
				<Spinner animation="border" role="status" size="lg" className="mx-auto">
					<span className="sr-only">Loading...</span>
				</Spinner>
			);
		} if (SearchResults) {
			const MusicsItems = SearchResults
				.map((SearchRes) => <MusicElement key={SearchRes} id={SearchRes} />);
			return (
				<div className="m-4">
					{/* style={{ borderRadius: '10px', background: '#ededed' }} */}
					<small className="text-muted">
						<h5>Musics</h5>
					</small>
					<table className="table table-hover">
						<tbody>{MusicsItems}</tbody>
					</table>
				</div>
			);
		}
		return <div />;
	}
}

const MusicsContainer = connect(mapStateToProps)(MusicsContainerConnected);

export default MusicsContainer;
