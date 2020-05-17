import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import MusicGroup from './Groups/MusicGroup';

class Favorites extends React.Component {
	static propTypes = {
		Size: PropTypes.number,
	}

	static defaultProps = {
		Size: undefined,
	}

	constructor(props) {
		super(props);
		this.state = {
			MusicIds: undefined,
		};
	}

	componentDidMount() {
		const { Size } = this.props;

		Axios.get('/User/LikedMusics').then((res) => {
			this.setState({
				MusicIds: res.data.MusicsId.slice(0, Size),
			});
		});
	}

	render() {
		const { MusicIds } = this.state;

		if (MusicIds) {
			return <MusicGroup MusicIds={MusicIds} DetailType="Favorites" />;
		}

		return <></>;
	}
}
export default Favorites;
