import React from 'react';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartEmpty } from '@fortawesome/free-regular-svg-icons';
import PropTypes from 'prop-types';
import ButtonIcon from './ButtonIcon';

class LikeButton extends React.Component {
	static propTypes = {
		onLike: PropTypes.func.isRequired,
		defaultLikeState: PropTypes.bool,
	}

	static defaultProps = {
		defaultLikeState: false,
	}

	constructor(props) {
		super(props);
		this.state = {
			IsLiked: props.defaultLikeState,
		};
	}

	onButtonClick = () => {
		const { onLike } = this.props;
		this.setState((prevState) => ({
			IsLiked: !prevState.IsLiked,
		}), () => {
			const { IsLiked } = this.state;
			onLike(IsLiked);
		});
	}

	render() {
		const { IsLiked } = this.state;
		const Icon = IsLiked ? faHeart : faHeartEmpty;

		return (<ButtonIcon onClick={this.onButtonClick} faIcon={Icon} buttonClass="float-right d-none d-lg-block Accessory LikeButton" />);
	}
}

export default LikeButton;
