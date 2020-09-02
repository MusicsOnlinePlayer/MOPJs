import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import MusicGroup from './Groups/MusicGroup';
import { HIST_CONTEXT } from '../../Constants/MusicsConstants';

class History extends React.Component {
	static propTypes = {
		Size: PropTypes.number,
		RemoveDups: PropTypes.bool,
		Reverse: PropTypes.bool,
	}

	static defaultProps = {
		Size: undefined,
		RemoveDups: false,
		Reverse: true,
	}

	constructor(props) {
		super(props);
		this.state = {
			MusicIds: undefined,
		};
	}

	componentDidMount() {
		const { Size, RemoveDups, Reverse } = this.props;

		Axios.get('/User/ViewedMusics').then((res) => {
			const MusicArray = Reverse ? res.data.MusicsId.reverse() : res.data.MusicsId;

			const MusicIds = MusicArray.slice(0, Size);
			this.setState({
				MusicIds: RemoveDups ? [...new Set(MusicIds)] : MusicIds,
			});
		});
	}

	render() {
		const { MusicIds } = this.state;

		if (MusicIds) {
			return <MusicGroup MusicIds={MusicIds} DetailType="History" ContextType={HIST_CONTEXT} />;
		}

		return <></>;
	}
}
export default History;
