import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route } from 'react-router-dom';
import Axios from 'axios';
import TopNav from './Components/Search/TopNav';
import store from './store';
import SearchPage from './Components/Search/SearchPage';
import Player from './Components/MusicPlayer/Player';
import PlaylistContainer from './Components/Containers/PlaylistContainer';
import Album from './Components/Albums/Album';
import Artist from './Components/Albums/Artist';
import ScrollToTop from './Components/ScrollToTop';
import Login from './Components/Authentification/Login';
import Register from './Components/Authentification/Register';

Axios.defaults.withCredentials = true;

const App = () => (
	<Provider store={store}>
		<HashRouter>
			<ScrollToTop />
			<Route path="/" component={TopNav} />
			<Route path="/" component={Player} />
			<Route path="/Login" component={Login} />
			<Route path="/Register" component={Register} />
			<Route path="/Search" component={SearchPage} />
			<Route path="/Playlist" component={PlaylistContainer} />
			<Route path="/Album/:id" component={Album} />
			<Route path="/Artist/:id" component={Artist} />
		</HashRouter>
	</Provider>
);

ReactDOM.render(<App />, document.querySelector('#root'));
