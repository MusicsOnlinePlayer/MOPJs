export const REQUEST_SEARCH = 'REQUEST_SEARCH';
export const RECEIVE_MUSICS = 'RECEIVE_MUSICS';
export const RECEIVE_ARTISTS = 'RECEIVE_ARTISTS';
export const RECEIVE_ALBUMS = 'RECEIVE_ALBUMS';
export const FAIL_SEARCH = 'FAIL_SEARCH';

export function RequestSearch(SearchQuery) {
	return {
		type: REQUEST_SEARCH,
		SearchQuery,
		RequestedAt: Date.now(),
	};
}

export function ReceiveMusics(SearchResults) {
	return {
		type: RECEIVE_MUSICS,
		SearchResults,
		ReceivedAt: Date.now(),
	};
}

export function ReceiveAlbums(SearchResults) {
	return {
		type: RECEIVE_ALBUMS,
		SearchResults,
		ReceivedAt: Date.now(),
	};
}

export function ReceiveArtists(SearchResults) {
	return {
		type: RECEIVE_ARTISTS,
		SearchResults,
		ReceivedAt: Date.now(),
	};
}

export function FailSearch(err) {
	return {
		type: FAIL_SEARCH,
		SearchError: err,
		FailAt: Date.now(),
	};
}

export const CHANGE_PLAYING_MUSIC = 'CHANGE_PLAYING_MUSIC';
export const CHANGE_PLAYING_ID = 'CHANGE_PLAYING_ID';
export const ADD_MUSIC = 'ADD_MUSIC';
export const ADD_MULTIPLE_MUSICS = 'ADD_MULTIPLE_MUSICS';
export const CLEAR_PLAYLIST = 'CLEAR_PLAYLIST';

export function ChangePlayingMusic(Music, RemoveOthers = true) {
	return {
		type: CHANGE_PLAYING_MUSIC,
		RemoveOthers,
		NewMusic: Music,
	};
}

export function AddMusic(Music) {
	return {
		type: ADD_MUSIC,
		AddedMusic: Music,
		AddedAt: Date.now(),
	};
}

export function AddMultipleMusics(Musics) {
	return {
		type: ADD_MULTIPLE_MUSICS,
		AddedMusics: Musics,
		AddedAt: Date.now(),
	};
}

export function ChangePlayingId(id) {
	return {
		type: CHANGE_PLAYING_ID,
		PlaylistId: id,
	};
}

export function ClearPlaylist() {
	return {
		type: CLEAR_PLAYLIST,
	};
}
