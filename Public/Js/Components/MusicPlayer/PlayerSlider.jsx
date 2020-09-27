import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';


const PlayerSlider = ({ Time, EndTime, OnSliderChange }) => {
	const ContainerRef = useRef(null);
	const [SliderWidth, SetSliderWidth] = useState(0);
	const [IsDragging, SetIsDragging] = useState(false);

	useEffect(() => {
		SetSliderWidth(ContainerRef.current ? ContainerRef.current.offsetWidth : 0);
	}, [ContainerRef.current]);
	return (
		<div ref={ContainerRef} style={{ width: '100%', height: '2px' }} id="Progress-container" className="mb-2">
			<div
				className={`Progress-bar ${IsDragging ? 'noTransition' : ''}`}
				style={{ width: `${(Time * SliderWidth) / EndTime}px`, height: '100%' }}
			/>

			<Draggable
				axis="x"
				bounds="parent"
				position={{
					x: (Time * SliderWidth) / EndTime,
					y: 0,
				}}
				positionOffset={{
					x: -6,
					y: 0,
				}}
				onStart={() => SetIsDragging(true)}
				onDrag={(e, data) => {
					OnSliderChange((data.x * EndTime) / SliderWidth);
				}}
				onStop={() => SetIsDragging(false)}
			>
				<div className={`Progress-drag  ${IsDragging ? 'noTransition' : ''}`}>
					<div className="Progress-ball" />
				</div>
			</Draggable>

		</div>
	);
};

PlayerSlider.propTypes = {
	Time: PropTypes.number.isRequired,
	EndTime: PropTypes.number.isRequired,
	OnSliderChange: PropTypes.func.isRequired,
};

export default PlayerSlider;
