import React from 'react';
import PropTypes from 'prop-types';
import { Image as ImgBootstrap } from 'react-bootstrap';

const MusicItemRow = ({
	onClick,
	Image,
	ImageDz,
	Title,
	Artist,
	children,
	isAvailable,
}) => (
	<tr className="w-100 mx-0 p-1 PointerCursor">
		<td className="align-middle py-2" onClick={onClick} style={{ width: '50px' }}>
			{ImageDz ? <ImgBootstrap className="PlayerImage my-auto" rounded height="50em" src={ImageDz} />
				: <ImgBootstrap className="PlayerImage my-auto" rounded height="50em" src={Image ? `data:image/jpeg;base64,${Image.toString('base64')}` : '/Ressources/noMusic.jpg'} />}

		</td>
		<td className="align-middle text px-1 py-1" style={{ maxHeight: '50em' }} onClick={onClick}>
			<span>
				<p className={isAvailable ? '' : 'font-italic'}>{Title}</p>
			</span>

		</td>
		<td className="align-middle py-1" onClick={onClick}>
			<p className="text-middle">{Artist}</p>
		</td>

		{children}
	</tr>
);

MusicItemRow.propTypes = {
	onClick: PropTypes.func.isRequired,
	Image: PropTypes.string,
	ImageDz: PropTypes.string,
	Title: PropTypes.string.isRequired,
	Artist: PropTypes.string.isRequired,
	children: PropTypes.element,
	isAvailable: PropTypes.bool.isRequired,
};

MusicItemRow.defaultProps = {
	Image: undefined,
	ImageDz: undefined,
	children: <></>,
};

export default MusicItemRow;
