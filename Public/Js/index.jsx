import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route } from 'react-router-dom';
import Axios from 'axios';
import store from './store';
import ScrollToTop from './Components/ScrollToTop';


Axios.defaults.withCredentials = true;

const App = () => (
	<Provider store={store}>

		<HashRouter>
			<Suspense fallback={<div>Loading...</div>}>
				<ScrollToTop />
				<Route path="/" component={React.lazy(() => import('./Components/Search/TopNav'))} />
				<Route path="/" component={React.lazy(() => import('./Components/MusicPlayer/Player'))} />
				<Route path="/Login" component={React.lazy(() => import('./Components/Authentification/Login'))} />
				<Route path="/Register" component={React.lazy(() => import('./Components/Authentification/Register'))} />
				<Route path="/Search" component={React.lazy(() => import('./Components/Search/SearchPage'))} />
				<Route path="/Playlist" component={React.lazy(() => import('./Components/Containers/PlaylistContainer'))} />
				<Route path="/Album/:id" component={React.lazy(() => import('./Components/Albums/Album'))} />
				<Route path="/Artist/:id" component={React.lazy(() => import('./Components/Albums/Artist'))} />
			</Suspense>
		</HashRouter>
	</Provider>
);

ReactDOM.render(<App />, document.querySelector('#root'));
