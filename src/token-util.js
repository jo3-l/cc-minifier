// @ts-check
import { TokenType } from './tokenizer.js';

export function isComment(token) {
	if (token.type !== TokenType.Action) return false;
	const text = stripTrimMarkersFromText(getTextOfAction(token)).trim();
	return text.startsWith('/*') && text.endsWith('*/');
}

export function extractCommentText(token) {
	const text = stripTrimMarkersFromText(getTextOfAction(token)).trim();
	return text.slice(2, -2);
}

export function stripTrimMarkersFromText(text) {
	if (text.startsWith('-')) text = text.slice(1);
	if (text.endsWith('-')) text = text.slice(0, -1);
	return text;
}

export function getTextOfAction(token) {
	return token.innerTokens.map((innerToken) => innerToken.value).join('');
}

export function reconstructTextOfToken(token) {
	switch (token.type) {
		case TokenType.Action:
			return `{{${token.innerTokens.map(reconstructTextOfToken).join('')}}}`;
		case TokenType.ActionComponent:
		case TokenType.String:
		case TokenType.Text:
			return token.value;
	}
}
