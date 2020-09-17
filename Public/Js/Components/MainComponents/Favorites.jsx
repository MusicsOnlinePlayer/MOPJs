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
			MusicIds: undefined,
		};
	}

	componentDidMount() {
		const { Size, Reverse } = this.props;

		Axios.get('/User/LikedMusics').then((res) => {
			const MusicArray = Reverse ? res.data.MusicsId.reverse() : res.data.MusicsId;

			this.setState({
				MusicIds: MusicArray.slice(0, Size),
			});
		});
	}

	render() {
		const { MusicIds } = this.state;

		if (MusicIds) {
			return <MusicGroup MusicIds={MusicIds} DetailType="Favorites" ContextType={FAV_CONTEXT} />;
		}

		return <></>;
	}
}
export default Favorites;
