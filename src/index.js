import { minify } from './minifier.js';

const editor = CodeMirror.fromTextArea(document.getElementById('input'), {
	lineNumbers: true,
	theme: 'ayu-dark',
	mode: 'text/x-go',
	autofocus: true,
	smartIndent: false,
});
const output = CodeMirror.fromTextArea(document.getElementById('output'), {
	lineNumbers: true,
	readOnly: true,
	theme: 'ayu-dark',
	mode: 'text/x-go',
});

document.getElementById('minify-btn').addEventListener('click', () => {
	const code = editor.getValue();
	if (code.length > 0) {
		try {
			const minified = minify(code);
			output.setValue(minified);

			const reducedBy = ((1 - minified.length / code.length) * 100).toFixed(2);
			Swal.fire({
				icon: 'success',
				title: 'Successfully minified code!',
				html: `<strong>Before / After:</strong> ${code.length} => ${minified.length} characters<br><strong>Size reduction:</strong> ${reducedBy}&#37;`,
			});
		} catch (error) {
			if (error instanceof SyntaxError) Swal.fire({ icon: 'error', title: 'Syntax Error', text: error.message });
			else Swal.fire({ icon: 'error', title: 'Error', text: error.message });
		}
	} else {
		Swal.fire({ icon: 'warning', title: 'No code provided', text: 'Please input some code to minify.' });
	}
});
