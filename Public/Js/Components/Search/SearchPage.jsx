import QueryString from 'query-string';
import Axios from 'axios';
import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import {
	RequestSearch as RequestSearchRedux,
	ReceiveMusics as ReceiveMusicsRedux,
	ReceiveAlbums as ReceiveAlbumsRedux,
	ReceiveArtists as ReceiveArtistsRedux,
	FailSearch as FailSearchRedux,
} from '../../Actions/Action';
import MusicsContainer from '../Containers/MusicsContainer';
import AlbumsContainer from '../Containers/AlbumsContainer';
import ArtistsContainer from '../Containers/ArtistsContainer';

const mapStateToProps = (state) => ({
	IsFetching: state.MusicSearchReducer.IsFetching,
	SearchQuery: state.MusicSearchReducer.SearchQuery,
});

function mapDispatchToProps(dispatch) {
	return {
		RequestSearch: (Search) => dispatch(RequestSearchRedux(Search)),
		ReceiveMusics: (SearchResults) => dispatch(ReceiveMusicsRedux(SearchResults)),
		ReceiveAlbums: (SearchResults) => dispatch(ReceiveAlbumsRedux(SearchResults)),
		ReceiveArtists: (SearchResults) => dispatch(ReceiveArtistsRedux(SearchResults)),
		FailSearch: (err) => dispatch(FailSearchRedux(err)),
	};
}

class SearchPageConnected extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			search: PropTypes.string.isRequired,
		}).isRequired,
		IsFetching: PropTypes.bool.isRequired,
		SearchQuery: PropTypes.string.isRequired,
		ReceiveAlbums: PropTypes.func.isRequired,
		ReceiveMusics: PropTypes.func.isRequired,
		ReceiveArtists: PropTypes.func.isRequired,
		RequestSearch: PropTypes.func.isRequired,
		FailSearch: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {};
	}


	ApiSearch = () => {
		const {
			location,
			IsFetching,
			SearchQuery,
			ReceiveAlbums,
			ReceiveMusics,
			ReceiveArtists,
			RequestSearch,
			FailSearch,
		} = this.props;

		const values = QueryString.parse(location.search);

		if (!IsFetching && values.q !== SearchQuery) {
			RequestSearch(values.q);

			Axios.get(`/Music/Search/Music/Name/${values.q}`)
				.then((res) => {
					ReceiveMusics(res.data);
					Axios.get(`/Music/Search/Album/Name/${values.q}`)
						.then((res2) => {
							ReceiveAlbums(res2.data);
							Axios.get(`/Music/Search/Artist/Name/${values.q}`)
								.then((res3) => {
									ReceiveArtists(res3.data);
								})
								.catch((err3) => {
									FailSearch(err3.message);
								});
						})
						.catch((err2) => {
							FailSearch(err2.message);
						});
				})
				.catch((err) => {
					FailSearch(err.message);
				});
		}
	};

	componentDidMount = () => {
		this.ApiSearch();
	};

	componentDidUpdate = () => {
		this.ApiSearch();
	};

	render() {
		return (
			<div>
				<MusicsContainer />
				<AlbumsContainer />
				<ArtistsContainer />
			</div>
		);
	}
}

const SearchPage = connect(mapStateToProps, mapDispatchToProps)(SearchPageConnected);

export default SearchPage;
