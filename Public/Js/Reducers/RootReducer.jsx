import { combineReducers } from 'redux';
import MusicSearchReducer from './MusicSearchReducer';
import MusicPlayerReducer from './MusicPlayerReducer';

export default combineReducers({
	MusicSearchReducer,
	MusicPlayerReducer,
});
