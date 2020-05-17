export const CHANGE_PLAYING_MUSIC = 'CHANGE_PLAYING_MUSIC';
export const CHANGE_PLAYING_ID = 'CHANGE_PLAYING_ID';
export const ADD_MUSIC = 'ADD_MUSIC';
export const ADD_MULTIPLE_MUSICS = 'ADD_MULTIPLE_MUSICS';
export const CLEAR_PLAYLIST = 'CLEAR_PLAYLIST';
export const ADD_CUSTOM_FILEPATH = 'ADD_CUSTOM_FILEPATH';

export function AddCustomFilePath(CustomFilePath) {
	return {
		type: ADD_CUSTOM_FILEPATH,
		CustomFilePath,
	};
}

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


export const ADD_MY_ACCOUNT = 'ADD_MY_ACCOUNT';

export function AddMyAccount(MyAccount) {
	return {
		type: ADD_MY_ACCOUNT,
		Account: MyAccount,
	};
}
