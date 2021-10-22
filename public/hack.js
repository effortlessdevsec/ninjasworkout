$(document).ready(function() {
	
	
	
	var basicCommands = {
		help: {
			description: 'provides a list of commands with their description to the user.',
			parameter: 'the command to get help about',
			action: '',
		},
	};
	
	var userCommands = {
		connect: { // the command itself
			description: 'connects the device to the nearest phone relay', // the description that appears in the help menu for this command
			parameterlist: { // the list of parameters for this command
				parameter1: {
					description: 'the target to connect to', // description of the parameter
					optional: false, // if the parameter has to be mandatory (default: optional)
				},
				parameter2: {
					parameter: '-s', // if the parameter has to be a certain string
					description: 'connect to target with the secure connection',
				},
			},
			actionlist: { // if the command should take more than one actions
				action1: {
					text: 'connecting to #{parameter1}...', // the text it should show for this action
					time: 3, // the time it should take to execute the next action
				},
				action2: {
					text: 'connected to #{parameter1}',
				},
			},
		},
		disconnect: {
			description: 'disconnect from the currently connected target',
			actionList: {
				action1: {
					text: 'disconnected',
				},
			},
		},
	};
	
	var commands = Object.assign(basicCommands, userCommands);
	
	var mission = {
		type: 'mission',
		entry1: {
			chat: '/', // in which chat should the text appear
			text: 'hey there #{nickname}', // text that appears in the chat
			time: 10, // after how many seconds should the script continue to the next entry
		},
		entry2: {
			chat: '/',
			text: 'lets get used to this interface, shall we',
			time: 30,
		},
		entry3: {
			chat: '/',
			text: 'if you need any help just type in help anytime and you will find a bunch of useful commands that you can use in your terminal/console/command prompt or whatever you want to call it',
			time: 10,
		},
		entry4: {
			chat: '/',
			text: 'try it out now',
			command: 'help', // which command should trigger the script to continue to the next entry
		},
		entry5: {
			chat: '/',
			text: 'there you go',
			time: 10,
		},
		entry6: {
			chat: '/',
			text: 'now lets try something different',
			time: 20,
		},
		entry7: {
			chat: '/',
			text: 'try to connect to the nearest phone relay',
			command: 'connect',
		},
		entry8: {
			chat: '/',
			text: 'now disconnect before you get tracked down. you have 60 seconds before they track you down...',
			command: 'disconnect',
			time: 60, // if command property exists as well, time shows after how many seconds does it take to happen the game over
		},
		entry9: { // if neither command nor time property exist, it is the end of the mission
			chat: '/',
			text: 'congratulation! you just passed our test!',
		},
	};
	
	
	
	var chat = {
		'/': [
			'hey there #{nickname}',
			'lets get used to this interface, shall we?',
			'if you need any help just type in help anytime and you will find a bunch of useful commands that you can use in your terminal/console/command prompt or whatever you want to call it',
			'alright, so we hope you\'ve got used to the interface by now...',
		],
		'Anonymous': [
			'hey there #{nickname}',
		],
		'CIA': [
			'hey there #{nickname}',
		],
	};
	var objectives = [];
	
	
	
	console.clear();
	
	var nickname = 'Doe';

	var keyCode = {
		enter: 13,
		arrowUp: 38,
		arrowDown: 40,
		leftArrow: 37,
		rightArrow: 39
	};

	var inputHistory = {
		backward: [],
		forward: []
	};
	
	var $gameContainer = $('#game');
	var $consoleInput = $('#console-input');
	var $display1 = $('#display1');
	var $consoleVisibleInput = $('#console-visible-input');
	var $startingScreen = $('#starting-screen');
	var $nicknameInput = $('#nickname');
	
	var $objectivesContainer = $('#objectives');

	setTimeout(function() {
		$startingScreen.addClass('showing');
	}, 1000);
	
	$nicknameInput.on('keyup', function(e) {
		if ($nicknameInput.val() !== '' && e.which === keyCode.enter) {
      nickname = $nicknameInput.val();
			$startingScreen.removeClass('showing');
			$gameContainer.addClass('showing');
			var i = 0;
			var chatInterval = setInterval(function () {
				$objectivesContainer.append('<li> ' + chat['/'][i].replace('#{nickname}', nickname) + '</li>');
				i++;
				if (i >= chat['/'].length) {
					clearInterval(chatInterval);
				}
			}, 3000);
		}
	});

	function onEnter(input) {
		if (inputHistory.backward.length >= 50) {
			inputHistory.backward.shift();
		}
		inputHistory.backward.push(input);
		if (inputHistory.forward.length > 0) {
			inputHistory.forward = [];
		}
		$display1.append('<div>' + input + '</div>');
		$consoleInput.val('');
		switch(input) {
			case 'help':
				$display1.append('<div>Help...</div>');
				break;
			case 'cls':
				$display1.find('div:not(#console-input)').remove();
				break;
			case 'exit':
				$display1.append('<div>Shutting down ___and Starting a New..</div>');
                location.href = 'home';
				break;
			default:
				$display1.append('<div>[' + input + '] command not recognized. Type help for a list of available commands.</div>');
		}
		$consoleVisibleInput.remove();
		$display1.append('<div id="console-visible-input"><div id="console-caret">&nbsp</div></div>');
		$consoleVisibleInput = $('#console-visible-input');
		$('#display1')[0].scrollTop = $('#display1')[0].scrollHeight;
	}

	function onArrowUp() {
		if (inputHistory.backward.length > 0) {
			inputHistory.forward.push($consoleInput.val());
				$consoleInput.val(inputHistory.backward[inputHistory.backward.length - 1]);
			inputHistory.backward.pop();
		}
		$consoleVisibleInput.html($consoleInput.val() + '<div id="console-caret">&nbsp</div>');
	}

	function onArrowDown() {
		if (inputHistory.forward.length > 0) {
			inputHistory.backward.push($consoleInput.val());
			$consoleInput.val(inputHistory.forward[inputHistory.forward.length - 1]);
			inputHistory.forward.pop();
		}
		$consoleVisibleInput.html($consoleInput.val() + '<div id="console-caret">&nbsp</div>');
	}
	
	$display1.on('click', function() {
		$consoleInput.focus();
	});

	$consoleInput.on('keyup', function(e) {
		$consoleVisibleInput.html($(this).val() + '<div id="console-caret">&nbsp</div>');
		switch (e.which) {
			case keyCode.enter:
				if ($(this).val() !== '') {
					onEnter( $(this).val() );
				}
				break;
			case keyCode.arrowUp:
				onArrowUp();
				break;
			case keyCode.arrowDown:
				onArrowDown();
				break;
			case keyCode.leftArrow:
			case keyCode.rightArrow:
				$consoleInput.val($consoleInput.val());
				break;
		}
	});
});
