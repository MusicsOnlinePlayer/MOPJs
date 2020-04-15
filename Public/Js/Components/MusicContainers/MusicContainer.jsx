import MusicElement from './MusicElement';
import { connect } from 'react-redux';
import { Spinner, Container, Row, ListGroup } from 'react-bootstrap';
import React from 'react';

const mapStateToProps = (state) => {
	return {
		SearchResults: state.MusicSearchReducer.SearchResults.Musics,
		IsFetching: state.MusicSearchReducer.IsFetching,
	};
};

class MusicContainerConnected extends React.Component {
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
				return <MusicElement key={SearchRes} id={SearchRes} />;
			});
			return (
				<div className="m-5">
					<small className="text-muted">
						<h5>Musics</h5>
					</small>
					<table className="table table-hover">
						<tbody>{MusicsItems}</tbody>
					</table>
				</div>
			);
		} else {
			return <div />;
		}
	}
}

const MusicContainer = connect(mapStateToProps)(MusicContainerConnected);

export default MusicContainer;
