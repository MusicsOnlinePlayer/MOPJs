import { combineReducers } from 'redux';
import MusicSearchReducer from './MusicSearchReducer';
import MusicPlayerReducer from './MusicPlayerReducer';
import UserAccountReducer from './UserAccountReducer';

export default combineReducers({
	MusicSearchReducer,
	MusicPlayerReducer,
	UserAccountReducer,
});
