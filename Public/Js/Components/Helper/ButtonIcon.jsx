import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ButtonIcon = ({ onClick, faIcon }) => (
	<button className="ButtonIcon" type="button" onClick={onClick}>
		<FontAwesomeIcon icon={faIcon} size="lg" pull="right" />
	</button>
);

ButtonIcon.propTypes = {
	onClick: PropTypes.func.isRequired,
	faIcon: PropTypes.string.isRequired,
};

export default ButtonIcon;
