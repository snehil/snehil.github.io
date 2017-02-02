(($) => {

	class Terminal {
		constructor(opts) {
			if (!opts) {
				throw new Error(`Invalid Options. Please pass an object with the following parameters:
					{
				    	domId        : this,                 (required)
				    	user         : 'snehil',             (required)
				    	pwd          : '********',           (required)
				    	email        : 'snehil.w@gmail.com',
				    	showLoginMsg : true
				    }
				`);
			}

			this.$root         = opts.domId;
		    this.fs            =   new FileSystem(this);  
		    this.interpreter   =   new Interpreter(this);
	        this.cwd           = '~';   
	        this.email         = (opts.email) ? opts.email : 'root@github.com'; 
	        this.usr           = this.email.split('@')[0];
	        this.host          = this.email.split('@')[1];
	        this.commandHist   = [];
			this.curCmdHistIdx = 0;

	        $(this.$root).css('background-color', 'black');
	        this.login(opts.user || '', opts.pwd || '', opts.showLoginMsg);

	        this.fsTree = this.fs.loadFS();
		}

		login(user, pwd, showWelcomeMsg) {
			if (!user) {
				this.displayMsg('Invalid user name entered.', 'InvalidUsrMsg', 'js_bash_console');
				return;
			}

			if (!pwd) {
				this.displayMsg('Invalid password entered.', 'InvalidPwdMsg', 'js_bash_console');
				return;
			}

			if (showWelcomeMsg) {
				this.displayMsg('js_bash_console $ login', 'loginMsg', 'js_bash_console');
				this.displayMsg(`Username: ${user}`      , 'usrMsg'  , 'js_bash_console');
				this.displayMsg(`Password: ${pwd}`       , 'pwdMsg'  , 'js_bash_console');
			}

			this.interpreter.disableKeyListener();

			this.showNewPromptWithMsg('Hi!');
			this.addDelay(1200)
	            .then(() => {
                    this.showNewPromptWithMsg('I am Snehil.');
                    return this.addDelay(1500);
                })
               	.then(() => {
                    this.showNewPromptWithMsg('I am a Software Engineer. This is my website.');
                    return this.addDelay(5000);
                })
               	.then(() => {
               		this.showNewPromptWithMsg(`Type 'help' or one of the following:`);
               		return this.addDelay(4100);
               	})
               	.then(() => {
               		this.displayMsg('resume'  , 'opt0', this.$root.find('prompt:last'));
               		this.displayMsg('skills'  , 'opt1', this.$root.find('prompt:last'));
                    this.displayMsg('github'  , 'opt2', this.$root.find('prompt:last'));
               		this.displayMsg('facebook', 'opt3', this.$root.find('prompt:last'));
               		this.displayMsg('linkedin', 'opt4', this.$root.find('prompt:last'));
               		this.displayMsg('phone'   , 'opt5', this.$root.find('prompt:last'));
               		this.interpreter.enableKeyListener();
               		this.showNewPromptWithMsg('');
                })
                .catch(err => {
                	throw new Error(err);
                });
		}

		addDelay(delay) {
			return new Promise((resolve, reject) => setTimeout(() => resolve(), delay));
		}

		showNewPromptWithMsg(message) {
			this.displayNextPrompt();
			this.updateCurPromptTxt(message || '', this.$root.find('.prompt:last'));
		}

		displayMsg(text, msgId, $displayAfter) {
			if (!$displayAfter) return;

			this.clearAllCursors();

			msgId = msgId || Math.floor((Math.random() * 100) + 1);

			$('<div>')
				.append(
					$('<span>')
						.attr('id', `${msgId}`)
						.addClass('js_bash_console')
						.html(`${text || ''}`)
						.css('margin-left', '4px'))
				.appendTo(this.$root);

			this.type(text, this.$root.find(`${msgId}`));
		}

		displayNextPrompt() {
			this.clearAllCursors();

			$('<div>')
			    .addClass('prompt')
			    .html(
			    	$('<span>')
			    		.addClass('user')
			    		.html(`${this.usr}`)
			    		.append(
				    		$('<span>')
				    			.addClass('js_bash_console')
				    			.html('@'))
			    		.append(
			    			$('<span>')
			    				.addClass('host')
			    				.html(`${this.host}:`))
			    		.append(
			    			$('<span>')
			    				.addClass('cwd')
			    				.html(`${this.cwd}`))
			    )
			    .css('margin-bottom', '0px')
			    .appendTo(this.$root);
		}

		updateCurPromptTxt(text, $appendTo) {
			$($appendTo)
				.append(
					$('<span>')
						.attr('id', 'bash_cursor')
						.addClass('js_bash_console')
						.css('margin-left', '4px')
						.append(
							$('<span>')
								.attr('id', 'caption')
								.html(`${text}`))
						.append(
							$('<span>')
								.attr('id', 'cursor')
								.html('|')));

			this.captionLength = 0;
			this.type(text, $appendTo.find('#caption'));
			this.setupCursor();
		}

		setupCursor() {
			const setupCursorAnimation = () => {
			    $('#cursor')
				    .animate({
				        opacity: 0
				    }, 'fast', 'swing')
				    .animate({
				        opacity: 1
				    }, 'fast', 'swing');
			};

			setInterval(setupCursorAnimation, 900);
		}

		clearAllCursors() {
			$('#cursor').remove()
		}

		typeOnNextLine(text) {
			//this.type(message, );
			const nextDiv = $('<div>')
				.append(
					$('<span>')
						.attr('id', `yeah`)
						.addClass('js_bash_console')
						.html(``)
						.css('margin-left', '4px'))
				.appendTo(this.$root);

			this.type(text, nextDiv);
		}

		type(caption, $typeHere) {
			if (!caption) {
				caption = '';
			}

			let captionLength = 0;

			const typeText = () => {
				$typeHere.html(caption.substr(0, captionLength++));

			    if(captionLength < caption.length+1) {
			        setTimeout(typeText, 110);
			    } else {
			        captionLength = 0;
			    }
			};

			typeText();
		}

		updatePromptWithUsrInput(keyPressed) {
			const $activePrompt = this.getActivePromptElem();

			// Append keyPressed to active Prompt text
			let currentUserTxt = this.$root.find('.prompt:last #caption').html();
			this.$root.find('.prompt:last #caption').html(currentUserTxt.concat(keyPressed));
		}

		clearPromptUsrInput() {
			const $activePrompt = this.getActivePromptElem();
			this.$root.find('.prompt:last #caption').html('');
		}

		deleteCharFromUsrInput() {
			let currentUserTxt = this.$root.find('.prompt:last #caption').html();

			if (currentUserTxt && currentUserTxt.length > 0) {
				currentUserTxt = currentUserTxt.substring(0, currentUserTxt.length-1);
				this.$root.find('.prompt:last #caption').html(currentUserTxt);
			}
		}

		getActivePromptElem() {
			return this.$root.find('.prompt:last');
		}

		addCommandToHistory(command) {
			this.commandHist.push(command);
			this.curCmdHistIdx = this.commandHist.length;
		}
	}

	class FileSystem {
		constructor(terminal) {
			if (!terminal) {
				throw new Error('Invalid terminal.');
			}

			this.term      = terminal;
			this.fsTree    = this.loadFS();
			this.nodeTypes = {
				URL : 'url',
				DIR : 'dir'
			};
		}

		isRoot(name) {
			return name === '~'; 
		}

		getParentName(name) {
			if (this.isRoot()) return '~';

			const fs           = this.fsTree;
			const searchedNode = this.recursiveSearch(fs, name);

			return (searchedNode && searchedNode.parent) ? searchedNode.parent : '~';
		}

		recursiveSearch(node, nameToSearch) {
			if (node && node.name && node.name === nameToSearch) {
				return node;
			}

			if (node && node.contents && $.isArray(node.contents) && node.contents.length > 0) {
				for (const content of node.contents) {
					let searchedNode = this.recursiveSearch(content, nameToSearch);

					if (searchedNode) {
						return searchedNode;
					} 
				}
			}

			return null;
		}

		isDirectory(name) {
			const fs           = this.fsTree;
			const searchedNode = this.recursiveSearch(fs, name);

			if (!searchedNode) return false;

			if (searchedNode && searchedNode.contents && !$.isArray(searchedNode.contents)) {
				return false;
			}

			if (searchedNode && searchedNode.type && searchedNode.type === this.nodeTypes.DIR) {
				return searchedNode;
			}

			return false;
		}

		getChildren(name) {
			const dirNode = this.isDirectory(name);

			if (dirNode && dirNode.contents) return dirNode.contents;

			return [];
		}

		linkify(inputText, displayName) {
		    let replacedText, replacePattern1, replacePattern2;

		    if (inputText.length > 0) {
		        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		        replacedText    = inputText.replace(replacePattern1, `<a href="$1" target="_blank">${displayName}</a>`);

		        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		        replacedText    = replacedText.replace(replacePattern2, `$1<a href="http://$2" target="_blank">${displayName}</a>`);

		        return replacedText;
		    } else {
		        return inputText;
		    }
		}

		loadFS() {
			return {
				"name": "~",
				"type": "dir",
				"desc": "Root Directory",
				"contents": [
					{
						"name": "github",
						"type": "url",
						"contents": "https://github.com/snehil/snehil.github.io",
						"desc": "Github",
						"parent": "~"
					}, 
					{
						"name": "resume",
						"type": "url",
						"contents": "https://github.com/snehil/snehil.github.io/blob/master/docs/Snehil_CV.pdf",
						"desc": "Resume",
						"parent": "~"
					}, 
					{
						"name": "linkedin",
						"type": "url",
						"contents": "https://www.linkedin.com/in/snehilwakchaure",
						"desc": "LinkedIn Profile",
						"parent": "~"
					}, 
					{
						"name": "facebook",
						"type": "url",
						"contents": "https://www.facebook.com/snehil.wakchaure",
						"desc": "FaceBook Profile",
						"parent": "~"
					}, 
					{
						"name": "projects",
						"type": "dir",
						"parent": "~",
						"desc": "Projects",
						"contents": [
							{
								"name": "website",
								"type": "url",
								"parent": "projects",
								"contents": "https://github.com/snehil/snehil.github.io",
								"desc": "Website code"
							}
						]
					},
					{
						"name": "papers",
						"type": "dir",
						"parent": "~",
						"desc": "MS Research Papers",
						"contents": [
							{
								"name": "scholarlypaper",
								"type": "url",
								"parent": "papers",
								"contents": "https://github.com/snehil/MS-Content/blob/master/Snehil_MS_Scholarly_paper_SP13_McEleice_and_Niederreiter_Cryptosystems.pdf",
								"desc": "Study Of McEliece & Niederreiter Cryptosystems"
							}, 
							{
								"name": "gradprojects",
								"type": "dir",
								"parent": "papers",
								"contents": [
									{
										"name": "cryptosystem",
										"type": "url",
										"parent": "foo",
										"contents": "https://github.com/snehil/MS-Content/blob/master/Snehil_ECE646_paper_Implementation_Of_A_Secure_Distributed_Storage_System.pdf",
										"desc": "Implementation Of A Secure Distributed Storage System"
									}
								]
							}
						]
					}
				]
			};
		}
	}

	class Command {
		constructor(opts, action) {
			if (!opts) {
				throw new Error(`Invalid Options. Please pass an object with the following parameters:
					{
				    	domId        : this,                 (required)
				    	user         : 'snehil',             (required)
				    	pwd          : '********',           (required)
				    	email        : 'snehil.w@gmail.com',
				    	showLoginMsg : true
				    }
				`);
			}

			this.name   = opts.name;
			this.option = opts.option || '';
			this.action = action;
		}

		execute() {
			this.action();
		}
	}

	class Interpreter {
		constructor(terminal) {
			if (!terminal) {
				throw new Error('Invalid terminal.');
			}

			this.term               = terminal;
			this.keyListenerEnabled = false; // Default
			this.userCommand        = '';
			this.validCommands      = [];
			this.buildCommandsList();
			this.setupKeyListener();
		}

		getCurDirName() {
			 return this.term.cwd.match(/([^\/]*)\/*$/)[1]; 
		}

		displayChildrenInfo() {
			let children = this.term.fs.getChildren(this.getCurDirName());

			const appendSpaces = (row, fileName) => {
				const spacedNeeded = 20 - fileName.length;

				for (let i=0; i<spacedNeeded; i++) {
					row += ' ';
				}

				return row;
			}

			children = children.filter((obj) => obj.name !== 'NAME');

			children.unshift({
				name: 'NAME',
				type: 'TYPE',
				desc: 'DESCRIPTION'
			});

			for (const child of children) {
				let row = '';

				if (child && child.name) {
					row += child.name;
					row = appendSpaces(row, child.name);
				} 

				if (child && child.type) {
					row += child.type;
					row = appendSpaces(row, child.name);
				} 

				if (child && child.desc) {
					row += child.desc;
					row = appendSpaces(row, child.name);
				} 

				this.term.displayMsg(row, 'lslChld', this.term.$root.find('prompt:last'));
			}
		}

		buildCommandsList() {
			this.validCommands.push(new Command({
				name   : 'github',
				option : ''
			}, () => {
				window.open('https://github.com/snehil', '_blank');
			}));

			this.validCommands.push(new Command({
				name   : 'resume',
				option : ''
			}, () => {
				window.open('https://github.com/snehil/snehil.github.io/blob/master/docs/Snehil_CV.pdf', '_blank');
			}));

			this.validCommands.push(new Command({
				name   : 'facebook',
				option : ''
			}, () => {
				window.open('https://www.facebook.com/snehil.wakchaure', '_blank');
			}));

			this.validCommands.push(new Command({
				name   : 'linkedin',
				option : ''
			}, () => {
				window.open('https://www.linkedin.com/in/snehilwakchaure', '_blank');
			}));

			this.validCommands.push(new Command({
				name   : 'phone',
				option : ''
			}, () => {
				this.term.displayMsg('(703)220 8882'  , 'phone', this.term.$root.find('prompt:last'));
			}));

			this.validCommands.push(new Command({
				name   : 'email',
				option : ''
			}, () => {
				this.term.displayMsg('snehil.w@gmail.com'  , 'emailAddr', this.term.$root.find('prompt:last'));
			}));

			this.validCommands.push(new Command({
				name   : 'skills',
				option : ''
			}, () => {
				this.term.displayMsg('Programming languages: Java,          JavaScript,   Python,   R'       , 'lang' , this.term.$root.find('prompt:last'));
				this.term.displayMsg('Web-Development      : Node.js,       Servlets,     JQuery,   Bootstrap,   Knockout,   D3.js,   NGinx '  , 'wdev', this.term.$root.find('prompt:last'));
				this.term.displayMsg('Big-Data             : Hadoop,        Storm,        HBase,    Spark '  , 'bdata', this.term.$root.find('prompt:last'));
				this.term.displayMsg('Virtualization       : Vagrant'                                        , 'virt' , this.term.$root.find('prompt:last'));
				this.term.displayMsg('Machine Learning     : ScikitLearn,   Tensorflow (basic)' 			 , 'ml'   , this.term.$root.find('prompt:last'));
			}));

			this.validCommands.push(new Command({
				name   : 'help',
				option : ''
			}, () => {
				this.term.displayMsg('Try the following commands or navigate the filesystem:', 'help'      , this.term.$root.find('prompt:last'));
				this.term.displayMsg('resume       skills        email 						   ', 'skills' , this.term.$root.find('prompt:last'));
				this.term.displayMsg('github       linkedin 	 facebook   				   ', 'social' , this.term.$root.find('prompt:last'));
				this.term.displayMsg('ls           ls -l         ls -a 						   ', 'ls'     , this.term.$root.find('prompt:last'));
				this.term.displayMsg('clear        cd            cd.. 						   ', 'clr'    , this.term.$root.find('prompt:last'));
				this.term.displayMsg('phone        help     	 pwd	           			   ', 'contact', this.term.$root.find('prompt:last'));
			}));

			this.validCommands.push(new Command({
				name   : 'clear',
				option : ''
			}, () => {
				this.term.$root.empty();
			}));

			this.validCommands.push(new Command({
				name   : 'pwd',
				option : ''
			}, () => {
				this.term.displayMsg(this.term.cwd, 'cwdOpt', this.term.$root.find('prompt:last'));
			}));

			this.validCommands.push(new Command({
				name   : 'ls',
				option : ''
			}, () => {
				const children = this.term.fs.getChildren(this.getCurDirName());

				for (const child of children) {
					if (child && child.name) {
						if (child.type && child.type === this.term.fs.nodeTypes.URL) {
							child.name = this.term.fs.linkify(child.contents ? child.contents : '', child.name);
						} 

						const lastChar = child.name[child.name.length -1];

						if (lastChar === '/') {
			    			child.name = child.name.slice(0,-1);
			    		}

						if (child.type && child.type === this.term.fs.nodeTypes.DIR) {
							child.name = `${child.name}/`;
						} 

						this.term.displayMsg(child.name, 'lsChld', this.term.$root.find('prompt:last'));
					}
				}
			}));

			this.validCommands.push(new Command({
				name   : 'ls',
				option : '-l'
			}, () => {
				this.displayChildrenInfo();
			}));

			this.validCommands.push(new Command({
				name   : 'ls',
				option : '-a'
			}, () => {
				this.displayChildrenInfo();
			}));

			this.validCommands.push(new Command({
				name   : 'cd..',
				option : ''
			}, () => {
				if (this.term.cwd == '~') return;
				const cwd = this.term.cwd;

				this.term.cwd = cwd.substr(0, cwd.lastIndexOf("\/"));
			}));

			this.validCommands.push(new Command({
				name   : 'cd',
				option : ''
			}, () => {
				const children       = this.term.fs.getChildren(this.getCurDirName());
				const userEnteredTxt = this.userCommand.split(' ');

				if (userEnteredTxt.length > 2) {
					return;
				}

			    const userEnteredDirName = userEnteredTxt.pop();

			    // Make sure that it is a valid directory
			    let isValid = false;

			    for (const child of children) {
			    	if (child                             && 
			    		child.name                        && 
			    		child.type                        && 
			    		child.type === this.term.fs.nodeTypes.DIR) {

			    		const lastChar = child.name[child.name.length -1];

			    		if (lastChar === '/') {
			    			child.name = child.name.slice(0,-1);
			    		}

			    		if (child.name === userEnteredDirName) {
			    			isValid = true;
			    		}
			    	}
			    }

			    if (isValid) {
			    	this.term.cwd += `/${userEnteredDirName}`; 
			    } else {
			    	if (userEnteredDirName === '..') {
						const cwd     = this.term.cwd;
						this.term.cwd = cwd.substr(0, cwd.lastIndexOf("\/"));
						return;
			    	}

			    	this.term.displayMsg(`Invalid Directory.`, 'invDir', this.term.$root.find('prompt:last'));
			    }
			}));
		}

		executeTabCommand(childNames) {
			if ($.isArray(childNames) && childNames.length > 1) {
				// Display options
				let tabOpts = '';

				for (const childName of childNames) {
					tabOpts += `${childName} 		`;
				}

				this.term.displayMsg(tabOpts, 'tabOpts', this.term.$root.find('prompt:last'));
				this.term.showNewPromptWithMsg(this.userCommand);
			} else {
				// Autocomplete command for the user
				const userEnteredTxt   = this.userCommand.split(' ');

				if (userEnteredTxt.length > 2) {
					return;
				}

			    this.userCommand = userEnteredTxt.shift().concat(` ${childNames}`);

				const $activePrompt = this.term.getActivePromptElem();
				this.term.$root.find('.prompt:last #caption').html(this.userCommand);
			}
		}

		enableKeyListener() {
			this.keyListenerEnabled = true;
		}

		disableKeyListener() {
			this.keyListenerEnabled = false;
		}

		clearCommandCache() {
			this.userCommand = '';
		}

		handleUpKeyPress() {
	    	let curHistPtr = this.term.curCmdHistIdx;

	    	if (curHistPtr === 0) return;

	    	if (curHistPtr > 0) {
	    		this.term.curCmdHistIdx--;
	    		this.term.clearPromptUsrInput();
		    	this.term.updatePromptWithUsrInput(this.term.commandHist[curHistPtr-1]);
		    	this.userCommand = this.term.commandHist[curHistPtr-1];
	    	}
		}

		handleDownKeyPress() {
	    	let curHistPtr = this.term.curCmdHistIdx+1;

	    	if (curHistPtr < this.term.commandHist.length) {
	    		this.term.curCmdHistIdx++;
	    		this.term.clearPromptUsrInput();
	    		this.term.updatePromptWithUsrInput(this.term.commandHist[curHistPtr]);
	    		this.userCommand = this.term.commandHist[curHistPtr];
	    	}
		}

		handleTabKeyPress() {
			const curDirName = this.getCurDirName(); 

	    	if (!this.term.fs.isDirectory(curDirName)) return;
	    	
	    	const children = this.term.fs.getChildren(curDirName);

	    	if (!children || children === [] || !$.isArray(children) || children.length < 1) return;

	    	const childNames       = [];
	    	const userEnteredTxt   = this.userCommand.split(' ');
	    	const txtFromUsrCmdlen = userEnteredTxt.length;
	    	const txtFromUsrCmd    = userEnteredTxt[txtFromUsrCmdlen-1];

	    	// Find dir contents with similar name
	    	for(const child of children) {
	    		if (child && child.name && child.name.includes(txtFromUsrCmd)) {

		    		const lastChar = child.name[child.name.length -1];

		    		if (lastChar === '/') {
		    			child.name = child.name.slice(0,-1);
		    		}

	    			childNames.push(child.name);
	    		}
	    	}

	    	// Print the available options on screen
	    	this.executeTabCommand(childNames);
		}

		setupKeyListener() {
			$(window).keydown((e) => {
				if (!this.keyListenerEnabled) return; 

				// TODO: Replace this block by a switch-case
		        if(e.which === 13) {        // Enter key pressed
			       	this.executeIfCommandEntered();
			       	this.clearCommandCache();
			    } else if (e.which === 9) { // Tab key pressed
			    	this.handleTabKeyPress();
			    } else if (e.which === 8) { // Backspace key pressed
			    	if (this.userCommand.length > 0) {
			    		this.userCommand = this.userCommand.substring(0, this.userCommand.length-1);
			    	}

			    	this.term.deleteCharFromUsrInput();
			    } else if (e.which === 189) { // Hyphen key pressed
			    	const keyChar = '-';

			    	this.userCommand = this.userCommand.concat(keyChar);
			    	this.term.updatePromptWithUsrInput(keyChar);
			    } else if (e.which === 190) { // Period key pressed
			    	const keyChar = '.';

			    	this.userCommand = this.userCommand.concat(keyChar);
			    	this.term.updatePromptWithUsrInput(keyChar);
			    } else if (e.which === 38) { // Up key pressed
			    	this.handleUpKeyPress();
			    } else if (e.which === 40) { // Down key pressed
			    	this.handleDownKeyPress();
			    } else {
			    	const keyChar = String.fromCharCode(e.which).toLowerCase();

			    	this.userCommand = this.userCommand.concat(keyChar);
			    	this.term.updatePromptWithUsrInput(keyChar);
			    }
		    });
		}

		executeIfCommandEntered() {
			if (this.isValidCommandIsEntered()) {
				this.executeCommand();
			} else {
				this.displayInvalidCmdMsg();
			}	
			this.term.showNewPromptWithMsg('');
		}

		displayInvalidCmdMsg() {
			this.term.displayMsg(`Invalid command. Try 'help' for more options.`, 'loginMsg', 'js_bash_console');
		}

		executeCommand() {
			const command   = this.userCommand.split(' ');
			const cmdName   = command[0];
			const cmdOption = command[1] || '';

			this.term.addCommandToHistory(this.userCommand);

			for (const command of this.validCommands) {
				if (command.name === cmdName && cmdName === 'cd') {
					command.execute();
					break;
				}

				if (command.name === cmdName && command.option === cmdOption) {
					command.execute();
					break;
				}
			}
		}

		isValidCommandIsEntered() {
			if (this.userCommand === '') return true;

			const command   = this.userCommand.split(' ');
			const cmdName   = command[0];
			const cmdOption = command[1] || '';
			let   isValid   = false;

			for (const command of this.validCommands) {
				if (command.name === cmdName && cmdName === 'cd') {
					isValid = true;
					break;
				}

				if (command.name === cmdName && command.option === cmdOption) {
					isValid = true;
					break;
				}
			}

			return isValid;
		}
	}

	class Utils {
		static validateArg(arg) {
			if (!arg) throw new Error(`Invalid Argument`);
		}
	}

    $.fn.jsLinuxConsole = function () {
	    const term = new Terminal({
	    	domId        : this,                
	    	user         : 'snehil',           
	    	pwd          : '********',         
	    	email        : 'snehil.w@gmail.com',
	    	showLoginMsg : true
	    });
	};
	
})(jQuery);