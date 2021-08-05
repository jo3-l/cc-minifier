// @ts-check
import { isComment } from '../token-util.js';
import { TokenType } from '../tokenizer.js';

export class TrimInActionsTransformer {
	transformAction(token) {
		if (isComment(token)) return token;
		const { innerTokens } = token;
		for (let i = 0; i < innerTokens.length; i++) {
			const innerToken = innerTokens[i];
			if (innerToken.type === TokenType.ActionComponent) {
				if (i === 0) innerToken.value = innerToken.value.trimStart();
				innerToken.value = innerToken.value.replace(/\s+/g, ' ');
				if (i === innerTokens.length - 1) innerToken.value = innerToken.value.trimEnd();
			}
		}

		return token;
	}
}
