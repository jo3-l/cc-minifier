// @ts-check
export class RemoveIndentsTransformer {
	transformText(token) {
		token.value = token.value.replace(/\t/g, '');
		return token;
	}
}
