import { REQUEST_SEARCH, RECEIVE_ALBUMS, RECEIVE_ARTISTS, RECEIVE_MUSICS, FAIL_SEARCH } from '../Actions/Action';

const InitialState = {
	SearchQuery: '',
	RequestedAt: '',

	IsFetching: false,
	SearchResults: '',

	ReceivedAt: '',

	Errors: {
		SearchError: '',
		FailAt: '',
	},
};

export default function MusicSearchReducer(state = InitialState, action) {
	switch (action.type) {
		case REQUEST_SEARCH:
			return Object.assign({}, state, {
				IsFetching: true,
				SearchQuery: action.SearchQuery,
				RequestedAt: action.RequestedAt,
				Errors: {},
			});
		case RECEIVE_MUSICS:
			return Object.assign({}, state, {
				IsFetching: false,
				SearchResults: { Musics: action.SearchResults, Albums: state.SearchResults.Albums, Artists: state.SearchResults.Artists },
				ReceivedAt: action.ReceivedAt,
				Errors: {},
			});
		case RECEIVE_ARTISTS:
			return Object.assign({}, state, {
				IsFetching: false,
				SearchResults: { Musics: state.SearchResults.Musics, Albums: state.SearchResults.Albums, Artists: action.SearchResults },
				ReceivedAt: action.ReceivedAt,
				Errors: {},
			});
		case RECEIVE_ALBUMS:
			return Object.assign({}, state, {
				IsFetching: false,
				SearchResults: { Musics: state.SearchResults.Musics, Albums: action.SearchResults, Artists: state.SearchResults.Artists },
				ReceivedAt: action.ReceivedAt,
				Errors: {},
			});
		case FAIL_SEARCH:
			return Object.assign({}, state, {
				IsFetching: false,
				SearchResults: [],
				Errors: {
					SearchError: action.SearchError,
					FailAt: action.FailAt,
				},
			});

		default:
			return state;
	}
}
