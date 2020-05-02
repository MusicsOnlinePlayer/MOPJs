import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ButtonIcon = ({ onClick, faIcon, buttonClass }) => (
	<button className={`ButtonIcon ${buttonClass}`} type="button" onClick={onClick}>
		<FontAwesomeIcon icon={faIcon} size="lg" pull="right" />
	</button>
);

ButtonIcon.propTypes = {
	onClick: PropTypes.func.isRequired,
	faIcon: PropTypes.string.isRequired,
	buttonClass: PropTypes.string,
};

ButtonIcon.defaultProps = {
	buttonClass: '',
};

export default ButtonIcon;
