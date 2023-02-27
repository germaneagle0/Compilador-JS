'use strict';

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
