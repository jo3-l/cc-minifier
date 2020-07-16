const editor = CodeMirror.fromTextArea(
	document.getElementById('input'),
	{
		lineNumbers: true,
		theme: 'ayu-dark',
		mode: 'text/x-go',
		autofocus: true,
		smartIndent: false,
	},
);
const output = CodeMirror.fromTextArea(
	document.getElementById('output'),
	{
		lineNumbers: true,
		readOnly: true,
		theme: 'ayu-dark',
		mode: 'text/x-go',
	},
);

const MARKDOWN_SECTION = /##.+\s+```.*\s+([\S\s]+)\s*```\s*$/;
const COMMENTS = /{{(-\s+)?\/\*[\S\s]+?\*\/(\s+-)?}}/g;
const RIGHT_BRACKETS = /{{-?\s+/g;
const LEFT_BRACKETS = /\s+-?}}/g;
const INDENTS = /\t+/g;
const BLANK_LINES = /}}\s+{{/g;
const ASSIGNMENT = /\$(\w+)(?:\s+:=\s*|\s*:=\s+)/g;
const REASSIGNMENT = /\$(\w+)\s+=\s*/g;
const VARIABLES = /(\w+)\s*:=/g;
const KEEP_VARIABLE_NAMES = /{{(?:-\s+)?\/\*\s*@ym-keep\s+([\w,\s]+?)\s*\*\/(\s+-)?}}/

function* createIdentifierGenerator(existing) {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
	for (let x = 0; x < chars.length; x++) {
		const gen = chars[x];
		if (existing.has(gen)) continue;
		yield gen;
	}
	for (let y = 0; y < chars.length; y++) {
		for (let x = 0; x < chars.length; x++) {
			const gen = chars[y] + chars[x];
			if (existing.has(gen)) continue;
			yield gen;
		}
	}
	for (let z = 0; z < chars.length; z++) {
		for (let y = 0; y < chars.length; y++) {
			for (let x = 0; x < chars.length; x++) {
				const gen = chars[z] + chars[y] + chars[x];
				if (existing.has(gen)) continue;
				yield gen;
			};
		}
	}
}

function minify() {
	const original = editor.getValue();
	if (!original) return;

	let code = original;

	const ignoredVars = new Set();
	const match = KEEP_VARIABLE_NAMES.exec(code);
	if (match) {
		for (const name of match[1]
			.trim()
			.split(/\s*,\s*/g)
			.map(x => x.trim())
			.filter(x => x !== '')
		) ignoredVars.add(name);
	}

	code = code
		.replace(COMMENTS, '')
		.replace(RIGHT_BRACKETS, '{{') // '{{ ' -> '{{'
		.replace(LEFT_BRACKETS, '}}') // ' }}' -> '}}'
		.replace(ASSIGNMENT, '$$$1:=') // $a := b -> $a:=b
		.replace(REASSIGNMENT, '$$$1 =') // $a = b -> $a =b
		.replace(INDENTS, '')
		.replace(BLANK_LINES, '}}{{')
		.trim();

	const variables = new Set();
	for (const match of code.matchAll(VARIABLES)) if (!ignoredVars.has(match[1])) variables.add(match[1]);

	const nameGenerator = createIdentifierGenerator(variables);
	for (const variable of [...variables].sort((a, b) => b.length - a.length)) {
		code = code.replace(
			new RegExp(`\\$${variable}`, 'g'),
			`$$${nameGenerator.next().value}`,
		);
	}

	output.setValue(code);
}