// @ts-check
import { variableRegexp } from '../regexp.js';

export class RenameVariablesTransformer {
	generatedVariables = new Map();
	variableGenerator = createVariableGenerator();

	constructor(ignoredVars) {
		this.ignoredVars = ignoredVars;
	}

	transformActionComponent(token) {
		token.value = token.value.replace(variableRegexp, (varName) => {
			if (varName === '$' || this.ignoredVars.has(varName)) return varName;
			if (!this.generatedVariables.has(varName)) {
				const generatedName = `$${this.variableGenerator.next().value}`;
				this.generatedVariables.set(varName, generatedName);
			}
			return this.generatedVariables.get(varName);
		});
		return token;
	}
}

const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCEFGHIJKLMNOPQRSTUVWXYZ_';

function* createVariableGenerator() {
	let len = 1;
	while (true) {
		let curIdx = 0;
		const chars = new Array(len).fill(0);
		// first character can't be a number.
		chars[0] = charset.indexOf('9') + 1;
		while (curIdx !== len) {
			yield chars.map((i) => charset[i]).join('');
			if (++chars[curIdx] === charset.length) curIdx++;
		}

		len++;
	}
}
