import QueryString from 'query-string';
import Axios from 'axios';
import { connect } from 'react-redux';
import { RequestSearch, ReceiveMusics, ReceiveAlbums, ReceiveArtists, FailSearch } from '../../Actions/Action';
import React from 'react';
import MusicContainer from '../MusicContainers/MusicContainer';

const mapStateToProps = (state) => {
	return { IsFetching: state.MusicSearchReducer.IsFetching, SearchQuery: state.MusicSearchReducer.SearchQuery };
};

function mapDispatchToProps(dispatch) {
	return {
		RequestSearch: (Search) => dispatch(RequestSearch(Search)),
		ReceiveMusics: (SearchResults) => dispatch(ReceiveMusics(SearchResults)),
		ReceiveAlbums: (SearchResults) => dispatch(ReceiveAlbums(SearchResults)),
		ReceiveArtists: (SearchResults) => dispatch(ReceiveArtists(SearchResults)),
		FailSearch: (err) => dispatch(FailSearch(err)),
	};
}

class SearchPageConnected extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		return <MusicContainer />;
	}

	ApiSearch = () => {
		const values = QueryString.parse(this.props.location.search);

		if (!this.props.IsFetching && values.q != this.props.SearchQuery) {
			this.props.RequestSearch(values.q);

			Axios.get('/Music/Search/Music/Name/' + values.q + '*')
				.then((res) => {
					this.props.ReceiveMusics(res.data);
				})
				.catch((res) => {
					this.props.FailSearch(res.message);
				});

			Axios.get('/Music/Search/Album/Name/' + values.q + '*')
				.then((res) => {
					this.props.ReceiveAlbums(res.data);
				})
				.catch((res) => {
					this.props.FailSearch(res.message);
				});

			Axios.get('/Music/Search/Artist/Name/' + values.q + '*')
				.then((res) => {
					this.props.ReceiveArtists(res.data);
				})
				.catch((res) => {
					this.props.FailSearch(res.message);
				});
		}
	};

	componentDidMount = () => {
		this.ApiSearch();
	};

	componentDidUpdate = () => {
		this.ApiSearch();
	};
}

const SearchPage = connect(mapStateToProps, mapDispatchToProps)(SearchPageConnected);

export default SearchPage;
