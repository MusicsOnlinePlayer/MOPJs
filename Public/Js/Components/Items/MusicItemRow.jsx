import React from 'react';
import PropTypes from 'prop-types';
import { Image as ImgBootstrap } from 'react-bootstrap';

const MusicItemRow = ({
	onClick,
	Image,
	Title,
	Artist,
	children,
}) => (
	<tr className="w-100 mx-0 p-1 ">
		<td className="align-middle" onClick={onClick} style={{ width: '50px' }}>
			<ImgBootstrap className="PlayerImage my-auto" rounded height="50em" src={Image ? `data:image/jpeg;base64,${Image.toString('base64')}` : '/Ressources/noMusic.jpg'} />
		</td>
		<td className="align-middle" style={{ maxHeight: '50em' }} onClick={onClick}>
			<p>{Title}</p>
		</td>
		<td className="align-middle" onClick={onClick}>
			<p className="text-middle">{Artist}</p>
		</td>

		{children}
	</tr>
);

MusicItemRow.propTypes = {
	onClick: PropTypes.func.isRequired,
	Image: PropTypes.string,
	Title: PropTypes.string.isRequired,
	Artist: PropTypes.string.isRequired,
	children: PropTypes.element,
};

MusicItemRow.defaultProps = {
	Image: undefined,
	children: <></>,
};

export default MusicItemRow;
