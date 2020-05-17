import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import MusicGroup from './Groups/MusicGroup';

class History extends React.Component {
	static propTypes = {
		Size: PropTypes.number,
		RemoveDups: PropTypes.bool,
	}

	static defaultProps = {
		Size: undefined,
		RemoveDups: false,
	}

	constructor(props) {
		super(props);
		this.state = {
			MusicIds: undefined,
		};
	}

	componentDidMount() {
		const { Size, RemoveDups } = this.props;

		Axios.get('/User/ViewedMusics').then((res) => {
			const MusicIds = res.data.MusicsId.slice(0, Size);
			this.setState({
				MusicIds: RemoveDups ? [...new Set(MusicIds)] : MusicIds,
			});
		});
	}

	render() {
		const { MusicIds } = this.state;

		if (MusicIds) {
			return <MusicGroup MusicIds={MusicIds} DetailType="History" />;
		}

		return <></>;
	}
}
export default History;
