import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ButtonIcon = ({
	onClick, faIcon, buttonClass, iconFontSize,
}) => (
	<div className={`ButtonIcon ${buttonClass}`} type="button" onClick={onClick}>
		<FontAwesomeIcon icon={faIcon} size="lg" pull="right" style={{ fontSize: iconFontSize }} />
	</div>
);

ButtonIcon.propTypes = {
	onClick: PropTypes.func.isRequired,
	faIcon: PropTypes.shape().isRequired,
	buttonClass: PropTypes.string,
	iconFontSize: PropTypes.string,
};

ButtonIcon.defaultProps = {
	buttonClass: '',
	iconFontSize: '1.5rem',
};

export default ButtonIcon;
