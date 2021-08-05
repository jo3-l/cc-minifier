// @ts-check
export const TokenType = Object.freeze({
	Action: 0,
	ActionComponent: 1,
	String: 2,
	Text: 3,
});

export class Tokenizer {
	tokenize(code) {
		this.code = code;
		this.position = 0;

		const tokens = [];
		while (!this.done) tokens.push(this.nextToken());
		return tokens;
	}

	nextToken() {
		if (this.done) return undefined;
		const hasLeftDelim =
			this.position !== this.code.length - 1 &&
			this.code[this.position] === '{' &&
			this.code[this.position + 1] === '{';
		return hasLeftDelim ? this.lexAction() : this.lexText();
	}

	lexAction() {
		this.advance(2); // "{{"

		const innerTokens = [];
		const appendOrAddChar = (char) => {
			const shouldAppend = innerTokens.length === 0 || innerTokens[innerTokens.length - 1].type === TokenType.String;
			if (shouldAppend) innerTokens.push({ type: TokenType.ActionComponent, value: char });
			else innerTokens[innerTokens.length - 1].value += char;
		};

		while (!this.done) {
			const char = this.code[this.position];
			switch (this.code[this.position]) {
				// right action delimiter
				case '}':
					const hasRightDelim = this.position !== this.code.length - 1 && this.code[this.position + 1] === '}';
					if (hasRightDelim) {
						this.advance(2); // "}}"
						return { type: TokenType.Action, innerTokens };
					}

					appendOrAddChar('{');
					this.advance(1);
					break;
				// string start
				case '"':
				case '`':
					innerTokens.push(this.lexString());
					break;
				// other part of action
				default:
					appendOrAddChar(char);
					this.advance(1);
					break;
			}
		}

		throw new SyntaxError('Unexpected unclosed left action delimiter.');
	}

	lexText() {
		let text = '';
		const startPos = this.position;
		while (!this.done) {
			const hasLeftDelim =
				this.position !== this.code.length - 1 &&
				this.code[this.position] === '{' &&
				this.code[this.position + 1] === '{';
			if (hasLeftDelim && this.position !== startPos) break;
			text += this.code[this.position];
			this.advance(1);
		}

		return { type: TokenType.Text, value: text };
	}

	lexString() {
		const openQuote = this.code[this.position];
		this.advance(1);

		let value = openQuote;
		while (!this.done) {
			const char = this.code[this.position];
			// is the next character escaped?
			const isEscape = openQuote === '"' && this.position !== this.code.length - 1 && char === '\\';
			if (isEscape) {
				value += char;
				value += this.code[this.position + 1];
				this.advance(2); // '\' + next character
			} else {
				value += char;
				this.advance(1);

				// end of string
				if (char === openQuote) return { type: TokenType.String, value };
			}
		}

		throw new SyntaxError('Unexpected unclosed string.');
	}

	get done() {
		return this.position >= this.code.length;
	}

	advance(n) {
		this.position += n;
	}
}
