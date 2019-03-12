import PropTypes from "prop-types";
import React from "react";
import colors from "yoast-components/style-guide/colors.json";
import styled from "styled-components";
import validate from "validate.js";
import _isUndefined from "lodash/isUndefined";
import { injectIntl, defineMessages, FormattedMessage, intlShape } from "react-intl";
import { Redirect } from "react-router";
import { passwordRepeatConstraint, emailConstraints } from "./CommonConstraints";
import zxcvbn from "zxcvbn";
import _debounce from "lodash/debounce";

// Components.
import { Button } from "../Button";
import ValidationInputField from "../ValidationInputField";
import { StyledLabel } from "../Labels";
import ErrorDisplay from "../../errors/ErrorDisplay";


// Styled components.
const TextInput = styled( ValidationInputField )`
	background-color: ${ colors.$color_background_light };
`;

const FormGroup = styled.form`
	position: relative;
	width: 400px;
	min-height: 400px;
`;

const LabelBlock = styled.div`
	width: 100%;
`;

const Label = styled( StyledLabel )`
	margin-top: 5px;
`;

const SaveButtonArea = styled.div`
	width: 100%;
`;

const SaveButton = styled( Button )`
	margin: 2em 0;
	width: 100%;
`;

// Messages
const messages = defineMessages( {
	labelEmail: {
		id: "signup.email",
		defaultMessage: "Email address",
	},
	labelPassword: {
		id: "signup.password",
		defaultMessage: "Password",
	},
	labelPasswordRepeat: {
		id: "signup.passwordRepeat",
		defaultMessage: "Repeat password",
	},
	createAccount: {
		id: "signup.create",
		defaultMessage: "Create account",
	},
	duplicateEmail: {
		id: "signup.error.duplicateEmail",
		defaultMessage: "The email address could not be added, it is probably already in use.",
	},
} );

/**
 * Sign up page where the user can sign up to MyYoast.
 */
class Signup extends React.Component {
	constructor( props ) {
		super( props );

		// Default state.
		this.state = {
			email: this.props.email,
			password: "",
			passwordRepeat: "",
			errors: {},
			passwordScore: 3,
		};

		this.handleSubmit = this.handleSubmit.bind( this );

		this.onUpdateEmail = this.onUpdate.bind( this, "email" );
		this.onUpdatePassword = this.onUpdate.bind( this, "password" );
		this.onUpdatePasswordRepeat = this.onUpdate.bind( this, "passwordRepeat" );
		this.getAccountButton = this.getAccountButton.bind( this );
		this.validatePassword = _debounce( this.validatePassword.bind( this ), 1000 );

		// Validation constraints.
		this.constraints = {
			passwordRepeat: passwordRepeatConstraint( this.props.intl ),
		};
	}

	/**
	 * Validates the password field using the zxcvbn module.
	 *
	 * @param {value} value The value of the password field.
	 * @returns {void}
	 */
	validatePassword( value ) {
		if ( value.length > 0 ) {
			const passwordValidation = zxcvbn( value );
			this.setState( { passwordScore: passwordValidation.score } );
		}
	}

	/**
	 * Updates the specified field in the state,
	 * to be used as callback functions in text input fields.
	 *
	 * @param {string} field the field in the state that should be updated.
	 * @param {Object} event the input field change event.
	 * @param {array} errors The input field related errors.
	 * @returns {void}
	 */
	onUpdate( field, event, errors = [] ) {
		const hasFieldErrors = errors.length > 0;
		const obj = {};
		// Scores the strength of the password input using the zxcvbn module.
		if ( field === "password" ) {
			this.validatePassword( event.target.value );
		}
		obj[ field ] = event.target.value;
		obj.errorsInputFields = hasFieldErrors;
		this.setState( obj );
	}

	/**
	 * Returns the 'Create account' button.
	 * @param {object} errors the errors from the repeat password input field.
	 * @returns {ReactElement} The 'Create account' button.
	 */
	getAccountButton( errors ) {
		return <SaveButtonArea>
			<SaveButton type="submit" enabledStyle={ this.canSubmit( errors ) }>
				<FormattedMessage { ...messages.createAccount } />
			</SaveButton>
		</SaveButtonArea>;
	}

	canSubmit( errors ) {
		return this.state.email.length > 0 &&
			this.state.password.length > 0 &&
			this.state.passwordRepeat.length > 0 &&
			! errors &&
			! this.state.errorsInputFields &&
			this.state.passwordScore > 2;
	}

	/**
	 * Validates the email, password and password repeat fields
	 * and returns an array of errors if there are any,
	 * and an empty array if none are present.
	 *
	 * @returns {string[]} the array of error messages.
	 */
	validate() {
		if ( this.state.passwordRepeat.length === 0 ) {
			return null;
		}

		let errors = validate( {
			email: this.state.email,
			password: this.state.password,
			passwordRepeat: this.state.passwordRepeat,
		}, this.constraints );

		if ( _isUndefined( errors ) ) {
			errors = null;
		}
		return errors;
	}

	/**
	 * Creates a new MyYoast account using the
	 * email address and password as entered in this component.
	 *
	 * @param { object } event The button click event.
	 * @returns {void}
	 */
	handleSubmit( event ) {
		event.preventDefault();
		const data = {
			userEmail: this.state.email,
			password: this.state.password,
			repeatPassword: this.state.passwordRepeat,
		};

		if ( this.canSubmit( this.validate() ) ) {
			this.props.attemptSignup( data );
		}
	}

	/**
	 * Renders the component.
	 *
	 * @returns {ReactElement} The rendered component.
	 */
	render() {
		let signupError = this.props.signupError;

		if ( this.state.passwordScore < 3 ) {
			// Error object for weak password input, corresponding to the unifyErrorStructure function.
			signupError = { code: "rest_user_weak_password", field: "validator" };
		}

		if ( this.props.signupRequestSuccess ) {
			return ( <Redirect to={ "/almost-there" } /> );
		}

		const errors = this.validate();

		return (
			<FormGroup onSubmit={ this.handleSubmit }>
				<ErrorDisplay error={ signupError } />
				<LabelBlock>
					<Label htmlFor="email-address">
						<FormattedMessage { ...messages.labelEmail } />
					</Label>
					<TextInput
						id="email-address"
						autocomplete="on"
						name="email"
						type="text"
						value={ this.state.email }
						onChange={ this.onUpdateEmail }
						constraint={ emailConstraints( this.props.intl ) }
					/>
				</LabelBlock>
				<LabelBlock>
					<Label htmlFor="password">
						<FormattedMessage { ...messages.labelPassword } />
					</Label>
					<TextInput
						id="password"
						name="password"
						type="password"
						onChange={ this.onUpdatePassword }
					/>
				</LabelBlock>
				<LabelBlock>
					<Label htmlFor="password-repeat">
						<FormattedMessage { ...messages.labelPasswordRepeat } />
					</Label>
					<TextInput
						id="password-repeat"
						name="repeat password"
						type="password"
						onChange={ this.onUpdatePasswordRepeat }
						errors={ errors ? errors.passwordRepeat : [] }
					/>
				</LabelBlock>
				{ this.getAccountButton( errors ) }
			</FormGroup>
		);
	}
}

Signup.propTypes = {
	intl: intlShape.isRequired,
	signupError: PropTypes.object,
	email: PropTypes.string,
	location: PropTypes.object,
	attemptSignup: PropTypes.func.isRequired,
	signupRequestSuccess: PropTypes.bool.isRequired,
};

Signup.defaultProps = {
	signupError: null,
	email: "",
	signupRequestSuccess: false,
};

export default injectIntl( Signup );