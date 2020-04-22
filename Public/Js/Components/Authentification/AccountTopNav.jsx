import React from 'react';
import Axios from 'axios';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Button, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
	AddMyAccount as AddMyAccountRedux,
} from '../../Actions/Action';

function mapDispatchToProps(dispatch) {
	return {
		AddMyAccount: (Account) => dispatch(AddMyAccountRedux(Account)),
	};
}

const mapStateToProps = (state) => ({
	Account: state.UserAccountReducer.Account,
});

class AccountTopNavConnected extends React.Component {
	static propTypes = {
		Account: PropTypes.shape({
			username: PropTypes.string.isRequired,
		}),
		AddMyAccount: PropTypes.func.isRequired,
	}

	static defaultProps = {
		Account: undefined,
	}

	constructor(props) {
		super(props);
		this.state = {

		};
	}

	componentDidMount() {
		this.requestMyAccount();
	}

	requestMyAccount = () => {
		const { AddMyAccount } = this.props;

		Axios.get('/User/Me').then((res) => {
			if (res.data.Account) {
				AddMyAccount(res.data.Account);
			}
		});
	}

	OnLogout = () => {
		const { AddMyAccount } = this.props;

		Axios.get('/User/Logout')
			.then(() => {
				AddMyAccount(undefined);
			});
	}

	render() {
		const { Account } = this.props;
		if (Account) {
			const { username } = Account;
			return (
				<NavDropdown title={username} id="basic-nav-dropdown" alignRight>
					<NavDropdown.Item href="#action/3.1">My Account</NavDropdown.Item>
					<NavDropdown.Divider />
					<NavDropdown.Item onClick={this.OnLogout}>Logout</NavDropdown.Item>
				</NavDropdown>
			);
		}
		return (
			<>
				<Link to="/Register"><Button variant="primary" className="mr-2">Register</Button></Link>
				<Link to="/Login"><Button variant="outline-primary" className="mr-2">Login</Button></Link>
			</>
		);
	}
}

const AccountTopNav = connect(mapStateToProps, mapDispatchToProps)(AccountTopNavConnected);

export default AccountTopNav;
