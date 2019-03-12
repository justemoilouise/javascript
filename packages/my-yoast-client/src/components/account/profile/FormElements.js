import React from "react";
import styled from "styled-components";
import { LargeButton, LargeSecondaryButton } from "../../Button";
import { FormattedMessage, defineMessages } from "react-intl";
import { InputField } from "../../InputField";
import colors from "yoast-components/style-guide/colors.json";
import defaults from "../../../config/defaults.json";

const messages = defineMessages( {
	discardChanges: {
		id: "discard.changes",
		defaultMessage: "Discard changes",
	},
	saving: {
		id: "change.saving",
		defaultMessage: "Saving...",
	},
	profileSaved: {
		id: "change.saved.profile",
		defaultMessage: "Profile saved",
	},
	passwordSaved: {
		id: "change.saved.password",
		defaultMessage: "Password saved",
	},
	saveButton: {
		id: "change.save.button",
		defaultMessage: "Save changes",
	},
} );

const FormMessage = styled.span`
	padding: 0 1em;
`;

export const ButtonArea = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
`;

const SaveButton = styled( LargeButton )`
	margin: 1em 0;

	@media screen and ( max-width: ${ defaults.css.breakpoint.mobile }px ) {
		width: 100%;
	}
`;

const DiscardButton = styled( LargeSecondaryButton )`
	margin: 1em 0;
	margin-right: 1em;

	@media screen and ( max-width: ${ defaults.css.breakpoint.mobile }px ) {
		width: 100%;
		margin: 0;
	}
`;

export const Form = styled.form`
	margin-top: 1.5em;
	margin-bottom: 1em;
`;

export const FormGroup = styled.form`
	display: flex;
	flex-wrap: wrap;
	width: 100%;
	justify-content: space-between;
`;

export const TextInput = styled( InputField )`
	background-color: ${ colors.$color_background_light };
`;

/**
 * Gets the message related to save actions.
 *
 * @param {boolean} isSaving Whether the form is currently in the progress of saving.
 * @param {boolean} isSaved  Whether the form has been saved.
 * @param {string}  type     The type of form.
 * @param {*}       intl     To format messages.
 *
 * @returns {string} The message to be shown.
 */
function getMessage( isSaving, isSaved, type, intl ) {
	let message = "";
	const savedMessage = type === "profile"
		? intl.formatMessage( messages.profileSaved )
		: intl.formatMessage( messages.passwordSaved );

	if ( isSaving ) {
		message = intl.formatMessage( messages.saving );
	} else if ( isSaved ) {
		message = savedMessage;
	}

	return message;
}

/**
 * Generates a row of buttons to save or discard changes in a form.
 *
 * @param {string} type The type of form, e.g. "password" or "profile".
 * @param {*} intl To format messages.
 * @param {boolean} isSaving Whether the form is currently in the progress of saving.
 * @param {boolean} isSaved Whether the form has been saved.
 * @param {function} discardChanges Callback function to call when the discard button is pressed.
 *
 * @returns {React.Component} The component with the change buttons.
 */
export function getChangeButtons( type, intl, isSaving, isSaved, discardChanges ) {
	const message = getMessage( isSaving, isSaved, type, intl );

	return (
		<ButtonArea>
			{ message && <FormMessage inline={ true } role="alert">{ message }</FormMessage> }
			<DiscardButton type="reset" onClick={ discardChanges }>
				<FormattedMessage
					id={ messages.discardChanges.id }
					defaultMessage={ messages.discardChanges.defaultMessage }
				/>
			</DiscardButton>
			<SaveButton type="submit">
				<FormattedMessage
					id={ messages.saveButton.id }
					defaultMessage={ messages.saveButton.defaultMessage }
				/>
			</SaveButton>
		</ButtonArea>
	);
}