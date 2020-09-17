import QueryString from 'query-string';
import Axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import MusicGroup from '../MainComponents/Groups/MusicGroup';
import AlbumGroup from '../MainComponents/Groups/AlbumGroup';
import ArtistGroup from '../MainComponents/Groups/ArtistGroup';
import UserPlaylistGroup from '../MainComponents/Groups/UserPlaylistGroup';


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
			PlaylistIds: [],
			IsFetchingMusics: false,
			IsFetchingAlbums: false,
			IsFetchingArtists: false,
			IsFetchingPlaylists: false,
			PrevSearch: undefined,
		};
	}


	ApiSearch = () => {
		const {
			location,
		} = this.props;

		const {
			IsFetchingMusics, IsFetchingAlbums, IsFetchingArtists, IsFetchingPlaylists, PrevSearch,
		} = this.state;

		const values = QueryString.parse(location.search);

		if (values.q !== PrevSearch
			&& !IsFetchingMusics
			&& !IsFetchingAlbums
			&& !IsFetchingArtists
			&& !IsFetchingPlaylists
		) {
			this.setState({
				IsFetchingMusics: true,
				PrevSearch: values.q,
			});
			// TODO refactor by using parallel tasks
			Axios.get(`/Music/Search/Music/Name/${values.q}`)
				.then((res) => {
					this.setState({ MusicIds: res.data, IsFetchingMusics: false, IsFetchingAlbums: true });
					Axios.get(`/Music/Search/Album/Name/${values.q}`)
						.then((res2) => {
							this.setState({
								AlbumIds: res2.data,
								IsFetchingAlbums: false,
								IsFetchingArtists: true,
							});
							Axios.get(`/Music/Search/Artist/Name/${values.q}`)
								.then((res3) => {
									this.setState({
										ArtistIds: res3.data,
										IsFetchingArtists: false,
										IsFetchingPlaylists: true,
									});
									Axios.get(`/Music/Search/Playlist/Name/${values.q}`)
										.then((res4) => {
											this.setState({
												PlaylistIds: res4.data,
												IsFetchingPlaylists: false,
											});
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
		const {
			MusicIds, AlbumIds, ArtistIds, PlaylistIds,
			IsFetchingMusics, IsFetchingAlbums, IsFetchingArtists, IsFetchingPlaylists,
		} = this.state;

		return (
			<div>
				<MusicGroup MusicIds={MusicIds} DetailType="Musics" IsFetching={IsFetchingMusics} />
				<AlbumGroup AlbumIds={AlbumIds} DetailType="Albums" IsFetching={IsFetchingAlbums} />
				<ArtistGroup ArtistIds={ArtistIds} DetailType="Artists" IsFetching={IsFetchingArtists} />
				<UserPlaylistGroup PlaylistsId={PlaylistIds} DetailType="Playlists" IsFetching={IsFetchingPlaylists} />
			</div>
		);
	}
}
export default SearchPage;
