import {
	CHANGE_PLAYING_MUSIC,
	ADD_MUSIC,
	CHANGE_PLAYING_ID,
	CLEAR_PLAYLIST,
	ADD_MULTIPLE_MUSICS,
	ADD_CUSTOM_FILEPATH,
	UPDATE_CURRENT_PLAYLIST,
} from '../Actions/Action';


const initialState = {
	CustomFilePath: undefined,
	Playlist: {
		PlayingId: -1,
		Musics: [],
	},
};

export default function MusicPlayerReducer(state = initialState, action) {
	switch (action.type) {
	case CHANGE_PLAYING_MUSIC:
		return {
			...state,
			Playlist: {
				Musics: action.RemoveOthers
					? [action.NewMusic] : [...state.Playlist.Musics, action.NewMusic],
				PlayingId: action.RemoveOthers ? 0 : state.Playlist.Musics.length,
			},
		};
	case ADD_MUSIC:
		return {
			...state,
			Playlist:
			{
				Musics: [...state.Playlist.Musics, action.AddedMusic],
				PlayingId: state.Playlist.PlayingId,
			},
		};

	case ADD_MULTIPLE_MUSICS:
		return {
			Playlist:
			{
				Musics: [...state.Playlist.Musics, ...action.AddedMusics],
				PlayingId: state.Playlist.PlayingId,
			},
		};
	case UPDATE_CURRENT_PLAYLIST:
		return {
			Playlist:
			{
				Musics: action.UpdatedMusics,
				PlayingId: action.UpdatedPlayingId,
			},
		};
	case CHANGE_PLAYING_ID:
		return {
			...state,
			Playlist: {
				PlayingId: action.PlaylistId,
				Musics: state.Playlist.Musics,
			},
		};

	case CLEAR_PLAYLIST:
		return {
			...state,
			Playlist: {
				PlayingId: 0,
				Musics: [],
			},
		};
	case ADD_CUSTOM_FILEPATH:
		return {
			...state,
			CustomFilePath: action.CustomFilePath,
		};

	default:
		return state;
	}
}
