import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'react-bootstrap';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const MoreIconButton = React.forwardRef(({ onClick }, ref) => (
	<div
		href=""
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
		style={{
			width: '40px',
			height: '40px',
			borderRadius: '50%',
			background: '#d6d6d640',
			position: 'relative',
		}}
	>
		<FontAwesomeIcon
			icon={faEllipsisV}
			className="my-auto"
			size="lg"
			style={{
				fontSize: '20px',
				position: 'absolute',
				left: '16.25px',
				top: '10px',
				color: '#d6d6d6ff',
				mixBlendMode: 'hard-light',
			}}
		/>
	</div>
));

MoreIconButton.propTypes = {
	onClick: PropTypes.func.isRequired,
};

const MoreButton = ({
	children,
}) => (
	<Dropdown drop="left">
		<Dropdown.Toggle variant="success" id="dropdown-basic" as={MoreIconButton} />

		<Dropdown.Menu>
			{children}
		</Dropdown.Menu>

	</Dropdown>
);

MoreButton.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
};

MoreButton.defaultProps = {
	children: <></>,
};

export default MoreButton;
