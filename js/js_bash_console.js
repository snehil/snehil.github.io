(() => {
	class Resource {
		constructor(name, type, contents, desc) {
			// Enum
			const resourceType = {
				dir : 'dir',
				txt : 'txt',
				url : 'url'
			};

			// Arg validation
			try {
				for (const arg of arguments) {
					validateArg(arg);
				}

				if (!resourceType[type]) throw new Error(`Unsupported resource type: ${type}`); 
			} catch (ex) {
				console.log(ex);
			}

			this._name     = name;     // string
			this._type     = type;     // string
			this._contents = contents; // Array or string
			this._desc     = desc;     // string
		}

		get name()     { return this._name     }
		get type()     { return this._type     }
		get contents() { return this._contents }
		get desc()     { return this._desc     }
	}

	class Commands {
		constructor(element) {
			// Arg validation
			try {
				validateArg(element);
			} catch (ex) {
				console.log(ex);
			}

			this._parentElement = element;
			this._cwdContext    = this._parentElement;
		}

		execute(usrInput, cmd) {
			console.log(`User Input: ${usrInput}`);
			console.log(`Command   : ${cmd}`);
			console.log(cmd);

			switch(cmd) {
			    case 'ls': {
			    	console.log(`Executing command: ${cmd}`);
			    	break;
			    }
			    case 'cd': {
			    	console.log(`Executing command: ${cmd}`);
			    	break;
			    }
			   	case 'clear': {
			    	console.log(`Executing command: ${cmd}`);
			    	break;
			    }
			  	case 'cat': {
			    	console.log(`Executing command: ${cmd}`);
			    	break;
			    }
			    case 'pwd': {
			    	console.log(`Executing command: ${cmd}`);
			    	break;
			    }
			    default: {
			    	console.log(`Unsupported Terminal Command ${cmd}`);
			    }
			}
		}

		isValid(cmd) {
			const commands = ['ls', 'cd', 'clear', 'cat', 'pwd'];
			let isValid    = commands.includes(cmd);

			if (typeof(cmd) === 'string') {
				const words = cmd.split(' ');

				if (words.length > 1) {
					isValid = commands.includes(words[0]);
				}
			}

			return isValid;
		}

		extract(cmd) {
			let extractedCmd = '';

			const commands = ['ls', 'cd', 'clear', 'cat', 'pwd'];
			let isValid    = commands.includes(cmd);

			if (isValid) {
				for (const curCmd of commands) {
					if (cmd.includes(curCmd)) 
						extractedCmd = curCmd;
				}
			}

			if (typeof(cmd) === 'string') {
				const words = cmd.split(' ');

				if (words.length > 1) {
					isValid = commands.includes(words[0]);
					extractedCmd = words[0];
				}
			}

			return extractedCmd;
		}

		set cwdContext (cwd) { this._cwdContext = cwd  }
        get cwdContext ()    { return this._cwdContext }
	}

	class Terminal {
		constructor(fs, commands, $element, username, password) {
			// Arg validation
			try {
				validateArg(fs);
				validateArg(commands);
			} catch (ex) {
				console.log(ex);
			}

			this.cwd         = '~';
			this._cmdQueue   = [];
			this._cmdHist    = [];
			this._commands   = commands;
			this._curCmd     = '';
			this._cmdHistPtr = -1;
			this._userName   = username;
			this._password   = password;
			this._host       = 'github.com';
			this.setupKeyListener();
			this.init(fs, $element);
		}

		setupKeyListener() {
			// Alphanumeric keys
			window.onkeypress = (e) => {			
				// Save current command in CMD history
				if (e.key === 'Enter' || e.keyCode === 13) {
					this._cmdHist.push(this._curCmd); 
					this._commands.execute(this._curCmd, this._commands.extract(this._curCmd));
					this._curCmd     = '';
					this._cmdHistPtr = this._cmdHist.length - 1;
					console.log(`Command added to history:  + ${this._curCmd}`);
					console.log(this._cmdHist);
				} else {
					// Build current Command
					this._curCmd = this._curCmd + e.key;
				}
	        };

	        // Arrrow Keys
	        window.onkeydown = (e) => {
				if (this._cmdHistPtr === -1) {
					this._cmdHistPtr = (this._cmdHist.length > 0) ? this._cmdHist.length : 0;
				}

				if (this._cmdHistPtr === this._cmdHist.length) {
					this._cmdHistPtr = (this._cmdHist.length > 0) ? 0 : -1;
				}
			
				if (e.key === 'ArrowUp' || e.keyCode === 38 && this._cmdHist.length > 0) {
					this._cmdHistPtr--;
				}

				if (e.key === 'ArrowDown' || e.keyCode === 40 && this._cmdHist.length > 0) {
					this._cmdHistPtr++;
				}
	        };
		}

		init(fs, $element) {
			this.resetPwd();

			$element.append('<div class="js_bash_console">js_bash_console $ login</div>');
			const $bashConsole = $element.find('.js_bash_console');
			$bashConsole.append(`<div>Username: <span class="command">${this._userName}</span></div>`);
			$bashConsole.append(`<div>password: <span class="command">${this._password}</span></div>`);
			$bashConsole.append(`<span class="prompt"><span class="user">${this._userName}</span>@<span class="host">${this._host}</span>:<span class="cwd">${this.cwd}</span></span`);

			console.log(fs);
			console.log($element);
		}

		enqueue(usrInpt) {
			if (this._commands.isValid(usrInpt)) {
				this._cmdQueue.push(usrInpt);
			} else {
				console.log(`Invalid User Input: ${usrInpt}, Unable to enqueue.`);
			}
			return this;
		}

		execute() {
			for (const cmd in this._cmdQueue.push(usrInpt)) {
				console.log('Executing command: ' + cmd);

			}
		}

		set cwd (cwd) { 
			this._cwd = cwd;  
		}

        get cwd () { 
        	return this._cwd; 
        }

		resetPwd () {
			this._pwd = '~';
		}

		loadFS(file) {
			return new Promise((resolve, reject) => {
				const ajax = new XMLHttpRequest();

		        ajax.onreadystatechange = () => {
		            if (ajax.readyState === 4 && ajax.status === 200)
		               return resolve(ajax.responseText);
		        };

		        ajax.open('GET', file);
		        ajax.send();
			});
	    };
	}

	// GLOBALS
	const validateArg = (prop) => {
		if (!prop) throw new Error(`Invalid property type`);
	};

	// Build File System
	const fs = new Resource('~', 'dir', [
		new Resource('README',   'txt', `
			My name is Snehil Wakchaure. I am a Software Engineer at Cerner Corporation. This is my Website.

			If you need help type 'help'.

			You can contact me at snehil.w@gmail.com or send me a message on LinkedIn.

			`, 'README'),

		new Resource('resume', 'url', 'https://github.com/snehil/snehil.github.io', 'Resume'),

		new Resource('papers', 'dir', [
			new Resource('MS_scholarly_paper', 
						 'url', 
						 'https://github.com/snehil/MS-Content/blob/master/Snehil_MS_Scholarly_paper_SP13_McEleice_and_Niederreiter_Cryptosystems.pdf',    
						 'MS Degree Scholarly Paper'),

			new Resource('MS_research_paper',  
						 'url', 
						 'https://github.com/snehil/MS-Content/blob/master/Snehil_ECE646_paper_Implementation_Of_A_Secure_Distributed_Storage_System.pdf', 
						 'MS_Research_Paper')

		], 'Papers Directory')
	], 'Root Directory');

	const $elem = $('body');
	const term = new Terminal(fs, new Commands($elem), $elem, 'snehil', '*********');
})();