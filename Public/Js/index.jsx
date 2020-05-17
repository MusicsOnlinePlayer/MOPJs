import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route } from 'react-router-dom';
import Axios from 'axios';
import store from './store';
import ScrollToTop from './Components/ScrollToTop';
import ProtectedRoute from './ProtectedRoute';

Axios.defaults.withCredentials = true;

const App = () => (
	<Provider store={store}>
		<Suspense fallback={<div>Loading...</div>}>
			<HashRouter>

				<ScrollToTop />
				<ProtectedRoute path="/" component={React.lazy(() => import('./Components/Search/TopNav'))} />
				<Route path="/" component={React.lazy(() => import('./Components/MusicPlayer/Player'))} />
				<Route path="/Login" component={React.lazy(() => import('./Components/Authentification/Login'))} />
				<Route path="/Register" component={React.lazy(() => import('./Components/Authentification/Register'))} />
				<ProtectedRoute path="/Favorites" component={React.lazy(() => import('./Components/MainComponents/Favorites'))} />
				<ProtectedRoute path="/History" component={React.lazy(() => import('./Components/MainComponents/History'))} />
				<ProtectedRoute path="/Search" component={React.lazy(() => import('./Components/Search/SearchPage'))} />
				<ProtectedRoute path="/CurrentPlaylist" component={React.lazy(() => import('./Components/Containers/PlaylistContainer'))} />
				<ProtectedRoute path="/Album/:id" component={React.lazy(() => import('./Components/MainComponents/Album'))} />
				<ProtectedRoute path="/Artist/:id" component={React.lazy(() => import('./Components/MainComponents/Artist'))} />

			</HashRouter>
		</Suspense>
	</Provider>
);

ReactDOM.render(<App />, document.querySelector('#root'));
