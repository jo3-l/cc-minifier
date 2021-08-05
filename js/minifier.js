// @ts-check
import { variableRegexp } from './regexp.js';
import { Tokenizer, TokenType } from './tokenizer.js';
import { extractCommentText, isComment, reconstructTextOfToken } from './token-util.js';

import { RemoveIndentsTransformer } from './transformer/remove-indents.js';
import { RenameVariablesTransformer } from './transformer/rename-variables.js';
import { ShortenDeclarationsTransformer } from './transformer/shorten-declarations.js';
import { StripCommentsTransformer } from './transformer/strip-comments.js';
import { StripTrimMarkersTransform } from './transformer/strip-trim-markers.js';
import { TrimInActionsTransformer } from './transformer/trim-in-actions.js';
import { TrimTextTransformer } from './transformer/trim-text.js';
import { TrimStartAndEndTransformer } from './transformer/trim-start-and-end.js';

const tokenizer = new Tokenizer();

export function minify(code) {
	const tokens = tokenizer.tokenize(code);

	// Initial pass to determine variables used in ignored spans; don't touch those.
	const ignoredSpans = getIgnoredSpans(tokens);
	const ignoredVars = new Set();
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (isInIgnoredSpan(ignoredSpans, i) && token.type === TokenType.Action && !isComment(token)) {
			for (const innerToken of token.innerTokens) {
				if (innerToken.type === TokenType.ActionComponent) {
					for (const varName of innerToken.value.match(variableRegexp)) ignoredVars.add(varName);
				}
			}
		}
	}

	const config = extractConfig(tokens);
	const transformers = [];
	if (config.removeIndents) transformers.push(new RemoveIndentsTransformer());
	if (config.renameVariables) transformers.push(new RenameVariablesTransformer(ignoredVars));
	if (config.shortenDeclarations) transformers.push(new ShortenDeclarationsTransformer());
	if (config.stripComments) transformers.push(new StripCommentsTransformer());
	if (config.stripTrimMarkers) transformers.push(new StripTrimMarkersTransform());
	if (config.trimInActions) transformers.push(new TrimInActionsTransformer());
	if (config.trimText) transformers.push(new TrimTextTransformer());
	if (config.trimStartAndEnd) transformers.push(new TrimStartAndEndTransformer());

	// Now, apply the transformers that work on tokens one by one.
	let transformedTokens = [];
	for (let i = 0; i < tokens.length; i++) {
		let token = tokens[i];
		if (!isInIgnoredSpan(ignoredSpans, i)) {
			for (let i = 0; i < transformers.length && token; i++) token = applyTransformerToToken(transformers[i], token);
		}
		if (token) transformedTokens.push(token);
	}

	// Next, apply the transformers that work on the whole list of tokens.
	for (let i = 0; i < transformers.length && transformedTokens.length > 0; i++) {
		const transformer = transformers[i];
		if (typeof transformer.transformTokens === 'function') {
			transformedTokens = transformer.transformTokens(transformedTokens);
		}
	}

	// Finally, reconstruct the tokens into the code they represent.
	return transformedTokens.map(reconstructTextOfToken).join('');
}

function applyTransformerToToken(transformer, token) {
	switch (token.type) {
		case TokenType.Action:
			if (typeof transformer.transformAction === 'function') token = transformer.transformAction(token);
			if (token && !isComment(token)) {
				token.innerTokens = token.innerTokens //
					.map((t) => applyTransformerToToken(transformer, t))
					.filter(Boolean);
			}
			break;
		case TokenType.ActionComponent:
			if (typeof transformer.transformActionComponent === 'function') {
				token = transformer.transformActionComponent(token);
			}
			break;
		case TokenType.String:
			if (typeof transformer.transformString === 'function') token = transformer.transformString(token);
			break;
		case TokenType.Text:
			if (typeof transformer.transformText === 'function') token = transformer.transformText(token);
			break;
	}

	return token;
}

function isInIgnoredSpan(ignoredSpans, index) {
	return ignoredSpans.some(([start, end]) => index >= start && index <= end);
}

function getIgnoredSpans(tokens) {
	const ignoredSpans = [];
	let i = 0;
	while (i < tokens.length) {
		const startIndex = i;
		const token = tokens[i++];
		if (!isComment(token) || extractCommentText(token).trim() !== '@ym-disable') continue;
		while (i < tokens.length && (!isComment(tokens[i]) || extractCommentText(tokens[i]).trim() !== '@ym-enable')) i++;
		ignoredSpans.push([startIndex, i]);
	}

	return ignoredSpans;
}

const defaultConfig = Object.assign(Object.create(null), {
	removeIndents: true,
	renameVariables: true,
	shortenDeclarations: true,
	stripComments: true,
	stripTrimMarkers: false,
	trimInActions: true,
	trimStartAndEnd: true,
	trimText: false,
});

const configKeys = Object.keys(defaultConfig);

function extractConfig(tokens) {
	const config = { ...defaultConfig };
	for (const token of tokens) {
		if (!isComment(token)) continue;
		const commentText = extractCommentText(token).trim();
		if (!commentText.startsWith('@ym-config')) continue;

		const options = commentText
			.slice('@ym-config'.length)
			.trim()
			.split(/\s*,\s*/);
		for (const option of options) {
			if (!/^[+-]/.test(option)) {
				throw new Error('Options must start with a - or + to indicate whether or not they are enabled.');
			}

			const key = option.slice(1);
			if (!configKeys.includes(key)) {
				const configKeyList = configKeys.map((key) => `'${key}'`).join(', ');
				throw new Error(
					`Unknown config key '${option.slice(1)}'; available configuration options are: ${configKeyList}`,
				);
			}

			config[key] = option.startsWith('+');
		}
		break;
	}

	return config;
}
