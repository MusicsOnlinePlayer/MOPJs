import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import MusicGroup from './Groups/MusicGroup';
import { FAV_CONTEXT } from '../../Constants/MusicsConstants';

class Favorites extends React.Component {
	static propTypes = {
		Size: PropTypes.number,
		Reverse: PropTypes.bool,
	}

	static defaultProps = {
		Size: undefined,
		Reverse: true,
	}

	constructor(props) {
		super(props);
		this.state = {
			Musics: undefined,
		};
	}

	componentDidMount() {
		const { Size, Reverse } = this.props;

		Axios.get('/User/LikedMusics').then((res) => {
			const MusicArray = Reverse ? res.data.MusicsId.reverse() : res.data.MusicsId;

			this.setState({
				Musics: MusicArray.slice(0, Size),
			});
		});
	}

	render() {
		const { Musics } = this.state;

		if (Musics) {
			return <MusicGroup Musics={Musics} DetailType="Favorites" ContextType={FAV_CONTEXT} />;
		}

		return <></>;
	}
}
export default Favorites;
