import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'react-bootstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const MoreIconButton = React.forwardRef(({ onClick }, ref) => (
	<div
		href=""
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
		className="float-right d-none d-lg-block"
	>
		<FontAwesomeIcon
			icon={faPlus}
			size="lg"
			style={{
				color: '#d6d6d6ff',
				fontSize: '1.5rem',
			}}
		/>
	</div>
));

MoreIconButton.propTypes = {
	onClick: PropTypes.func.isRequired,
};

const MoreButtonMusic = ({
	children,
}) => (
	<Dropdown>
		<Dropdown.Toggle variant="success" id="dropdown-basic" as={MoreIconButton} />

		<Dropdown.Menu>
			{children}
		</Dropdown.Menu>

	</Dropdown>
);

MoreButtonMusic.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
};

MoreButtonMusic.defaultProps = {
	children: <></>,
};

export default MoreButtonMusic;
