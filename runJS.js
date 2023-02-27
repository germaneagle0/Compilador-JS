'use strict';

let error = false;

const showError = (msg) => {
	console.error(msg);
};

const codeHasError = (boolean) => {
	error = boolean;
	const codeElem = document.getElementById('code');

	if (boolean && !codeElem.classList.contains('error')) {
		document.getElementById('code').classList.add('error');
	}
	if (!boolean && codeElem.classList.contains('error')) {
		document.getElementById('code').classList.remove('error');
	}
};

const putChar = (elem, text) => {
	elem.value =
		elem.value.substring(0, codeElem.selectionStart) +
		text +
		elem.value.substring(codeElem.selectionStart);
};

const action = (fn) => {
	setTimeout(() => {
		fn();
	}, 0);
};

const checkWhileError = (error) => {
	if (error) {
		console.log('enter');
		try {
			prettier.format(codeElem.value, {
				parser: 'babel',
				plugins: prettierPlugins,
			});
			codeHasError(false);
		} catch (e) {
			codeHasError(true);
			return;
		}
	}
};

const tabRule = (e) => {
	if (e.key === 'Tab') {
		e.preventDefault();
		const start = codeElem.selectionStart;
		const end = codeElem.selectionEnd;
		codeElem.value =
			codeElem.value.substring(0, start) + '\t' + codeElem.value.substring(end);
		codeElem.selectionStart = codeElem.selectionEnd = start + 1;
	}
};

const enterRule = (e) => {
	if (e.key === 'Enter') {
		try {
			const lastKey = codeElem.value[codeElem.selectionStart - 1];
			if (lastKey === '{' || lastKey === '(' || lastKey === '[') {
				action(() => {
					const last = codeElem.selectionStart - 1;
					putChar(codeElem, '\n');
					codeElem.selectionStart = codeElem.selectionEnd = last + 1;
				});
				return;
			}
			codeElem.value = prettier.format(codeElem.value, {
				parser: 'babel',
				plugins: prettierPlugins,
			});
			codeHasError(false);
		} catch (e) {
			codeHasError(true);
			showError(e);
		}
	}
};

const tagRule = (e) => {
	if (e.key === '{' || e.key === '(' || e.key === '[') {
		action(() => {
			const location = codeElem.selectionEnd;
			const newKey = e.key === '{' ? '}' : e.key === '(' ? ')' : ']';
			putChar(codeElem, newKey);
			codeElem.selectionEnd = codeElem.selectionStart = location;
		});
	}
};

const stringRule = (e) => {
	if (e.key === "'" || e.key === '"') {
		action(() => {
			const location = codeElem.selectionEnd;
			putChar(codeElem, e.key);
			codeElem.selectionEnd = codeElem.selectionStart = location;
		});
	}
};

const codeElem = document.getElementById('code');
codeElem.addEventListener('keydown', (e) => {
	checkWhileError(error);
	tabRule(e);
	enterRule(e);
	tagRule(e);
	stringRule(e);
});

let counter = 1;

let logs = [];
let new_logs = [];

const print = (buffer, type) => {
	let sequence = { strings: [], type: type };
	for (const val of buffer) {
		sequence.strings.push(val);
	}
	new_logs.push(sequence);
	logs = [...logs, ...new_logs];
	showLogs();
	new_logs = [];
};

const printLog = (...args) => {
	print(args, 'log');
};

const printError = (...args) => {
	print(args, 'error');
};

const showLogs = () => {
	if (new_logs.length === 0) {
		return;
	}
	const resultElement = document.getElementById('resultado');
	let counterElem = document.createElement('div');
	counterElem.className = 'counter';
	let counterText = document.createElement('span');
	counterText.className = 'counter-text';
	counterText.innerText = counter.toString();
	counterElem.appendChild(counterText);
	counter++;

	for (const log of new_logs) {
		let elem = document.createElement('div');
		elem.className = log.type;
		let text = log.strings.join(' ');
		elem.innerHTML = text;
		counterElem.appendChild(elem);
	}
	resultElement.appendChild(counterElem);

	const elemScroll = document.querySelector('.resultContainer');
	elemScroll.scroll({ top: resultElement.scrollHeight, behavior: 'smooth' });
};

const runUserJavascript = () => {
	new_logs = [];
	let userScript = document.getElementById('code').value;
	userScript = userScript.replaceAll(/console.log/g, 'printLog');
	userScript = userScript.replaceAll(/console.error/g, 'printError');
	userScript = userScript.replaceAll(/(?<![\w\d])var(?![\w\d])/g, 'let');
	try {
		if (userScript.includes('document')) {
			throw 'You are not allowed to use document';
		}
		if (!userScript) {
			throw 'You must write some code';
		}
		const result = eval(userScript);
		if (result !== undefined && !(result instanceof Promise)) {
			printLog('Return value: ', result);
		}
	} catch (e) {
		printError(e);
	}
	logs = [...logs, ...new_logs];
	showLogs();
};

const clearLogs = () => {
	const resultElement = document.getElementById('resultado');
	resultElement.innerHTML = '';
	counter = 1;
};

const saveFile = (name, text) => {
	const link = document.createElement('a');
	const blob = new Blob([text], { type: 'text/plain' });
	link.href = URL.createObjectURL(blob);
	link.download = name;
	link.click();
	URL.revokeObjectURL(link.href);
};

const saveLogs = () => {
	if (logs.length === 0) {
		alert('No logs to save');
		return;
	}
	const textLogs = logs.map((log) => log.strings.join(' ')).join(',\n');
	saveFile('log.txt', textLogs);
};

const saveJS = () => {
	let userScript = document.getElementById('code').value;
	if (!userScript) {
		alert('No code to save');
		return;
	}
	const filename = prompt('Enter filename');
	if (!filename) {
		alert('Write a filename');
		return;
	}
	try {
		saveFile(filename + '.js', userScript);
	} catch (e) {
		alert('Invalid filename');
		return;
	}
};

const loadJS = () => {
	let input = document.createElement('input');
	input.type = 'file';
	input.onchange = (_) => {
		// you can use this method to get file and perform respective operations
		let file = Array.from(input.files)[0];
		if (!file.name.endsWith('.js')) {
			alert('You must select a .js file');
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target.result;
			document.getElementById('code').value = text;
		};
		reader.readAsText(file);
	};
	input.click();
};
