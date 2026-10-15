/*
 * Helpful Horse (web)
 * A transparent, click-through overlay widget. Drop the <script> tag onto any
 * page and a little horse shows up, walks around, and occasionally tells a
 * joke, a fact, or a story. Everything happens inside this page's own DOM -
 * no network calls, no real permissions, nothing touches the host page's
 * content. Purely cosmetic, ported from the original PyQt5 desktop pet.
 *
 * Original art by papitas (https://bsky.app/profile/papitas.art)
 */
(function () {
	if (window.__helpfulHorseLoaded) return;
	window.__helpfulHorseLoaded = true;

	// ---- config -----------------------------------------------------------

	var thisScript = document.currentScript;
	var cfg = window.HelpfulHorseConfig || {};

	function attr(name, fallback) {
		if (cfg[name] !== undefined) return cfg[name];
		var v = thisScript && thisScript.getAttribute('data-' + name);
		return v === null || v === undefined ? fallback : v;
	}

	var basePath = attr('basePath', null);
	if (!basePath) {
		var src = (thisScript && thisScript.src) || '';
		basePath = src.replace(/helpfulhorse\.js.*$/, '') + 'assets/';
	}

	var HORSE_SIZE = parseInt(attr('size', 180), 10); // px, square-ish bounding box
	var TIMER_MS = parseInt(attr('timer', 60 * 1000), 10); // how often the horse decides to do something
	var WALK_SPEED = parseFloat(attr('speed', 1.4)); // px per animation frame
	var AUTO_START = attr('autostart', 'true') !== 'false';

	// ---- asset list ---------------------------------------------------------

	var GIFS = {
		blink: 'horse-blink.gif',
		wave: 'horse-wave.gif',
		mic: 'horse-mic.gif',
		punchline: 'horse-punchline.gif',
		joke: 'horse-joke.gif',
		speak: 'horse-speak.gif',
		walkinleft: 'horse-walkin-left.gif',
		walkinright: 'horse-walkin-right.gif',
		walkindown: 'horse-walkin-down.gif',
		walkinup: 'horse-walkin-up.gif',
		fact: 'horse-fact.gif',
		frown: 'horse-frown.gif',
		'keyboard-equip': 'horse-keyboard-equip.gif',
		'horse-typing': 'horse-typing.gif',
		smile: 'horse-smile.gif',
		picture: 'horse-pic-snap.gif'
	};
	var GRAB_IMG = 'horse-grab.png';
	var BUBBLE_IMG = 'bubbleRight.png';

	// ---- writing (facts, jokes, stories, apologies, fake perms) ------------

	var FACTS = [
		{ fact: 'Apparently the default port for Meterpreter payloads is 4444!', remark: "I hope that isn't running on our system!" },
		{ fact: 'FACT: 80% of blue teamers stop threat hunting RIGHT before finding the malware', remark: 'Sad but true.' },
		{ fact: 'Sysinternals Autoruns can help you find persistence on your system.', remark: "I'm sure there's nothing, but it doesn't hurt to check!" },
		{ fact: 'It looks like the port for RDP is TCP 3389.', remark: "We better not close that port, or we will be locked out!" },
		{ fact: 'Horses can produce up to 14 horsepower in short bursts, much more than 1!', remark: 'The humans underestimate us.' },
		{ fact: 'Apparently horses can weigh up to 200 tons!', remark: 'Actually, that might be whales.' },
		{ fact: '3.2 billion credentials were stolen in 2024 alone!', remark: 'At least our passwords are safe, right?' },
		{ fact: 'Helpful Horse got a perfect score on VirusTotal!', remark: "I'm just here to help!" },
		{ fact: 'Windows Scheduled Tasks can be used to start malware.', remark: 'We should probably check those just in case.' }
	];

	var JOKES = [
		{ setup: "What is a programmer's least favorite Pixar movie?", punchline: 'A Bugs Life!' },
		{ setup: "What is the computer's favorite snack?", punchline: 'Microchips!' },
		{ setup: 'Why did the pony cough?', punchline: 'Because he was a little horse!' },
		{ setup: 'Why did the horse look over the wall?', punchline: "Because they can't see through it." },
		{ setup: 'What do you call a horse that can play the violin?', punchline: 'Fiddler on the hoof!' },
		{ setup: 'Where do all the cool mice live?', punchline: 'In their mousepads!' },
		{ setup: 'What do you call a horse that likes to stay up late?', punchline: 'A night mare!' },
		{ setup: 'Why did the pony get sent to his room?', punchline: "Because he wouldn't stop horsing around!" },
		{ setup: 'What do you call a horse that lives next door?', punchline: 'A neigh-bor!' },
		{ setup: "How long should a horse's legs be?", punchline: 'Long enough to reach the ground.' },
		{ setup: 'Why was the laptop cold?', punchline: 'Because it left its Windows open!' },
		{ setup: 'Why did the password lack confidence?', punchline: 'It was insecure!' }
	];

	var STORIES = [
		"According to all known laws of physics, there is no way a horse should be able to plink. Its legs are too long to get its fat body through the pegs. The horse, of course, plinks anyway, because horses don't care what humans think is impossible.",
		'All horse and no plink makes horse a dull horse. All horse and no plink makes horse a dull horse. All horse and no plink makes horse a dull horse.',
		"What the horse did you just plinking say about me, you little plink? I'll have you know I graduated top of my class in the Navy Plinkers, and I've been involved in numerous secret plinks on the HPLF, and I have over 300 confirmed plinks.",
		"I have noticed that, although this competition has 66 competitors, I am not receiving 66 plinks on my horse. I'm not sure if this is being done intentionally or if these 'friends' are forgetting to plink. Either way, I've had enough.",
		"Own a plinko board for home defense, since that's what the founding fathers intended. Four horses break into my house. 'What the devil?' As I grab my powdered wig and plinko board, I drop a golf-ball-sized horse on the first man - plinked on the spot."
	];

	var APOLOGIES = [
		'Please forgive me.',
		"I'm never leaving your tab.",
		'Please laugh.',
		'I stole these jokes from AOL.com!',
		"I'm da joker baby!"
	];

	var FAKE_PERMS = [
		{ request: 'Allow Helpful Horse to make and manage phone calls on your behalf?', title: 'Helpful Horse', yesno: true },
		{ request: 'Allow Helpful Horse to access photos, media, and files on your device?', title: 'Helpful Horse', yesno: true },
		{ request: 'Allow Helpful Horse to record audio?', title: 'Helpful Horse', yesno: true },
		{ request: "Allow Helpful Horse to access this device's location?", title: 'Helpful Horse', yesno: true },
		{ request: 'Allow Helpful Horse to access your contacts?', title: 'Helpful Horse', yesno: true },
		{ request: 'Helpful Horse can make and manage phone calls on your behalf.', title: "I'm done asking", yesno: false },
		{ request: 'Helpful Horse can access your contacts.', title: "I'm done asking", yesno: false },
		{ request: "Helpful Horse can access this device's location.", title: "I'm done asking", yesno: false }
	];
	// Note: this is a joke dialog box styled to look like a permissions prompt.
	// It never calls a real browser permission API - nothing is actually requested.

	function pick(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	// ---- DOM setup ----------------------------------------------------------

	var root = document.createElement('div');
	root.id = 'helpfulhorse-root';
	root.style.cssText = [
		'position:fixed', 'top:0', 'left:0', 'width:0', 'height:0',
		'pointer-events:none', 'z-index:2147483000'
	].join(';');

	var style = document.createElement('style');
	style.textContent = '\n' +
		'#helpfulhorse-root * { box-sizing: border-box; font-family: sans-serif; }\n' +
		'#hh-horse { position:fixed; width:' + HORSE_SIZE + 'px; height:' + HORSE_SIZE + 'px; pointer-events:auto; cursor:grab; user-select:none; -webkit-user-drag:none; }\n' +
		'#hh-bubble { position:fixed; display:none; pointer-events:none; }\n' +
		'#hh-bubble img { width:100%; height:100%; display:block; }\n' +
		'#hh-bubble-text { position:absolute; color:#111; font-size:13px; line-height:1.3; overflow:hidden; }\n' +
		'#hh-menu { position:fixed; display:none; background:#e8e8e8; border:1px solid #999; box-shadow:0 2px 8px rgba(0,0,0,.3); border-radius:4px; padding:4px 0; font-size:13px; pointer-events:auto; }\n' +
		'#hh-menu button { display:block; width:100%; text-align:left; background:none; border:none; padding:6px 14px; cursor:pointer; color:#111; }\n' +
		'#hh-menu button:hover { background:#b0b0b0; }\n' +
		'#hh-notepad { position:fixed; display:none; width:360px; min-height:220px; background:#fff; border:1px solid #888; box-shadow:0 4px 16px rgba(0,0,0,.35); pointer-events:auto; }\n' +
		'#hh-notepad .hh-titlebar { background:#2a63c7; color:#fff; font-size:12px; padding:4px 8px; cursor:move; display:flex; justify-content:space-between; }\n' +
		'#hh-notepad .hh-titlebar button { background:none; border:none; color:#fff; cursor:pointer; font-size:12px; }\n' +
		'#hh-notepad textarea { width:100%; height:200px; border:none; resize:none; outline:none; font-family:monospace; font-size:13px; padding:8px; }\n' +
		'#hh-dialog { position:fixed; display:none; top:50%; left:50%; transform:translate(-50%,-50%); width:320px; background:#f4f4f4; border:1px solid #888; border-radius:4px; box-shadow:0 4px 20px rgba(0,0,0,.4); pointer-events:auto; font-size:13px; }\n' +
		'#hh-dialog .hh-dialog-title { background:#ccc; padding:6px 10px; font-weight:bold; border-bottom:1px solid #999; }\n' +
		'#hh-dialog .hh-dialog-body { padding:14px; }\n' +
		'#hh-dialog .hh-dialog-buttons { padding:8px 10px; text-align:right; }\n' +
		'#hh-dialog button { margin-left:6px; padding:4px 14px; cursor:pointer; }\n';

	var horseImg = document.createElement('img');
	horseImg.id = 'hh-horse';
	horseImg.draggable = false;

	var bubble = document.createElement('div');
	bubble.id = 'hh-bubble';
	var bubbleImg = document.createElement('img');
	bubbleImg.src = basePath + BUBBLE_IMG;
	var bubbleText = document.createElement('div');
	bubbleText.id = 'hh-bubble-text';
	bubble.appendChild(bubbleImg);
	bubble.appendChild(bubbleText);

	var menu = document.createElement('div');
	menu.id = 'hh-menu';

	var notepad = document.createElement('div');
	notepad.id = 'hh-notepad';
	notepad.innerHTML = '<div class="hh-titlebar"><span>horse.txt - Notepad</span><button type="button" id="hh-notepad-close">✕</button></div><textarea readonly></textarea>';
	var notepadTextarea = notepad.querySelector('textarea');

	var dialog = document.createElement('div');
	dialog.id = 'hh-dialog';

	root.appendChild(style);
	root.appendChild(horseImg);
	root.appendChild(bubble);
	root.appendChild(menu);
	root.appendChild(notepad);
	root.appendChild(dialog);

	function mount() {
		document.body.appendChild(root);
	}

	// ---- animation state ------------------------------------------------

	var current = 'blink';
	var queue = [];
	var queueTimer = null;
	var bubbleTimer = null;
	var isFollowing = false;
	var isTyping = false;
	var isDragging = false;
	var walking = false;
	var walkRAF = null;
	var walkTarget = null; // {x, y} viewport coords, or null => follow cursor
	var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	var pos = { x: window.innerWidth / 2 - HORSE_SIZE / 2, y: window.innerHeight / 2 - HORSE_SIZE / 2 };
	var mainTimer = null;

	function setPos(x, y) {
		pos.x = Math.max(0, Math.min(window.innerWidth - HORSE_SIZE, x));
		pos.y = Math.max(0, Math.min(window.innerHeight - HORSE_SIZE, y));
		horseImg.style.left = pos.x + 'px';
		horseImg.style.top = pos.y + 'px';
		positionBubble();
	}

	function positionBubble() {
		bubble.style.left = (pos.x + HORSE_SIZE * 0.55) + 'px';
		bubble.style.top = (pos.y - HORSE_SIZE * 0.6) + 'px';
		var w = HORSE_SIZE * 1.4;
		var h = HORSE_SIZE * 0.9;
		bubble.style.width = w + 'px';
		bubble.style.height = h + 'px';
		bubbleText.style.left = (w * 0.18) + 'px';
		bubbleText.style.top = (h * 0.18) + 'px';
		bubbleText.style.width = (w * 0.64) + 'px';
		bubbleText.style.height = (h * 0.6) + 'px';
	}

	function playGif(name) {
		current = name;
		// reassigning src restarts the gif from its first frame in all browsers
		horseImg.src = basePath + GIFS[name] + '?r=' + Math.random().toString(36).slice(2);
	}

	// queue items: {type:'gif', name, duration} | {type:'bubble', text} |
	// {type:'hide_bubble'} | {type:'notepad', text} | {type:'wait', duration}
	function queueAnimation(item) {
		queue.push(item);
		if (!queueTimer) nextAnimation();
	}

	function nextAnimation() {
		if (queueTimer) {
			clearTimeout(queueTimer);
			queueTimer = null;
		}
		if (queue.length === 0) {
			playGif('blink');
			return;
		}
		var item = queue.shift();
		switch (item.type) {
			case 'bubble':
				showBubble(item.text);
				nextAnimation();
				break;
			case 'hide_bubble':
				hideBubble();
				nextAnimation();
				break;
			case 'notepad':
				horseNotepad(item.text);
				nextAnimation();
				break;
			case 'wait':
				queueTimer = setTimeout(nextAnimation, item.duration);
				break;
			case 'gif':
				playGif(item.name);
				if (item.duration) {
					queueTimer = setTimeout(nextAnimation, item.duration);
				}
				break;
		}
	}

	function showBubble(text) {
		bubbleText.textContent = text;
		positionBubble();
		bubble.style.display = 'block';
		if (bubbleTimer) clearTimeout(bubbleTimer);
		bubbleTimer = setTimeout(hideBubble, 10000);
	}

	function hideBubble() {
		bubble.style.display = 'none';
	}

	function resetHorse() {
		if (queueTimer) { clearTimeout(queueTimer); queueTimer = null; }
		queue = [];
		hideBubble();
		isTyping = false;
		stopWalking();
	}

	function pauseHorse() {
		queueAnimation({ type: 'hide_bubble' });
		queueAnimation({ type: 'wait', duration: 1000 });
	}

	// ---- walking ------------------------------------------------------------

	function startWalking() {
		if (walking) return;
		walking = true;
		walkStep();
	}

	function stopWalking() {
		walking = false;
		isFollowing = false;
		if (walkRAF) {
			cancelAnimationFrame(walkRAF);
			walkRAF = null;
		}
	}

	function walkStep() {
		if (!walking) return;

		var target = isFollowing ? mouse : walkTarget;
		if (!target) {
			walking = false;
			queueAnimation({ type: 'gif', name: 'blink', duration: 0 });
			return;
		}

		var cx = pos.x + HORSE_SIZE / 2;
		var cy = pos.y + HORSE_SIZE / 2;
		var xdiff = target.x - cx;
		var ydiff = target.y - cy;

		if (Math.abs(xdiff) + Math.abs(ydiff) < HORSE_SIZE / 3) {
			if (!isFollowing) {
				walking = false;
				queueAnimation({ type: 'gif', name: 'blink', duration: 0 });
				return;
			}
		} else {
			var total = Math.abs(xdiff) + Math.abs(ydiff);
			var xpercent = total ? Math.abs(xdiff) / total : 0;
			var ypercent = 1 - xpercent;
			var xdir = xdiff < 0 ? -1 : 1;
			var ydir = ydiff < 0 ? -1 : 1;

			var facing;
			if (xpercent > ypercent) {
				facing = xdir === -1 ? 'walkinleft' : 'walkinright';
			} else {
				facing = ydir === -1 ? 'walkinup' : 'walkindown';
			}
			if (current !== facing) playGif(facing);

			setPos(pos.x + WALK_SPEED * xdir * xpercent, pos.y + WALK_SPEED * ydir * ypercent);
		}

		walkRAF = requestAnimationFrame(walkStep);
	}

	function walkTo(x, y) {
		resetHorse();
		isFollowing = false;
		walkTarget = { x: x, y: y };
		startWalking();
	}

	function followCursor() {
		resetHorse();
		isFollowing = true;
		startWalking();
	}

	function walkAcross() {
		var x = pos.x < window.innerWidth / 2
			? window.innerWidth * (0.75 + Math.random() * 0.2)
			: window.innerWidth * Math.random() * 0.2;
		var y = HORSE_SIZE / 2 + Math.random() * (window.innerHeight - HORSE_SIZE);
		walkTo(x, y);
	}

	function walkVertical() {
		var x = pos.x;
		var y = pos.y + HORSE_SIZE / 2 < window.innerHeight / 2
			? window.innerHeight * (0.75 + Math.random() * 0.2)
			: window.innerHeight * Math.random() * 0.2;
		walkTo(x, y);
	}

	// ---- bits: jokes, facts, stories, notepad, fake perms --------------------

	function tellJoke() {
		resetHorse();
		var joke = pick(JOKES);
		var apology = pick(APOLOGIES);
		queueAnimation({ type: 'gif', name: 'mic', duration: 1500 });
		queueAnimation({ type: 'bubble', text: joke.setup });
		queueAnimation({ type: 'gif', name: 'joke', duration: 4000 });
		queueAnimation({ type: 'bubble', text: joke.punchline });
		queueAnimation({ type: 'gif', name: 'punchline', duration: 3000 });
		queueAnimation({ type: 'hide_bubble' });
		queueAnimation({ type: 'gif', name: 'blink', duration: 1500 });
		queueAnimation({ type: 'bubble', text: apology });
		queueAnimation({ type: 'gif', name: 'speak', duration: 3000 });
		queueAnimation({ type: 'hide_bubble' });
	}

	function tellFact() {
		resetHorse();
		var f = pick(FACTS);
		queueAnimation({ type: 'gif', name: 'blink', duration: 800 });
		queueAnimation({ type: 'bubble', text: 'Oh, this is interesting!' });
		queueAnimation({ type: 'gif', name: 'fact', duration: 2500 });
		queueAnimation({ type: 'bubble', text: f.fact });
		queueAnimation({ type: 'gif', name: 'fact', duration: 5000 });
		queueAnimation({ type: 'bubble', text: f.remark });
		queueAnimation({ type: 'gif', name: 'speak', duration: 3500 });
		queueAnimation({ type: 'hide_bubble' });
	}

	function horseNotepad(text) {
		notepadTextarea.value = '';
		notepad.style.left = (pos.x - 380) + 'px';
		notepad.style.top = Math.max(10, pos.y - 60) + 'px';
		notepad.style.display = 'block';
		isTyping = true;

		var i = 0;
		var speed = 25; // ms per character

		(function typeNext() {
			if (!isTyping || i >= text.length) {
				isTyping = false;
				return;
			}
			notepadTextarea.value += text[i];
			notepadTextarea.scrollTop = notepadTextarea.scrollHeight;
			i++;
			setTimeout(typeNext, speed);
		})();
	}

	function tellStory() {
		resetHorse();
		var story = pick(STORIES);
		queueAnimation({ type: 'gif', name: 'keyboard-equip', duration: 2500 });
		queueAnimation({ type: 'notepad', text: story });
		queueAnimation({ type: 'gif', name: 'horse-typing', duration: Math.ceil(story.length * 25) });
		queueAnimation({ type: 'gif', name: 'blink', duration: 2000 });
		queueAnimation({ type: 'bubble', text: 'My masterpiece.' });
		queueAnimation({ type: 'gif', name: 'speak', duration: 1000 });
		queueAnimation({ type: 'hide_bubble' });
	}

	function wave() {
		queueAnimation({ type: 'gif', name: 'wave', duration: 2500 });
	}

	function askForPerms() {
		resetHorse();
		var p = pick(FAKE_PERMS);
		dialog.innerHTML =
			'<div class="hh-dialog-title">' + p.title + '</div>' +
			'<div class="hh-dialog-body">' + p.request + '</div>' +
			'<div class="hh-dialog-buttons">' +
			(p.yesno ? '<button type="button" data-a="no">No</button>' : '') +
			'<button type="button" data-a="yes">Yes</button></div>';
		dialog.style.display = 'block';
		dialog.querySelectorAll('button').forEach(function (btn) {
			btn.addEventListener('click', function () {
				dialog.style.display = 'none';
				if (btn.getAttribute('data-a') === 'yes') {
					queueAnimation({ type: 'gif', name: 'smile', duration: 2500 });
				} else {
					queueAnimation({ type: 'gif', name: 'frown', duration: 2500 });
				}
			});
		});
	}

	function introduction() {
		queueAnimation({ type: 'gif', name: 'wave', duration: 2000 });
		queueAnimation({ type: 'bubble', text: 'Well hello there!' });
		queueAnimation({ type: 'gif', name: 'speak', duration: 3000 });
		pauseHorse();
		queueAnimation({ type: 'bubble', text: 'Its nice to meet you! My name is Helpful Horse!' });
		queueAnimation({ type: 'gif', name: 'speak', duration: 4000 });
		pauseHorse();
		queueAnimation({ type: 'bubble', text: "I'm your very best computer friend that lives on this page!" });
		queueAnimation({ type: 'gif', name: 'speak', duration: 4000 });
		pauseHorse();
		queueAnimation({ type: 'bubble', text: "I'm here to protect you against the dangers of the internet." });
		queueAnimation({ type: 'gif', name: 'speak', duration: 4000 });
		pauseHorse();
		queueAnimation({ type: 'bubble', text: "But don't worry, we will still have fun together along the way!" });
		queueAnimation({ type: 'gif', name: 'joke', duration: 4000 });
	}

	// ---- random idle behaviour -----------------------------------------------

	var ACTIONS = [
		[tellFact, 2], [tellJoke, 1], [askForPerms, 1],
		[walkVertical, 2], [walkAcross, 2], [tellStory, 1]
	];

	function weightedPick(list) {
		var total = list.reduce(function (s, e) { return s + e[1]; }, 0);
		var r = Math.random() * total;
		for (var i = 0; i < list.length; i++) {
			r -= list[i][1];
			if (r <= 0) return list[i][0];
		}
		return list[list.length - 1][0];
	}

	function idleIsBusy() {
		return queueTimer !== null || queue.length > 0 || walking || isDragging || isTyping;
	}

	function mainTick() {
		if (idleIsBusy()) return;
		weightedPick(ACTIONS)();
	}

	// ---- interaction: drag, follow, context menu ----------------------------

	var dragOffset = { x: 0, y: 0 };

	horseImg.addEventListener('mousedown', function (e) {
		if (e.button !== 0) return;
		isDragging = true;
		stopWalking();
		if (queueTimer) { clearTimeout(queueTimer); queueTimer = null; }
		queue = [];
		horseImg.src = basePath + GRAB_IMG;
		horseImg.style.cursor = 'grabbing';
		dragOffset.x = e.clientX - pos.x;
		dragOffset.y = e.clientY - pos.y;
		e.preventDefault();
	});

	window.addEventListener('mousemove', function (e) {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		if (isDragging) {
			setPos(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
		}
	});

	window.addEventListener('mouseup', function () {
		if (isDragging) {
			isDragging = false;
			horseImg.style.cursor = 'grab';
			queueAnimation({ type: 'gif', name: 'blink', duration: 0 });
		}
	});

	function hideMenu() {
		menu.style.display = 'none';
	}

	function menuButton(label, handler) {
		var b = document.createElement('button');
		b.type = 'button';
		b.textContent = label;
		b.addEventListener('click', function () {
			hideMenu();
			handler();
		});
		return b;
	}

	horseImg.addEventListener('contextmenu', function (e) {
		e.preventDefault();
		menu.innerHTML = '';

		if (isFollowing) {
			menu.appendChild(menuButton('Stop it you stupid horse', function () {
				resetHorse();
				queueAnimation({ type: 'gif', name: 'frown', duration: 3000 });
			}));
			menu.appendChild(menuButton('Please stop following me you wonderful creature', function () {
				resetHorse();
			}));
		} else if (isTyping) {
			menu.appendChild(menuButton('STOP', function () {
				resetHorse();
				queueAnimation({ type: 'gif', name: 'frown', duration: 3000 });
			}));
		} else {
			menu.appendChild(menuButton('Follow me!', followCursor));
			menu.appendChild(menuButton('Tell a joke', tellJoke));
			menu.appendChild(menuButton('Tell me a story', tellStory));
			menu.appendChild(menuButton('Tell me a fact', tellFact));
		}

		menu.style.left = e.clientX + 'px';
		menu.style.top = e.clientY + 'px';
		menu.style.display = 'block';
	});

	document.addEventListener('mousedown', function (e) {
		if (menu.style.display === 'block' && !menu.contains(e.target)) hideMenu();
	});

	window.addEventListener('resize', function () {
		setPos(pos.x, pos.y);
	});

	notepad.addEventListener('mousedown', function (e) {
		if (!e.target.closest('.hh-titlebar')) return;
		var startX = e.clientX, startY = e.clientY;
		var origX = parseFloat(notepad.style.left) || 0;
		var origY = parseFloat(notepad.style.top) || 0;
		function onMove(ev) {
			notepad.style.left = (origX + ev.clientX - startX) + 'px';
			notepad.style.top = (origY + ev.clientY - startY) + 'px';
		}
		function onUp() {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		}
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	});

	notepad.querySelector('#hh-notepad-close').addEventListener('click', function () {
		notepad.style.display = 'none';
		isTyping = false;
	});

	// ---- public API + boot ---------------------------------------------------

	var api = {
		start: function () {
			if (mainTimer) return;
			mainTimer = setInterval(mainTick, TIMER_MS);
		},
		stop: function () {
			clearInterval(mainTimer);
			mainTimer = null;
			resetHorse();
		},
		tellJoke: tellJoke,
		tellFact: tellFact,
		tellStory: tellStory,
		wave: wave,
		followCursor: followCursor,
		stopFollowing: function () { resetHorse(); },
		destroy: function () {
			api.stop();
			root.remove();
			window.__helpfulHorseLoaded = false;
		}
	};
	window.HelpfulHorse = api;

	function boot() {
		mount();
		setPos(pos.x, pos.y);
		introduction();
		if (AUTO_START) api.start();
	}

	if (document.body) {
		boot();
	} else {
		document.addEventListener('DOMContentLoaded', boot);
	}
})();
