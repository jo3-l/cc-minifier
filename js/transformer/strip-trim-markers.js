// @ts-check
import { isComment } from '../token-util.js';
import { TokenType } from '../tokenizer.js';

export class StripTrimMarkersTransform {
	transformAction(token) {
		if (isComment(token)) return token;
		if (token.innerTokens.length === 0) return token;

		const firstToken = token.innerTokens[0];
		if (firstToken.type === TokenType.ActionComponent && firstToken.value.startsWith('-')) {
			firstToken.value = firstToken.value.slice(1).trimStart();
		}

		const lastToken = token.innerTokens[token.innerTokens.length - 1];
		if (lastToken.type === TokenType.ActionComponent && lastToken.value.endsWith('-')) {
			lastToken.value = lastToken.value.slice(0, -1).trimEnd();
		}

		token.innerTokens = token.innerTokens.filter(
			(token) => token.type !== TokenType.ActionComponent || token.value.length > 0,
		);
		return token;
	}
}
