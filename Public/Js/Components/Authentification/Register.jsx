import React, { useState } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AddMyAccount } from '../../Actions/Action';

function RegisterConnected({ history, dispatch }) {
	const {
		register, handleSubmit, errors,
	} = useForm();

	const [externalError, setexternalError] = useState('');

	const onSubmit = (data) => {
		Axios.post('/User/Register', data)
			.then((res) => {
				if (res.data.success) {
					Axios.get('/User/Me').then((res2) => {
						if (res2.data.Account) {
							dispatch(AddMyAccount(res2.data.Account));
						}
						history.push('/');
					});
				} else { setexternalError('Invalid account'); }
			})
			.catch(() => {
				setexternalError('Invalid account');
			});
	};

	return (
		<Form className="m-5" onSubmit={handleSubmit(onSubmit)}>
			<h2 className="text-center">Register</h2>
			<Form.Group controlId="formName">
				<Form.Label>Name</Form.Label>
				<Form.Control name="name" type="text" placeholder="Enter your name" ref={register({ required: true, maxLength: 20, minLength: 3 })} />
				<Form.Text className="text-muted">
					{errors.name && 'Name is required with a length between 3 and 20 characters.'}
				</Form.Text>
			</Form.Group>

			<Form.Group controlId="formBasicPassword">
				<Form.Label>Password</Form.Label>
				<Form.Control name="password" type="password" placeholder="Password" ref={register({ required: true, minLength: 8 })} />
				<Form.Text className="text-muted">
					{errors.password && 'Password is required and should be at least 8 characters.'}
				</Form.Text>
			</Form.Group>

			<Form.Text className="text-muted">
				{externalError}
			</Form.Text>

			<Row>
				<div className="col-md-auto py-auto">
					<Button variant="primary" type="submit">
						Register
					</Button>
				</div>
				<div className="col-md-auto">
					<Link className="my-auto" to="/Login">Use an existing account</Link>
				</div>
			</Row>
		</Form>
	);
}

RegisterConnected.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
	dispatch: PropTypes.func.isRequired,
};
const Register = connect()(RegisterConnected);

export default Register;
