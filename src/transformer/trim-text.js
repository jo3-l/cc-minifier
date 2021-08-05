// @ts-check
export class TrimTextTransformer {
	transformText(token) {
		token.value = token.value.trim();
		return token;
	}
}
