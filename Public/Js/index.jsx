import React from 'react';
import ReactDOM from 'react-dom';
import TopNav from './Components/Search/TopNav';
import { Provider } from 'react-redux';
import { HashRouter, Route } from 'react-router-dom';
import store from './store';
import SearchPage from './Components/Search/SearchPage';
import Player from './Components/MusicPlayer/Player';
import Playlist from './Components/MusicPlayer/Playlist';

const App = () => {
	return (
		<Provider store={store}>
			<HashRouter>
				<Route path="/" component={TopNav} />
				<Route path="/" component={Player} />
				<Route path="/Search" component={SearchPage} />
				<Route path="/Playlist" component={Playlist} />
			</HashRouter>
		</Provider>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
