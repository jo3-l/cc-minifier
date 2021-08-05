import { variableCommaRegexp, variableInitializationRegexp, variableReassignmentRegexp } from '../regexp.js';

// @ts-check
export class ShortenDeclarationsTransformer {
	transformActionComponent(token) {
		token.value = token.value.replace(variableCommaRegexp, '$1,');
		token.value = token.value.replace(variableInitializationRegexp, '$1:=');
		token.value = token.value.replace(variableReassignmentRegexp, '$1 =');
		return token;
	}
}
