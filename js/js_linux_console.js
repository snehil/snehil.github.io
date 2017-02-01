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

			this.$root       = opts.domId;
		    this.fs          = new FileSystem(this);  
		    this.interpreter = new Interpreter(this);
	        this.cwd         = '~';   
	        this.email       = (opts.email) ? opts.email : 'root@github.com'; 
	        this.usr         = this.email.split('@')[0];
	        this.host        = this.email.split('@')[1];

	        $(this.$root).css('background-color', 'black');
	        this.login(opts.user || '', opts.pwd || '', opts.showLoginMsg);

	        this.fsTree = this.fs.loadFS();
	        console.log(this.fsTree);
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

			this.type(text, this.$root.find(`${msgId}`))
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
	}

	class FileSystem {
		constructor(terminal) {
			if (!terminal) {
				throw new Error('Invalid terminal.');
			}

			this.term = terminal;
		}

		loadFS() {
			return {
			   "name": "~",
			   "type": "dir",
			   "contents": [
			      {
			         "name": "github",
			         "type": "url",
			         "contents": "https://github.com/snehil/snehil.github.io",
			         "desc": "Sample link"
			      },
			      {
			         "name": "papers",
			         "type": "dir",
			         "contents": [
			            {
			               "name": "MS_Scholarly_Paper",
			               "type": "url",
			               "contents": "https://github.com/snehil/MS-Content/blob/master/Snehil_MS_Scholarly_paper_SP13_McEleice_and_Niederreiter_Cryptosystems.pdf",
			               "desc": "Study Of McEliece & Niederreiter Cryptosystems"
			            },
			            {
			               "name": "foo",
			               "type": "dir",
			               "contents": [
			                  {
			                     "name": "MS_Crypt_Research_Paper",
			                     "type": "url",
			                     "contents": "https://github.com/snehil/MS-Content/blob/master/Snehil_ECE646_paper_Implementation_Of_A_Secure_Distributed_Storage_System.pdf",
			                     "desc": "Implementation Of A Secure Distributed Storage System"
			                  }
			               ]
			            }
			         ],
			         "desc": "MS Research Papers"
			      }
			   ],
			   "desc": "Root Directory"
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
				this.term.displayMsg('(703) 220 8882'  , 'phone', this.term.$root.find('prompt:last'));
			}));

			this.validCommands.push(new Command({
				name   : 'email',
				option : ''
			}, () => {
				this.term.displayMsg('snehil.w@gmail.com'  , 'emailAddr', this.term.$root.find('prompt:last'));
			}));

			this.validCommands.push(new Command({
				name   : 'help',
				option : ''
			}, () => {
				this.term.displayMsg('Try the following commands or navigate the filesystem:', 'help'      , this.term.$root.find('prompt:last'));
				this.term.displayMsg('ls           ls -l         ls -a 						   ', 'ls'     , this.term.$root.find('prompt:last'));
				this.term.displayMsg('clear        cd            cd.. 						   ', 'clr'    , this.term.$root.find('prompt:last'));
				this.term.displayMsg('github       facebook      linkedin 					   ', 'social' , this.term.$root.find('prompt:last'));
				this.term.displayMsg('phone        email         help     					   ', 'contact', this.term.$root.find('prompt:last'));
				this.term.displayMsg('skills       resume             						   ', 'skills' , this.term.$root.find('prompt:last'));
			}));

			this.validCommands.push(new Command({
				name   : 'clear',
				option : ''
			}, () => {
				this.term.$root.empty();
			}));

			this.validCommands.push(new Command({
				name   : 'ls',
				option : ''
			}, () => {
				console.log('Test Action for ls command!');				
			}));

			this.validCommands.push(new Command({
				name   : 'ls',
				option : '-l'
			}, () => {
				console.log('Test Action for ls command!');
			}));
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

		setupKeyListener() {
			$(window).keyup((e) => {
				if (!this.keyListenerEnabled) return; 

		        if(e.which == 13) { // Enter key pressed
			       	this.executeIfCommandEntered();
			       	this.clearCommandCache();
			    } else if (e.which == 8) { // Backspace key pressed
			    	if (this.userCommand.length > 0) {
			    		this.userCommand = this.userCommand.substring(0, this.userCommand.length-1);
			    	}

			    	this.term.deleteCharFromUsrInput();
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

			for (const command of this.validCommands) {
				if (command.name === cmdName && command.option === cmdOption) {
					command.execute();
				}
			}
		}

		isValidCommandIsEntered() {
			if (this.userCommand === '') return true;

			const command   = this.userCommand.split(' ');
			const cmdName   = command[0];
			const cmdOption = command[1] || '';
			let isValid     = false;

			for (const command of this.validCommands) {
				if (command.name === cmdName && command.option === cmdOption) {
					isValid = true;
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