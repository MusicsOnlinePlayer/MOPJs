import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AddMyAccount } from '../../Actions/Action';

function LoginConnected({ history, dispatch }) {
	const {
		register, handleSubmit, errors,
	} = useForm();

	const [externalError, setexternalError] = useState('');

	const onSubmit = (data) => {
		Axios.post('/User/Login', data)
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
			<h2 className="text-center text-muted">Login</h2>

			<Form.Group controlId="formBasicEmail">
				<Form.Label>Username</Form.Label>
				<Form.Control name="username" type="text" placeholder="Enter username" ref={register({ required: true, minLength: 3, maxLength: 20 })} />
				<Form.Text className="text-muted">
					{errors.username && 'Username is required and must be valid.'}
				</Form.Text>
			</Form.Group>

			<Form.Group controlId="formBasicPassword">
				<Form.Label>Password</Form.Label>
				<Form.Control name="password" type="password" placeholder="Password" ref={register({ required: true, minLength: 8 })} />
				<Form.Text className="text-muted">
					{errors.password && 'Password is required and should be at least 8 characters.'}
				</Form.Text>
			</Form.Group>

			<Form.Text className="text-muted mb-1">
				{externalError}
			</Form.Text>

			<Button variant="primary" type="submit">
				Login
			</Button>
		</Form>
	);
}

LoginConnected.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
	dispatch: PropTypes.func.isRequired,
};

const Login = connect()(LoginConnected);

export default Login;
