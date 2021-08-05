import { TokenType } from '../tokenizer.js';

export class TrimStartAndEndTransformer {
	transformTokens(tokens) {
		if (tokens.length === 0) return tokens;
		for (const token of tokens) {
			if (token.type !== TokenType.Text) break;
			token.value = token.value.trimStart();
		}

		for (let i = tokens.length - 1; i >= 0; i--) {
			const token = tokens[i];
			if (token.type !== TokenType.Text) break;
			token.value = token.value.trimEnd();
		}

		return tokens;
	}
}
