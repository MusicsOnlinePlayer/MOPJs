import QueryString from 'query-string';
import Axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import MusicGroup from '../MainComponents/Groups/MusicGroup';
import AlbumGroup from '../MainComponents/Groups/AlbumGroup';
import ArtistGroup from '../MainComponents/Groups/ArtistGroup';


class SearchPage extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			search: PropTypes.string.isRequired,
		}).isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {
			MusicIds: [],
			AlbumIds: [],
			ArtistIds: [],
			IsFetching: false,
			PrevSearch: undefined,
		};
	}


	ApiSearch = () => {
		const {
			location,
		} = this.props;

		const { IsFetching, PrevSearch } = this.state;

		const values = QueryString.parse(location.search);

		if (values.q !== PrevSearch && !IsFetching) {
			this.setState({
				IsFetching: true,
				PrevSearch: values.q,
			});
			Axios.get(`/Music/Search/Music/Name/${values.q}`)
				.then((res) => {
					this.setState({ MusicIds: res.data });
					Axios.get(`/Music/Search/Album/Name/${values.q}`)
						.then((res2) => {
							this.setState({ AlbumIds: res2.data });
							Axios.get(`/Music/Search/Artist/Name/${values.q}`)
								.then((res3) => {
									this.setState({
										ArtistIds: res3.data,
										IsFetching: false,
									});
								});
						});
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
		const { MusicIds, AlbumIds, ArtistIds } = this.state;

		return (
			<div>
				<MusicGroup MusicIds={MusicIds} DetailType="Musics" />
				<AlbumGroup AlbumIds={AlbumIds} DetailType="Albums" />
				<ArtistGroup ArtistIds={ArtistIds} DetailType="Artists" />
			</div>
		);
	}
}
export default SearchPage;
