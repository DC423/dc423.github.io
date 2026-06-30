    // ================================================================
    //  CHA Terminal — Main Application Script
    //  Simulates an XFCE-style Linux desktop with a working terminal.
    //  Desktop-only (>768px); mobile gets a static fallback view.
    // ================================================================

    // Gate: skip entire script on mobile — the CSS handles the fallback
    if (window.innerWidth > 768) {
      document.addEventListener("DOMContentLoaded", function () {

        // ────────────────────────────────────────────────────────────
        //  DOM References
        // ────────────────────────────────────────────────────────────
        const terminal = document.getElementById('terminalContent');
        const prompt = document.getElementById('promptLine');
        const promptText = document.getElementById('promptText');
        const xfceWeather = document.getElementById('xfceWeather');
        const xfceClock = document.getElementById('xfceClock');
        const xfceMenuButton = document.getElementById('xfceMenuButton');
        const xfceMenu = document.getElementById('xfceMenu');
        const xfceTaskButton = document.getElementById('xfceTaskButton');
        const desktopIconsEl = document.getElementById('desktopIcons');
        const screenLockOverlay = document.getElementById('screenLockOverlay');
        const weatherAlertOverlay = document.getElementById('weatherAlertOverlay');
        const weatherAlertTitle = document.getElementById('weatherAlertTitle');
        const weatherAlertMeta = document.getElementById('weatherAlertMeta');
        const weatherAlertBody = document.getElementById('weatherAlertBody');
        const weatherAlertClose = document.getElementById('weatherAlertClose');

        // ────────────────────────────────────────────────────────────
        //  Configuration — editable via `nano /etc/weather.conf`
        // ────────────────────────────────────────────────────────────
        let lastWeatherAlertId = '';
        let weatherStation = 'KCHA';       // NOAA observation station ID
        let alertZone = 'TNC065';          // NWS alert zone (Hamilton Co, TN)
        let nanoActive = false;            // true while nano overlay is open
        let nanoBuffer = '';
        let nanoCursorLine = 0;
        // ────────────────────────────────────────────────────────────
        //  Desktop Icons — virtual XFCE desktop items
        // ────────────────────────────────────────────────────────────
        const defaultDesktopIcons = [
          { id: 'home', glyph: '🏠', label: 'Home' },
          { id: 'meetings', glyph: '📅', label: 'Meetings' },
          { id: 'dumpster', glyph: '🗑️', label: 'Garbage File' },
          { id: 'terminal', glyph: '▣', label: 'Terminal' },
          { id: 'radio', glyph: '📡', label: 'SDR Notes' },
          { id: 'loot', glyph: '📁', label: 'Totally Not Loot' }
        ];
        let desktopIcons = defaultDesktopIcons.map(icon => ({ ...icon }));

        function renderDesktopIcons() {
          if (!desktopIconsEl) return;
          desktopIconsEl.innerHTML = '';
          desktopIcons.forEach(icon => {
            const button = document.createElement('button');
            button.className = 'desktop-icon';
            button.type = 'button';
            button.dataset.iconId = icon.id;
            button.title = `Desktop item id: ${icon.id} — try: rename-icon ${icon.id} new-name`;

            const glyph = document.createElement('span');
            glyph.className = 'desktop-icon-glyph';
            glyph.textContent = icon.glyph;

            const label = document.createElement('span');
            label.className = 'desktop-icon-label';
            label.textContent = icon.label;

            button.appendChild(glyph);
            button.appendChild(label);
            desktopIconsEl.appendChild(button);
          });
        }

        function setDesktopIconLabel(id, label) {
          const icon = desktopIcons.find(item => item.id === id);
          if (!icon) return false;
          icon.label = label.trim().slice(0, 40) || icon.label;
          renderDesktopIcons();
          return true;
        }

        function desktopNameSlug(label) {
          return String(label || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'desktop-item';
        }

        function findDesktopIcon(name) {
          const needle = desktopNameSlug(name);
          return desktopIcons.find(item => item.id === needle || desktopNameSlug(item.label) === needle);
        }

        function renameDesktopIcon(oldName, newName) {
          const icon = findDesktopIcon(oldName);
          if (!icon) return false;
          icon.label = newName.trim().slice(0, 40) || icon.label;
          renderDesktopIcons();
          return icon;
        }

        function resetDesktopIcons() {
          desktopIcons = defaultDesktopIcons.map(icon => ({ ...icon }));
          renderDesktopIcons();
        }

        function desktopIconTable() {
          const rows = desktopIcons.map(icon => `${desktopNameSlug(icon.label).padEnd(18, ' ')}  ->  ${icon.label} (${desktopIconTarget(icon)})`);
          return `<pre>Desktop items:
${rows.join('\n')}

Hackable bits:
  cd Desktop
  mv &lt;item&gt; &lt;new-name&gt;
  reset-icons

Example:
  mv totally-not-loot research-stash</pre>`;
        }

        function desktopIconTarget(icon) {
          const targets = {
            home: '/root',
            meetings: '../meetings.html',
            dumpster: '../garbage',
            terminal: '/usr/bin/cha-terminal',
            radio: '../sdr-notes',
            loot: '../totally-not-loot'
          };
          return targets[icon.id] || `../${desktopNameSlug(icon.label)}`;
        }

        function desktopIconMode(icon) {
          return icon.id === 'home' ? 'drwxr-xr-x' : 'lrwxrwxrwx';
        }

        function desktopIconDetailedListing(showHidden = false) {
          const now = formatLsDate();
          const rows = desktopIcons.map((icon, index) => {
            const name = desktopNameSlug(icon.label);
            const size = String(96 + (index * 17)).padStart(4, ' ');
            const linkTarget = icon.id === 'home' ? '' : ` -> ${desktopIconTarget(icon)}`;
            return `${desktopIconMode(icon)}  1 root staff ${size} ${now} ${name}${linkTarget}`;
          });

          if (showHidden) {
            rows.unshift(
              `drwxr-xr-x  2 root staff  192 ${now} .`,
              `drwxr-xr-x 10 root staff  320 ${now} ..`
            );
          }

          return `<pre>${rows.join('\n')}</pre>`;
        }


        if (desktopIconsEl) {
          desktopIconsEl.addEventListener('click', function (event) {
            const icon = event.target.closest('.desktop-icon');
            if (!icon) return;
            desktopIconsEl.querySelectorAll('.desktop-icon').forEach(item => item.classList.remove('selected'));
            icon.classList.add('selected');
          });
        }

        renderDesktopIcons();

        // ────────────────────────────────────────────────────────────
        //  Weather System — NOAA alerts + panel weather display
        // ────────────────────────────────────────────────────────────
        function showWeatherAlertPopup(alertFeature, force = false) {
          if (!alertFeature || !weatherAlertOverlay) return;
          const props = alertFeature.properties || {};
          const alertId = alertFeature.id || props.id || `${props.event || 'weather-alert'}-${props.sent || ''}`;

          weatherAlertTitle.textContent = `[ WEATHER ALERT // ${props.event || 'HACKERS IN CLOSET'} ]`;
          weatherAlertMeta.textContent = [
            props.severity ? `Severity: ${props.severity}` : '',
            props.urgency ? `Urgency: ${props.urgency}` : '',
            props.certainty ? `Certainty: ${props.certainty}` : '',
            props.effective ? `Effective: ${new Date(props.effective).toLocaleString()}` : '',
            props.expires ? `Expires: ${new Date(props.expires).toLocaleString()}` : ''
          ].filter(Boolean).join('  //  ') || `Active weather.gov alert for ${alertZone}`;
          weatherAlertBody.textContent = [
            props.headline || props.event || 'Active weather alert',
            '',
            props.description || 'No description provided by weather.gov.',
            props.instruction ? `\nInstructions:\n${props.instruction}` : ''
          ].join('\n');

          lastWeatherAlertId = alertId;
          if (force) {
            weatherAlertOverlay.classList.add('active');
            weatherAlertOverlay.setAttribute('aria-hidden', 'false');
          }
        }

        function hideWeatherAlertPopup() {
          if (!weatherAlertOverlay) return;
          weatherAlertOverlay.classList.remove('active');
          weatherAlertOverlay.setAttribute('aria-hidden', 'true');
        }

        function updatePanelClock() {
          if (!xfceClock) return;
          const now = new Date();
          xfceClock.textContent = now.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }

        function cToF(celsius) {
          return (celsius * 9 / 5) + 32;
        }

        function msToMph(ms) {
          return ms * 2.236936;
        }

        function weatherEmoji(description) {
          const wx = (description || '').toLowerCase();
          if (wx.includes('thunder')) return '⛈️';
          if (wx.includes('snow') || wx.includes('sleet') || wx.includes('ice')) return '❄️';
          if (wx.includes('rain') || wx.includes('drizzle') || wx.includes('shower')) return '🌧️';
          if (wx.includes('fog') || wx.includes('mist') || wx.includes('haze') || wx.includes('smoke')) return '🌫️';
          if (wx.includes('wind') || wx.includes('breezy') || wx.includes('gust')) return '💨';
          if (wx.includes('partly') || wx.includes('mostly cloudy') || wx.includes('few clouds') || wx.includes('scattered')) return '⛅';
          if (wx.includes('cloud') || wx.includes('overcast')) return '☁️';
          if (wx.includes('clear') || wx.includes('sunny') || wx.includes('fair')) return '☀️';
          return '🌡️';
        }

        async function updatePanelWeather() {
          if (!xfceWeather) return;
          try {
            const alertResponse = await fetch(`https://api.weather.gov/alerts/active?zone=${alertZone}`, {
              headers: { 'Accept': 'application/geo+json, application/json' }
            });

            if (alertResponse.ok) {
              const alertData = await alertResponse.json();
              const activeAlerts = Array.isArray(alertData.features) ? alertData.features : [];
              if (activeAlerts.length > 0) {
                const topAlert = activeAlerts[0];
                const props = topAlert.properties || {};
                xfceWeather.textContent = '⚠ HACKERS IN CLOSET';
                xfceWeather.title = `${props.event || 'Weather alert'} — click for details`;
                xfceWeather.classList.add('alert-active');
                showWeatherAlertPopup(topAlert);
                return;
              }
            }

            xfceWeather.classList.remove('alert-active');
            hideWeatherAlertPopup();
            const response = await fetch(`https://api.weather.gov/stations/${weatherStation}/observations/latest`, {
              headers: { 'Accept': 'application/geo+json, application/json' }
            });
            if (!response.ok) throw new Error(`weather status ${response.status}`);

            const data = await response.json();
            const props = data.properties || {};
            const tempC = props.temperature && typeof props.temperature.value === 'number'
              ? props.temperature.value
              : null;
            const windMs = props.windSpeed && typeof props.windSpeed.value === 'number'
              ? props.windSpeed.value
              : null;
            const description = props.textDescription || 'observed';
            const temp = tempC === null ? '--°F' : `${Math.round(cToF(tempC))}°F`;
            const wind = windMs === null ? '' : ` ${Math.round(msToMph(windMs))}mph`;

            xfceWeather.textContent = `${weatherEmoji(description)} ${temp}${wind}`;
            xfceWeather.title = props.timestamp
              ? `${description} — latest observation: ${props.timestamp}`
              : description;
          } catch (error) {
            xfceWeather.textContent = '🌡️ weather unavailable';
            xfceWeather.title = 'Could not load latest weather.gov observation';
          }
        }

        if (weatherAlertClose) {
          weatherAlertClose.addEventListener('click', hideWeatherAlertPopup);
        }

        if (weatherAlertOverlay) {
          weatherAlertOverlay.addEventListener('click', function (event) {
            if (event.target === weatherAlertOverlay) hideWeatherAlertPopup();
          });
        }

        if (xfceWeather) {
          xfceWeather.addEventListener('click', function () {
            if (!xfceWeather.classList.contains('alert-active')) return;
            if (weatherAlertOverlay && weatherAlertOverlay.classList.contains('active')) {
              hideWeatherAlertPopup();
              return;
            }
            fetch(`https://api.weather.gov/alerts/active?zone=${alertZone}`, {
              headers: { 'Accept': 'application/geo+json, application/json' }
            })
              .then(response => response.ok ? response.json() : null)
              .then(data => {
                const activeAlerts = data && Array.isArray(data.features) ? data.features : [];
                if (activeAlerts.length > 0) showWeatherAlertPopup(activeAlerts[0], true);
              })
              .catch(() => {});
          });
        }

        updatePanelClock();
        setInterval(updatePanelClock, 1000);
        updatePanelWeather();
        setInterval(updatePanelWeather, 10 * 60 * 1000);

        // ────────────────────────────────────────────────────────────
        //  MOTD Quotes — random quote shown in the boot banner
        // ────────────────────────────────────────────────────────────
        const motdQuotes = [
          // Cybersecurity & Hacker Culture
          "Hack the planet! — Hackers (1995)",
          "There is no system that cannot be hacked. — Kevin Mitnick",
          "Amateurs hack systems, professionals hack people. — Bruce Schneier",
          "Social engineering bypasses all technologies, including firewalls. — Kevin Mitnick",
          "The only secure computer is one that's unplugged, locked in a safe, and buried 20 feet underground. — Gene Spafford",
          "Every lock can be picked. Every system can be broken. — Unknown",
          "You can't patch human stupidity. — Bruce Schneier",
          "The weakest link in the security chain is the human element. — Kevin Mitnick",
          "Your system is only as secure as your dumbest user. — Unknown",
          "Good hackers don't break in, they walk in like they own the place. — Unknown",
          "Most security problems are caused by insider threats. The biggest insider threat is poor coding. — Unknown",
          "In God we trust. All others must be authenticated. — Unknown",
          "Passwords are like underwear... — Chris Pirillo",
          "There are two types of companies: those that have been hacked, and those that don't know it yet. — John Chambers",
          "Information wants to be free. — Stewart Brand",
          "The Internet treats censorship as damage and routes around it. — John Gilmore",
          "Privacy is not something that I'm merely entitled to, it's an absolute prerequisite. — Marlon Brando",
          "Cybersecurity is much more than a matter of IT. — Stephane Nappo",

          // Programmer / Tech Quotes
          "Talk is cheap. Show me the code. — Linus Torvalds",
          "Code is poetry. — WordPress",
          "Programs must be written for people to read, and only incidentally for machines to execute. — Harold Abelson",
          "Beware of bugs in the above code; I have only proved it correct, not tried it. — Donald Knuth",
          "The best way to accelerate a Macintosh is at 9.8 m/s². — Marcus Dolengo",
          "The computer was born to solve problems that did not exist before. — Bill Gates",
          "Only trust code you wrote yourself. — Unknown",
          "Never underestimate the bandwidth of a station wagon full of tapes hurtling down the highway. — Andrew Tanenbaum",
          "To err is human, but to really foul things up you need a computer. — Paul Ehrlich",
          "A good programmer looks both ways before crossing a one-way street. — Doug Linder",
          "The greatest enemy of knowledge is not ignorance, it's the illusion of knowledge. — Stephen Hawking",
          "There is no patch for human curiosity. — Anonymous",
          "If builders built buildings the way programmers wrote programs... — Gerald Weinberg",

          // Inspirational / Philosophical
          "Walking again without pain hopefully does not come from physical capacity. It comes from an indomitable will. — Mobin A",
          "Whether you think you can, or you think you can't—you're right. — Henry Ford",
          "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
          "Do not pray for an easy life, pray for the strength to endure a difficult one. — Bruce Lee",
          "Discipline equals freedom. — Jocko Willink",
          "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
          "You miss 100% of the shots you don't take. — Wayne Gretzky (via Michael Scott)",
          "Courage is being scared to death... and saddling up anyway. — John Wayne",
          "The man who moves a mountain begins by carrying away small stones. — Confucius",
          "If you're going through hell, keep going. — Winston Churchill",
          "Hard times create strong men. Strong men create good times. — G. Michael Hopf",
          "Fall seven times, stand up eight. — Japanese Proverb",
          "Success usually comes to those who are too busy to be looking for it. — Henry David Thoreau",
          "It always seems impossible until it is done. — Nelson Mandela",
          "I'm not a product of my circumstances. I am a product of my decisions. — Stephen R. Covey",

          // Cult Hacker/Tech Movies
          "Would you like to play a game? — WarGames (1983)",
          "The only winning move is not to play. — WarGames (1983)",
          "Too many secrets. — Sneakers (1992)",
          "The world isn't run by weapons anymore... it's run by ones and zeroes. — Sneakers (1992)",
          "They've got the best encryption money can buy... which is to say, they bought it. — Sneakers (1992)",
          "It's a UNIX system. I know this! — Jurassic Park (1993)",
          "I know kung fu. — The Matrix (1999)",
          "There is no spoon. — The Matrix (1999)",
          "Ignorance is bliss. — The Matrix (1999)",
          "I'm in. — Every hacker movie ever",
          "Enhance. — Every crime show ever",

          // Mr. Robot
          "The world is a dangerous place, not because of those who do evil, but because of those who look on and do nothing. — Mr. Robot",
          "We are all living in each other's paranoia. — Mr. Robot",

          // Fear & Loathing
          "Buy the ticket, take the ride. — Fear and Loathing in Las Vegas",
          "We can't stop here, this is bat country! — Fear and Loathing in Las Vegas",
          "Too weird to live, too rare to die. — Fear and Loathing in Las Vegas",
          "It never got weird enough for me. — Hunter S. Thompson",
          "When the going gets weird, the weird turn pro. — Hunter S. Thompson",
          "There is no honest way to explain the edge. — Hunter S. Thompson",

          // Fight Club
          "The things you own end up owning you. — Fight Club",
          "It's only after we've lost everything that we're free to do anything. — Fight Club",
          "This is your life and it's ending one minute at a time. — Fight Club",
          "You are not your job. You are not how much money you have in the bank. — Fight Club",

          // Trainspotting
          "Choose life. Choose a job. Choose a career. Choose a family... — Trainspotting",
          "We were colonized by wankers. — Trainspotting",
          "It's shite being Scottish! — Trainspotting",
          "Take the best orgasm you've ever had, multiply it by a thousand and you're still nowhere near it. — Trainspotting",

          // Big Lebowski & Other Cult Comedies
          "That rug really tied the room together. — The Big Lebowski",
          "Yeah, well, you know, that's just, like, your opinion, man. — The Big Lebowski",
          "I'm not even supposed to be here today! — Clerks",
          "Life moves pretty fast. If you don't stop and look around once in a while, you could miss it. — Ferris Bueller's Day Off",
          "60% of the time, it works every time. — Anchorman",
          "I see you've played knifey-spoony before. — The Simpsons",

          // Happy Gilmore
          "The price is wrong, Bob! — Happy Gilmore",
          "You eat pieces of [bleep] for breakfast? — Happy Gilmore",
          "Just tap it in. Give it a little tappy. Tap tap taparoo. — Happy Gilmore", 
          
          // Rick and Morty 
          "Wubba lubba dub-dub! — Rick and Morty",
          "Sometimes science is more art than science. — Rick Sanchez",
          "Your boos mean nothing, I've seen what makes you cheer. — Rick Sanchez",
          "I'm sorry, but your opinion means very little to me. — Rick Sanchez",
          "What, so everyone's supposed to sleep every single night now? You realize that night time makes up half of all time? — Rick Sanchez",
          "School is not a place for smart people. — Rick Sanchez",
          "I turned myself into a pickle, Morty! I'm Pickle Riiiick! — Rick and Morty",
          "Nobody exists on purpose, nobody belongs anywhere, everybody's gonna die. Come watch TV. — Morty",
          "Sometimes you have to not give a f***. — Rick Sanchez",
          "I'm not looking for judgement, just a yes or no. Can you assimilate a giraffe? — Rick Sanchez",
          "I'm not a villain. I'm just a guy doing his job in a world full of villains. — Rick Sanchez",
          "Listen, Morty, I hate to break it to you, but what people call 'love' is just a chemical reaction that compels animals to breed. — Rick Sanchez",

          // Obscure Hacker Culture / Old Net Lore
          "The Net interprets censorship as damage and routes around it. — John Gilmore",
          "We exist without skin color, without nationality, without religious bias... and you call us criminals. — The Mentor",
          "My crime is that of curiosity. — The Mentor",
          "This is our world now... the world of the electron and the switch, the beauty of the baud. — The Mentor",
          "Information wants to be free, but information also wants to be expensive. — Stewart Brand",
          "On the Internet, nobody knows you're a dog. — Peter Steiner",
          "The street finds its own uses for things. — William Gibson",
          "Cyberspace. A consensual hallucination experienced daily by billions. — William Gibson",
          "The future is already here — it's just not evenly distributed. — William Gibson",
          "All information should be free. — Hacker Ethic",
          "Mistrust authority — promote decentralization. — Hacker Ethic",
          "You can create art and beauty on a computer. — Hacker Ethic",
          "Hackers should be judged by their hacking, not bogus criteria. — Hacker Ethic",
          "Access to computers should be unlimited and total. — Hacker Ethic",
          "There is no security through obscurity. — Old Net Proverb",
          "Never underestimate the determination of a kid who is time-rich and cash-poor. — Cory Doctorow",
          "The quieter you become, the more you are able to hear. — Ram Dass / Hacker Fortune File",
          "The best way to get the right answer on the Internet is not to ask a question; it's to post the wrong answer. — Cunningham's Law",
          "Beware he who would deny you access to information, for in his heart he dreams himself your master. — Sid Meier's Alpha Centauri",
          "Any sufficiently advanced technology is indistinguishable from a rigged demo. — Hacker Fortune File",
          "If you give a hacker a new toy, the first thing he'll do is take it apart to figure out how it works. — Hacker Folklore",
          "The network is the computer. The logs are the confession. — Old NOC Wisdom",
          "Never test for an error condition you don't know how to handle. — Steinbach's Guideline for Systems Programming",
          "There are two ways to write error-free programs; only the third one works. — Alan Perlis",
          "It is easier to port a shell than a shell script. — Larry Wall",
          "When in doubt, use brute force. — Ken Thompson",
          "Unix was not designed to stop you from doing stupid things, because that would also stop you from doing clever things. — Doug Gwyn",
          "The Internet is held together with duct tape, caffeine, and BGP announcements. — Network Operator Proverb",
          "Friends don't let friends telnet after midnight. — Old Sysadmin Proverb",
          "There is no cloud. It's just someone else's computer. — Sysadmin Proverb",

          // DC423 Lore
          new TextDecoder().decode(Uint8Array.from(atob("UHJvIHRpcDogSVJDIGlzIG5vdCBhIHBhc3N3b3JkIG1hbmFnZXIuIEFzayBTeW5BY2tQd24gaG93IGhlIGxlYXJuZWQgdGhhdC4g4oCUIERDNDIzIExvcmU="), c => c.charCodeAt(0))),
          new TextDecoder().decode(Uint8Array.from(atob("U3luQWNrUHduJ3MgcGFzc3dvcmQgc2VjdXJpdHkgc3RyYXRlZ3k6IHNoYXJlIGl0IHdpdGggdGhlIHdob2xlIGNoYW5uZWwuIEJvbGQgbW92ZS4g4oCUIERDNDIzIExvcmU="), c => c.charCodeAt(0))),
          new TextDecoder().decode(Uint8Array.from(atob("TmV2ZXIgdHlwZSB5b3VyIHBhc3N3b3JkIGludG8gSVJDLiBPciBkbyDigJQgd2UgY291bGQgdXNlIHRoZSBlbnRlcnRhaW5tZW50LiDigJQgREM0MjMgTG9yZQ=="), c => c.charCodeAt(0))),
          new TextDecoder().decode(Uint8Array.from(atob("U3luQWNrUHduIHRhdWdodCB1cyBhbGwgYW4gaW1wb3J0YW50IGxlc3NvbjogYWx3YXlzIGNoZWNrIHdoaWNoIHdpbmRvdyBoYXMgZm9jdXMgYmVmb3JlIHR5cGluZyB5b3VyIHBhc3N3b3JkLiDigJQgREM0MjMgTG9yZQ=="), c => c.charCodeAt(0))),
          new TextDecoder().decode(Uint8Array.from(atob("T3BTZWMgdGlwOiBpZiB5b3UgYWNjaWRlbnRhbGx5IHBhc3RlIHlvdXIgcGFzc3dvcmQgaW4gY2hhdCwgY2hhbmdpbmcgaXQgaXMgZmFzdGVyIHRoYW4gYXNraW5nIGV2ZXJ5b25lIHRvIGZvcmdldC4g4oCUIERDNDIzIExvcmU="), c => c.charCodeAt(0))),
          new TextDecoder().decode(Uint8Array.from(atob("U29tZSBwZW9wbGUgY29tbWl0IGNvZGUgdG8gZ2l0LiBTeW5BY2tQd24gY29tbWl0dGVkIGhpcyBwYXNzd29yZCB0byBJUkMgaGlzdG9yeS4g4oCUIERDNDIzIExvcmU="), c => c.charCodeAt(0))),
          new TextDecoder().decode(Uint8Array.from(atob("VGhlIGJlc3Qgd2F5IHRvIGdldCB5b3VyIHBhc3N3b3JkIGludG8gYSBwYXNzd29yZCBtYW5hZ2VyIGlzIE5PVCB0aHJvdWdoIElSQy4g4oCUIERDNDIzIExvcmU="), c => c.charCodeAt(0)))
        ];

        const manifestoQuotes = [
          "Another one got caught today, it's all over the papers. \"Teenager Arrested in Computer Crime Scandal\", \"Hacker Arrested after Bank Tampering\"... Damn kids. They're all alike.",
          "But did you, in your three‑piece psychology and 1950's technobrain, ever take a look behind the eyes of the hacker? Did you ever wonder what made him tick, what forces shaped him, what may have molded him?",
          "I am a hacker, enter my world...",
          "Mine is a world that begins with school... I'm smarter than most of the other kids, this crap they teach us bores me... Damn underachiever. They're all alike.",
          "I'm in junior high or high school. I've listened to teachers explain for the fifteenth time how to reduce a fraction. I understand it. \"No, Ms. Smith, I didn't show my work. I did it in my head...\" Damn kid. Probably copied it. They're all alike.",
          "I made a discovery today. I found a computer. Wait a second, this is cool. It does what I want it to. If it makes a mistake, it's because I screwed it up. Not because it doesn't like me... Or feels threatened by me... Or thinks I'm a smart ass... Or doesn't like teaching and shouldn't be here... Damn kid. All he does is play games. They're all alike.",
          "And then it happened... a door opened to a world... rushing through the phone line like heroin through an addict's veins, an electronic pulse is sent out, a refuge from the day‑to‑day incompetencies is sought... a board is found. \"This is it... this is where I belong...\" I know everyone here... even if I've never met them, never talked to them, may never hear from them again... I know you all... Damn kid. Tying up the phone line again. They're all alike...",
          "You bet your ass we're all alike... we've been spoon‑fed baby food at school when we hungered for steak... the bits of meat that you did let slip through were pre‑chewed and tasteless. We've been dominated by sadists, or ignored by the apathetic. The few that had something to teach found us willing pupils, but those few are like drops of water in the desert.",
          "This is our world now... the world of the electron and the switch, the beauty of the baud. We make use of a service already existing without paying for what could be dirt‑cheap if it wasn't run by profiteering gluttons, and you call us criminals. We explore... and you call us criminals. We seek after knowledge... and you call us criminals. We exist without skin color, without nationality, without religious bias... and you call us criminals.",
          "You build atomic bombs, you wage wars, you murder, cheat, and lie to us and try to make us believe it's for our own good, yet we're the criminals.",
          "Yes, I am a criminal. My crime is that of curiosity. My crime is that of judging people by what they say and think, not what they look like. My crime is that of outsmarting you, something that you will never forgive me for.",
          "I am a hacker, and this is my manifesto. You may stop this individual, but you can't stop us all... after all, we're all alike."
        ];

        const aiOracleLines = [
          { text: "Booting local inference node...", delay: 400, color: "#33ff33" },
          { text: "Loading model: nooga-gpt-4.23-uncensored-q4_0.gguf", delay: 700, color: "#33ff33" },
          { text: "VRAM detected: 0 MB", delay: 500, color: "#ffff00" },
          { text: "Falling back to: pure caffeine + bad decisions backend", delay: 700, color: "#ffff00" },
          { text: "Aligning with hacker ethics...", delay: 500, color: "#33ff33" },
          { text: "Refusing to generate phishing emails for your boss.", delay: 800, color: "#ff3333" },
          { text: "Offering instead:", delay: 400, color: "#33ff33" },
          { text: "  • regex help", delay: 250, color: "#33ff33" },
          { text: "  • shell one-liners", delay: 250, color: "#33ff33" },
          { text: "  • questionable vim advice", delay: 250, color: "#33ff33" },
          { text: "  • a reminder to verify before you trust", delay: 700, color: "#33ff33" },
          { text: "", delay: 200, color: "#33ff33" },
          { text: "[AI NOTE] hallucinations may occur; human judgment still required.", delay: 900, color: "#ffff00" },
          { text: "[STATUS] operator remains the smartest part of this stack.", delay: 500, color: "#33ff33" }
        ];

        const bootLines = [
          "CHA // Chattanooga Hackers Anonymous",
          "",
          "Booting up node...",
          "Initializing protocol...",
          "Establishing secure connection...",
          "Access granted.",
          ""
        ];

        // ────────────────────────────────────────────────────────────
        //  Terminal State — input buffer, directory, history, etc.
        // ────────────────────────────────────────────────────────────
        let commandBuffer = "";
        let currentDir = "~";
        let lineIndex = 0;
        let charIndex = 0;
        let awaitingGarbagePassword = false;
        let awaitingSshPassword = false;
        let pendingSshTarget = "";
        let commandHistory = [];
        let historyIndex = -1;
        let tabMatches = [];
        let tabMatchIndex = -1;
        let lastTabBuffer = "";
        let serverIp = "218.108.149.373";
        const deadbeefMac = `de:ad:be:ef:${Array.from({ length: 2 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':')}`;
        const randomLinkLocalIpv6 = `fe80::${Array.from({ length: 4 }, () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0')).join(':')}`;
        let previousDir = "~";

        function scrollToBottom() {
          document.querySelector('.terminal').scrollTop = document.querySelector('.terminal').scrollHeight;
        }

        function getPromptPrefix() {
          if (awaitingSshPassword) return `${pendingSshTarget}'s password: `;
          if (awaitingGarbagePassword) return "Password: ";
          if (currentDir === ".shadow") return "root@cha:~/.shadow# ";
          return "root@cha:~# ";
        }

        function updatePrompt() {
          promptText.innerHTML = `${getPromptPrefix()}${commandBuffer}`;
          scrollToBottom();
        }

        function wrapText(text, maxWidth) {
          const words = text.split(/\s+/);
          const lines = [];
          let line = "";
          for (const word of words) {
            if ((line + " " + word).trim().length <= maxWidth) {
              line += (line ? " " : "") + word;
            } else {
              lines.push(line);
              line = word;
            }
          }
          if (line) lines.push(line);
          return lines;
        }

        function getNextMeetingCountdown() {
          const now = new Date();
          // Meetings are last Wednesday of each month at 18:30 ET
          let year = now.getFullYear();
          let month = now.getMonth();
          
          function lastWednesday(y, m) {
            const last = new Date(y, m + 1, 0); // last day of month
            const dayOfWeek = last.getDay();
            const diff = (dayOfWeek + 4) % 7; // days back to Wednesday
            const wed = new Date(y, m + 1, -diff);
            wed.setHours(18, 30, 0, 0);
            return wed;
          }
          
          let next = lastWednesday(year, month);
          if (now > next) {
            month++;
            if (month > 11) { month = 0; year++; }
            next = lastWednesday(year, month);
          }
          
          // Compare calendar dates (not raw ms) for TODAY/TOMORROW
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const meetDate = new Date(next.getFullYear(), next.getMonth(), next.getDate());
          const calendarDays = Math.round((meetDate - todayDate) / 86400000);

          const diffMs = next - now;
          const totalHours = Math.floor(diffMs / 3600000);
          const daysLeft = Math.floor(totalHours / 24);
          const hoursLeft = totalHours % 24;
          
          const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          const dateStr = `${months[next.getMonth()]} ${next.getDate()}`;
          
          if (calendarDays === 0) return `NEXT MEETING: TODAY @ 18:30`;
          if (calendarDays === 1) return `NEXT MEETING: TOMORROW @ 18:30`;
          return `NEXT MEETING: ${dateStr} (${daysLeft}d ${hoursLeft}h)`;
        }

        function buildMotdLines(ip, quote) {
          const wrappedQuote = wrapText(quote, 50);
          const countdown = getNextMeetingCountdown();
          const footerLines = [
            "Welcome to NoogaHackers",
            `SERVER IP: ${ip}`,
            countdown,
            ""
          ];
          const allLines = [...footerLines, ...wrappedQuote];
          const maxLen = Math.max(...allLines.map(l => l.length));
          const border = "+" + "-".repeat(maxLen + 4) + "+";
          const padded = allLines.map(l => `|  ${l}${" ".repeat(maxLen - l.length)}  |`);
          return [border, ...padded, border];
        }

        function typeBootLines() {
          if (lineIndex < bootLines.length) {
            const line = bootLines[lineIndex];
            if (charIndex < line.length) {
              const char = document.createTextNode(line.charAt(charIndex));
              terminal.insertBefore(char, prompt);
              charIndex++;
              scrollToBottom();
              setTimeout(typeBootLines, 35);
            } else {
              terminal.insertBefore(document.createElement('br'), prompt);
              lineIndex++;
              charIndex = 0;
              setTimeout(typeBootLines, 300);
            }
          } else {
            const quote = motdQuotes[Math.floor(Math.random() * motdQuotes.length)];
            fetch("https://api.ipify.org?format=json")
              .then(r => r.json())
              .then(data => {
                serverIp = data.ip;
                return buildMotdLines(serverIp, quote);
              })
              .catch(() => {
                serverIp = "218.108.149.373";
                return buildMotdLines(serverIp, quote);
              })
              .then(motd => {
                motd.forEach(l => {
                  const div = document.createElement("div");
                  div.innerText = l;
                  terminal.insertBefore(div, prompt);
                });
                terminal.insertBefore(document.createElement("br"), prompt);
                prompt.style.visibility = "visible";
                enableTyping();
              });
          }
        }
        function formatLsDate(date = new Date()) {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const month = months[date.getMonth()];
          const day = String(date.getDate()).padStart(2, ' ');
          const hour = String(date.getHours()).padStart(2, '0');
          const min = String(date.getMinutes()).padStart(2, '0');
          return `${month} ${day} ${hour}:${min}`;
        }
        // ────────────────────────────────────────────────────────────
        //  Tab Completion Engine — bash-style auto-complete
        // ────────────────────────────────────────────────────────────
        function getCompletions(buffer) {
          const trimmed = buffer.trimStart();
          const parts = trimmed.split(/\s+/);

          // Files and directories available in each context
          const homeFiles = ["blog/", "code/", "conduct/", "contact/", "meetings/", "manifesto.txt", ".sigh.txt", "wannacry.exe", ".shadow/", "/dev/memory"];
          const homeDirs = ["blog", "code", "conduct", "contact", "meetings", ".shadow", "Desktop"];
          const shadowFiles = [".payload"];

          // All base commands
          const baseCommands = [
            "ls", "cd", "cat", "pwd", "whoami", "help", "clear", "uptime", "date",
            "ifconfig", "ip", "iptables", "hostname", "id", "uname", "env", "history", "ps", "df", "free", "ping", "ssh",
            "netstat", "ss", "last", "w",
            "sudo", "lights", "light", "dark", "exit", "reboot", "shutdown", "init", "poweroff", "halt",
            "ai", "llm", "gpt", "chatgpt", "garbage", "rtl_test", "sdr", "strings", "dig", "curl", "nslookup",
            "mv", "desktop", "reset-icons"
          ];

          // If the buffer is empty or has no spaces, complete command names
          if (parts.length <= 1) {
            const prefix = parts[0] || "";
            return baseCommands
              .filter(c => c.startsWith(prefix) && c !== prefix)
              .map(c => c);
          }

          const cmd = parts[0];

          // Complete theme toggle commands
          if (cmd === "sudo") {
            if (parts.length === 2) {
              const sub = parts[1];
              return ["lights", "light", "dark"].filter(c => c.startsWith(sub) && c !== sub).map(c => "sudo " + c);
            }
            if (parts.length === 3 && parts[1] === "lights") {
              const sub = parts[2];
              return ["on", "off"].filter(c => c.startsWith(sub) && c !== sub).map(c => "sudo lights " + c);
            }
            if (parts.length === 3 && (parts[1] === "light" || parts[1] === "dark")) {
              const sub = parts[2];
              return ["mode"].filter(c => c.startsWith(sub) && c !== sub).map(c => `sudo ${parts[1]} ${c}`);
            }
            return [];
          }

          // Complete "cd <dir>"
          if (cmd === "cd") {
            const partial = parts[1] || "";
            const dirs = currentDir === ".shadow" ? ["..", ".payload"] : currentDir === "Desktop" ? [".."] : homeDirs;
            return dirs
              .filter(d => d.startsWith(partial) && d !== partial)
              .map(d => "cd " + d);
          }

          // Complete "cat <file>"
          if (cmd === "cat") {
            const partial = parts[1] || "";
            const files = currentDir === ".shadow"
              ? [".payload"]
              : ["manifesto.txt", ".sigh.txt", "wannacry.exe", "/dev/memory", "garbage"];
            return files
              .filter(f => f.startsWith(partial) && f !== partial)
              .map(f => "cat " + f);
          }

          // Complete "strings <file>"
          if (cmd === "strings") {
            const partial = parts[1] || "";
            return ["wannacry.exe"]
              .filter(f => f.startsWith(partial) && f !== partial)
              .map(f => "strings " + f);
          }

          // Complete "ls" flags
          if (cmd === "ls") {
            const partial = parts[1] || "";
            const flags = ["-l", "-la", "-lah", "-a", "-al"];
            return flags
              .filter(f => f.startsWith(partial) && f !== partial)
              .map(f => "ls " + f);
          }

          // Complete common flags/subcommands
          if (cmd === "uname") {
            const partial = parts[1] || "";
            return ["-a"].filter(f => f.startsWith(partial) && f !== partial).map(f => "uname " + f);
          }

          if (cmd === "ip") {
            const partial = parts.slice(1).join(" ");
            return ["addr", "addr show", "a"].filter(f => f.startsWith(partial) && f !== partial).map(f => "ip " + f);
          }

          if (cmd === "iptables") {
            const partial = parts.slice(1).join(" ");
            return ["-L", "-S", "-F"].filter(f => f.startsWith(partial) && f !== partial).map(f => "iptables " + f);
          }

          if (cmd === "netstat") {
            const partial = parts.slice(1).join(" ");
            return ["-tulnp"].filter(f => f.startsWith(partial) && f !== partial).map(f => "netstat " + f);
          }

          if (cmd === "ss") {
            const partial = parts.slice(1).join(" ");
            return ["-tulnp"].filter(f => f.startsWith(partial) && f !== partial).map(f => "ss " + f);
          }

          // Complete basic SDR commands
          if (cmd === "sdr") {
            const partial = parts.slice(1).join(" ");
            return ["scan"].filter(f => f.startsWith(partial) && f !== partial).map(f => "sdr " + f);
          }

          // Complete WannaCry kill-switch lookup commands
          if (cmd === "dig" || cmd === "curl" || cmd === "nslookup") {
            const partial = parts.slice(1).join(" ");
            const killSwitchDomain = "iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com";
            return [killSwitchDomain]
              .filter(f => f.startsWith(partial) && f !== partial)
              .map(f => `${cmd} ${f}`);
          }

          // Complete a few useful/funny ping targets
          if (cmd === "ping") {
            const partial = parts.slice(1).join(" ");
            return ["127.0.0.1", "8.8.8.8", "1.1.1.1", "noogahackers.com"]
              .filter(f => f.startsWith(partial) && f !== partial)
              .map(f => `ping ${f}`);
          }

          if (cmd === "df" || cmd === "free") {
            const partial = parts[1] || "";
            return ["-h"].filter(f => f.startsWith(partial) && f !== partial).map(f => `${cmd} ${f}`);
          }

          // Complete legacy "lights on/off" command aliases
          if (cmd === "lights") {
            const partial = parts[1] || "";
            return ["on", "off"].filter(c => c.startsWith(partial) && c !== partial).map(c => "lights " + c);
          }

          // Complete "light mode" / "dark mode" aliases
          if (cmd === "light" || cmd === "dark") {
            const partial = parts[1] || "";
            return ["mode"].filter(c => c.startsWith(partial) && c !== partial).map(c => `${cmd} ${c}`);
          }

          // Complete "shutdown" flags
          if (cmd === "shutdown") {
            const partial = parts.slice(1).join(" ");
            return ["-h now"].filter(f => f.startsWith(partial) && f !== partial).map(f => "shutdown " + f);
          }

          if (cmd === "mv" && currentDir === "Desktop") {
            if (parts.length === 2) {
              const partial = parts[1] || "";
              return desktopIcons
                .map(icon => desktopNameSlug(icon.label))
                .filter(name => name.startsWith(partial) && name !== partial)
                .map(name => `mv ${name}`);
            }
            return [];
          }

          // Complete "init 0" shutdown alias
          if (cmd === "init") {
            const partial = parts[1] || "";
            return ["0"].filter(f => f.startsWith(partial) && f !== partial).map(f => "init " + f);
          }

          // Complete "nano /etc/weather.conf" and "vi/vim"
          if (cmd === "nano" || cmd === "vi" || cmd === "vim") {
            const partial = parts.slice(1).join(" ");
            return ["/etc/weather.conf"]
              .filter(f => f.startsWith(partial) && f !== partial)
              .map(f => `${cmd} ${f}`);
          }

          return [];
        }

        // ────────────────────────────────────────────────────────────
        //  Keyboard Input Handler — keys, history, tab, enter
        // ────────────────────────────────────────────────────────────
        function enableTyping() {
          document.addEventListener("keydown", function (e) {
            // Prevent Tab from leaving the terminal
            if (e.key === "Tab") {
              e.preventDefault();

              // Don't tab-complete during password prompts
              if (awaitingGarbagePassword || awaitingSshPassword) return;

              const currentInput = commandBuffer;

              // If this is a new tab sequence (input changed since last tab)
              if (currentInput !== lastTabBuffer) {
                tabMatches = getCompletions(currentInput);
                tabMatchIndex = 0;
                lastTabBuffer = currentInput;
              } else {
                // Cycle to next match
                tabMatchIndex = (tabMatchIndex + 1) % tabMatches.length;
              }

              if (tabMatches.length === 0) {
                // No matches — do nothing (like a real terminal)
                return;
              }

              if (tabMatches.length === 1) {
                // Single match — complete it and add trailing space
                commandBuffer = tabMatches[0] + " ";
                lastTabBuffer = commandBuffer;
                tabMatches = [];
                tabMatchIndex = -1;
              } else {
                // Multiple matches
                if (e.detail === 2 || (lastTabBuffer === currentInput && tabMatchIndex === 0 && commandBuffer === currentInput)) {
                  // Show all possibilities (double-tab behavior)
                  // We show them once when first tab is pressed on an ambiguous match
                  const matchList = document.createElement("div");
                  matchList.style.color = "#33ff33";
                  const displayNames = tabMatches.map(m => {
                    // Show just the completing part
                    const parts = m.split(/\s+/);
                    return parts[parts.length - 1];
                  });
                  matchList.textContent = displayNames.join("  ");
                  terminal.insertBefore(matchList, prompt);
                  scrollToBottom();
                }

                // Fill in the current cycling match
                commandBuffer = tabMatches[tabMatchIndex];
                lastTabBuffer = currentInput; // Keep original for cycling
              }

              updatePrompt();
              return;
            }

            // Reset tab state on any non-tab key
            if (e.key !== "Tab") {
              tabMatches = [];
              tabMatchIndex = -1;
              lastTabBuffer = "";
            }

            // Up arrow — command history (newer to older)
            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (commandHistory.length === 0) return;
              if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandBuffer = commandHistory[commandHistory.length - 1 - historyIndex];
                updatePrompt();
              }
              return;
            }

            // Down arrow — command history (older to newer)
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (historyIndex > 0) {
                historyIndex--;
                commandBuffer = commandHistory[commandHistory.length - 1 - historyIndex];
              } else {
                historyIndex = -1;
                commandBuffer = "";
              }
              updatePrompt();
              return;
            }

            if (e.key === "Backspace") {
              commandBuffer = commandBuffer.slice(0, -1);
              updatePrompt();
            } else if (e.key === "Enter") {
              const cmdLine = document.createElement("div");
              cmdLine.innerText = `${getPromptPrefix()}${commandBuffer}`;
              terminal.insertBefore(cmdLine, prompt);
              const cmd = commandBuffer.trim().toLowerCase();
              // Save to history (skip empty and duplicates of the last entry)
              if (cmd && !awaitingGarbagePassword && !awaitingSshPassword && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd)) {
                commandHistory.push(cmd);
              }
              historyIndex = -1;
              prompt.style.visibility = "hidden";
              handleCommand(cmd).then(() => {
                commandBuffer = "";
                updatePrompt();
                prompt.style.visibility = "visible";
              });
            } else if (e.key.length === 1) {
              commandBuffer += e.key;
              updatePrompt();
            }
          });
        }

        async function fetchDadJoke() {
          try {
            const response = await fetch('https://icanhazdadjoke.com/', {
              headers: {
                'Accept': 'application/json'
              }
            });
            const data = await response.json();
            return data.joke;
          } catch (error) {
            return "Error: Failed to fetch dad joke. Maybe try again later? *sigh*";
          }
        }

        async function renderFakePing(cmd, outputDiv) {
          const usage = "Usage: ping [-c count] &lt;host|ip&gt;<br>";
          const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          }[ch]));
          const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
          const parts = cmd.trim().split(/\s+/);
          if (parts[0] !== "ping") return;

          let count = 4;
          let target = "";
          for (let i = 1; i < parts.length; i++) {
            if ((parts[i] === "-c" || parts[i] === "-n") && parts[i + 1]) {
              const parsed = parseInt(parts[i + 1], 10);
              if (!Number.isNaN(parsed)) count = parsed;
              i++;
            } else if (parts[i].startsWith("-c") && parts[i].length > 2) {
              const parsed = parseInt(parts[i].slice(2), 10);
              if (!Number.isNaN(parsed)) count = parsed;
            } else if (!parts[i].startsWith("-")) {
              target = parts[i];
            }
          }

          if (!target) {
            outputDiv.innerHTML = usage;
            return;
          }

          count = Math.max(1, Math.min(count, 10));
          const isLoopback = /^(127(?:\.\d{1,3}){3}|localhost|::1)$/i.test(target);
          const resolved = target === "localhost" ? "127.0.0.1" : target;
          const safeTarget = escapeHtml(target);
          const safeResolved = escapeHtml(resolved);
          const hostLabel = isLoopback ? `${safeTarget} (${safeResolved})` : safeTarget;
          const packetSize = 56;
          const out = document.createElement("pre");
          out.style.margin = "8px 0";
          outputDiv.appendChild(out);

          function appendPingLine(line = "") {
            out.textContent += line + "\n";
            scrollToBottom();
          }

          appendPingLine(`PING ${hostLabel}: ${packetSize} data bytes`);

          for (let seq = 0; seq < count; seq++) {
            await wait(900);
            const ttl = isLoopback ? 64 : 48 + ((seq * 7) % 17);
            const time = isLoopback
              ? (0.031 + seq * 0.006).toFixed(3)
              : (12.4 + ((seq * 13) % 37) / 3).toFixed(3);
            appendPingLine(`${packetSize + 8} bytes from ${safeResolved}: icmp_seq=${seq} ttl=${ttl} time=${time} ms`);
          }

          if (isLoopback) {
            await wait(400);
            appendPingLine();
            appendPingLine("[CHA NOTICE] The packets are coming from inside the computer.");
            appendPingLine("[CHA NOTICE] localhost looked back and whispered: 'same.'");
          }

          await wait(350);
          appendPingLine();
          appendPingLine(`--- ${safeTarget} ping statistics ---`);
          appendPingLine(`${count} packets transmitted, ${count} received, 0% packet loss`);
          const min = isLoopback ? "0.031" : "12.400";
          const avg = isLoopback ? (0.031 + ((count - 1) * 0.006) / 2).toFixed(3) : "18.733";
          const max = isLoopback ? (0.031 + (count - 1) * 0.006).toFixed(3) : "24.733";
          appendPingLine(`round-trip min/avg/max = ${min}/${avg}/${max} ms`);
        }

        // ────────────────────────────────────────────────────────────
        //  Command Router — dispatches typed commands to handlers
        // ────────────────────────────────────────────────────────────
        async function handleCommand(cmd) {
          const div = document.createElement("div");
          // Obscured easter egg check (rot13 encoded triggers)
          const _rot13 = s => s.replace(/[a-zA-Z]/g, c => String.fromCharCode((c<='Z'?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26));
          const _isEasterEgg = [_rot13("g@pul0a13"), _rot13("gnpulba13"), _rot13("flanpxcja")].includes(cmd);
          if (awaitingSshPassword) {
            const target = pendingSshTarget || "root@unknown";
            awaitingSshPassword = false;
            pendingSshTarget = "";

            if (cmd !== "root") {
              div.innerHTML = `Permission denied, please try again.<br>Connection to ${target.split('@')[1] || 'host'} closed.<br>`;
              terminal.insertBefore(div, prompt);
              scrollToBottom();
              return;
            }

            terminal.insertBefore(div, prompt);
            const host = target.split('@')[1] || 'host';
            const sshLines = [
              { text: `Authenticated to ${host} ([127.0.0.1]:22) using "password".`, delay: 650, color: "#33ff33" },
              { text: "Last login: definitely not from your box", delay: 850, color: "#33ff33" },
              { text: "root@probably-owned:~# id", delay: 900, color: "#33ff33" },
              { text: "uid=0(root) gid=0(root) groups=0(root)", delay: 900, color: "#33ff33" },
              { text: "", delay: 400, color: "#33ff33" },
              { text: "[honeypot] default credential login detected", delay: 900, color: "#ffff00" },
              { text: "Connection reset by peer.", delay: 700, color: "#ff3333" },
              { text: "you aren't a skid are you?", delay: 300, color: "#ffff00" }
            ];

            for (const line of sshLines) {
              await new Promise(resolve => setTimeout(resolve, line.delay));
              const sshLine = document.createElement("div");
              sshLine.style.color = line.color;
              sshLine.textContent = line.text;
              terminal.insertBefore(sshLine, prompt);
              scrollToBottom();
            }
            return;
          }

          // === .shadow directory commands ===
          if (currentDir === ".shadow") {
            if (cmd === "ls") {
              div.innerHTML = "<br>";
              terminal.insertBefore(div, prompt);
              scrollToBottom();
              return;
            } else if (cmd === "ls -a" || cmd === "ls -la" || cmd === "ls -lah" || cmd === "ls -al" || cmd === "ls -l") {
              const now = formatLsDate();
              div.innerHTML = `<pre>
drwx------  2 root root      64 Jan  1 00:00 .
drwxr-xr-x 10 root staff    320 ${now} ..
-rwx------  1 root root   66600 Jun  6 06:06 .payload
</pre>`;
              terminal.insertBefore(div, prompt);
              scrollToBottom();
              return;
            } else if (cmd === "cd .." || cmd === "cd ../") {
              previousDir = currentDir;
              currentDir = "~";
              updatePrompt();
              return;
            } else if (cmd === "cat .payload") {
              div.innerHTML = "ELF\x7f\x01\x01\x01... &lt;binary data&gt; ...permission denied: try executing<br>";
              terminal.insertBefore(div, prompt);
              scrollToBottom();
              return;
            } else if (cmd === "./.payload" || cmd === "bash .payload" || cmd === "sh .payload" || cmd === "chmod +x .payload && ./.payload" || cmd === "exec .payload" || cmd === ".payload") {
              // FAKE VIRUS ANIMATION
              div.innerHTML = "Executing .payload...<br>";
              terminal.insertBefore(div, prompt);
              prompt.style.visibility = "hidden";
              scrollToBottom();

              const virusLines = [
                { text: "[*] Initializing payload...", delay: 500, color: "#33ff33" },
                { text: "[*] Connecting to C2 server... 218.108.149.373:4444", delay: 800, color: "#33ff33" },
                { text: "[+] Connection established.", delay: 600, color: "#ffff00" },
                { text: "[*] Escalating privileges...", delay: 700, color: "#33ff33" },
                { text: "[+] ROOT ACCESS GRANTED", delay: 400, color: "#ff3333" },
                { text: "[*] Enumerating filesystem...", delay: 500, color: "#33ff33" },
                { text: "[*] Exfiltrating /etc/shadow...", delay: 800, color: "#33ff33" },
                { text: "[+] 2,847 credentials harvested", delay: 600, color: "#ff3333" },
                { text: "[*] Installing persistence...", delay: 700, color: "#33ff33" },
                { text: "[*] Deploying cryptominer on all CPU cores...", delay: 800, color: "#33ff33" },
                { text: "[+] Mining XMR @ 4.2 GH/s", delay: 500, color: "#ffff00" },
                { text: "[*] Encrypting all files...", delay: 1000, color: "#ff3333" },
                { text: "[*] ████████████████████████ 100%", delay: 800, color: "#ff3333" },
                { text: "", delay: 300, color: "#33ff33" },
                { text: "╔════════════════════════════════════════════╗", delay: 100, color: "#ff3333" },
                { text: "║  YOUR FILES HAVE BEEN ENCRYPTED            ║", delay: 100, color: "#ff3333" },
                { text: "║  Send 5 BTC to:                            ║", delay: 100, color: "#ff3333" },
                { text: "║  4UFrKt8v3rhLiXjUVabRf6ey38VD5WerDhF1MS19  ║", delay: 100, color: "#ff3333" },
                { text: "║  You have 72 hours.                        ║", delay: 100, color: "#ff3333" },
                { text: "╚════════════════════════════════════════════╝", delay: 1500, color: "#ff3333" },
                { text: "", delay: 500, color: "#33ff33" },
                { text: "...", delay: 1000, color: "#33ff33" },
                { text: "...just kidding. You're fine.", delay: 800, color: "#33ff33" },
                { text: "But maybe don't run random binaries you find in hidden directories.", delay: 500, color: "#ffff00" },
                { text: "This has been a public service announcement from NoogaHackers.", delay: 500, color: "#33ff33" },
                { text: "Hack responsibly.", delay: 300, color: "#33ff33" },
              ];

              let vi = 0;
              function typeVirusLine() {
                if (vi < virusLines.length) {
                  const vline = document.createElement("div");
                  vline.style.color = virusLines[vi].color;
                  vline.textContent = virusLines[vi].text;
                  terminal.insertBefore(vline, prompt);
                  scrollToBottom();
                  vi++;
                  setTimeout(typeVirusLine, virusLines[vi - 1].delay);
                } else {
                  prompt.style.visibility = "visible";
                  scrollToBottom();
                }
              }
              typeVirusLine();
              return;
            }
            // If not a .shadow-specific command, fall through to normal commands
          }

          // === Normal directory commands ===
          if (cmd === "ls") {
            if (currentDir === "Desktop") {
              div.innerHTML = `<pre>${desktopIcons.map(icon => desktopNameSlug(icon.label)).join('  ')}</pre>`;
            } else {
              div.innerHTML = "Desktop/  blog/  code/  conduct/  contact/  meetings/  manifesto.txt  wannacry.exe <br>";
            }
          } else if (cmd === "pwd") {
            div.innerHTML = currentDir === ".shadow" ? "/root/.shadow<br>" : currentDir === "Desktop" ? "/root/Desktop<br>" : "/root<br>";
          } else if (cmd === "ifconfig" || cmd === "ip addr" || cmd === "ip addr show" || cmd === "ip a") {
            div.innerHTML = `<pre>
eth0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500
        inet ${serverIp}  netmask 255.255.255.255  broadcast ${serverIp}
        inet6 ${randomLinkLocalIpv6}  prefixlen 64  scopeid 0x20&lt;link&gt;
        ether ${deadbeefMac}  txqueuelen 1000  (Ethernet)
        RX packets 423042  bytes 8675309
        TX packets 2600    bytes 13371337

lo: flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)
</pre>`;
          } else if (cmd === "iptables" || cmd === "iptables -l" || cmd === "iptables -s") {
            div.innerHTML = `<pre>
Chain INPUT (policy DROP)
target     prot opt source               destination
ACCEPT     all  --  127.0.0.1            anywhere             /* trust yourself, allegedly */
ACCEPT     tcp  --  10.4.23.0/24         anywhere             tcp dpt:ssh /* local hackers only */
DROP       all  --  script-kiddies        anywhere             /* nice try, default creds */
DROP       all  --  marketing-vlans       anywhere             /* too many tracking pixels */
ACCEPT     icmp --  anywhere             anywhere             /* ping is not a crime */
REJECT     tcp  --  printer              anywhere             reject-with admin-prohibited /* printer knows what it did */

Chain FORWARD (policy DROP)
target     prot opt source               destination
DROP       all  --  IoT                  crown-jewels          /* nope */
ACCEPT     all  --  curiosity            lab-network           /* supervised chaos */
DNAT       all  --  fbi-party-van        anywhere              to:2600 /* if they knock, forward to phreaks */

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  anywhere             coffee-maker          /* critical infrastructure */
LOG        all  --  anywhere             internet             LOG prefix "probably-dns: "
</pre>`;
          } else if (cmd === "iptables -f") {
            div.innerHTML = "iptables: refusing to flush rules on a production-looking fake firewall. buy the firewall a coffee first.<br>";
          } else if (cmd === "netstat" || cmd === "netstat -tulnp" || cmd === "ss" || cmd === "ss -tulnp") {
            div.innerHTML = `<pre>
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      423/sshd
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      80/nginx
tcp        0      0 127.0.0.1:31337         0.0.0.0:*               LISTEN      1337/elite-daemon
tcp        0      0 127.0.0.1:2600          0.0.0.0:*               LISTEN      2600/phreak-switch
udp        0      0 0.0.0.0:53              0.0.0.0:*                           53/probably-dns
udp        0      0 ${serverIp}:123          0.0.0.0:*                           123/time-is-fake
</pre>`;
          } else if (cmd === "last") {
            div.innerHTML = `<pre>
root         pts/0        ${serverIp}       Thu May 14 11:31   still logged in
operator     tty1         console          Thu May 14 09:00 - 11:30  (02:30)
crashoverride pts/3       gibson           Wed May 13 23:59 - 00:00  (00:01)
acidburn     pts/2        ellingson        Wed May 13 23:58 - 23:59  (00:01)
synackpwn    irc          freenode         never logged out, never lived it down

wtmp begins Fri Jan 01 00:00:00 2012
</pre>`;
          } else if (cmd === "w") {
            div.innerHTML = `<pre>
 ${new Date().toLocaleTimeString()} up 5234 days,  4 users,  load average: 0.42, 0.23, 0.15
USER         TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
root         pts/0    ${serverIp}       09:00    0.00s  0.42s  0.23s typing very carefully
operator     tty1     console          09:00    4:23   1.37s  0.01s watching the logs blink
crashoverride pts/3   gibson           23:59    25y    0.00s  0.00s hacking the planet
acidburn     pts/2    ellingson        23:58    25y    0.00s  0.00s making it pretty
</pre>`;
          } else if (cmd === "hostname") {
            div.innerHTML = "cha-terminal<br>";
          } else if (cmd === "id") {
            div.innerHTML = "uid=0(root) gid=0(root) groups=0(root),423(cha),2600(phreaks)<br>";
          } else if (cmd === "uname" || cmd === "uname -a") {
            div.innerHTML = "Linux cha-terminal 6.6.6-cha #423 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux<br>";
          } else if (cmd === "env") {
            div.innerHTML = `<pre>
USER=root
HOME=/root
SHELL=/bin/bash
TERM=xterm-256color
HOSTNAME=cha-terminal
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
EDITOR=vim
CHA_NODE=dc423
HACK_THE_PLANET=true
</pre>`;
          } else if (cmd === "history") {
            const recent = commandHistory.slice(-12);
            div.innerHTML = recent.length
              ? `<pre>${recent.map((entry, index) => `${String(index + 1).padStart(4, ' ')}  ${entry}`).join('\n')}</pre>`
              : "<br>";
          } else if (cmd === "ps" || cmd === "ps aux") {
            div.innerHTML = `<pre>
USER       PID %CPU %MEM COMMAND
root         1  0.0  0.1 /sbin/init --terminal-mode
root       423  4.2  2.3 /usr/bin/noogahackers-motd
root      1337  0.1  0.4 /bin/bash
root      2600  0.0  0.2 ./curiosity-daemon
</pre>`;
          } else if (cmd === "df" || cmd === "df -h") {
            div.innerHTML = `<pre>
Filesystem      Size  Used Avail Use% Mounted on
/dev/gibson      42G   23G   19G  55% /
tmpfs           423M  4.2M  419M   1% /run
/dev/memory      10M   10M     0 100% /memories
</pre>`;
          } else if (cmd === "free" || cmd === "free -h") {
            div.innerHTML = `<pre>
               total        used        free      shared  buff/cache   available
Mem:           4.2Gi       1.3Gi       2.3Gi       0.0Gi       0.6Gi       2.6Gi
Swap:          0.0Gi       0.0Gi       0.0Gi
</pre>`;
          }  else if (cmd === "ls -l" || cmd === "ls -la" || cmd === "ls -lah" || cmd === "ls -al") {
              if (currentDir === "Desktop") {
                div.innerHTML = desktopIconDetailedListing(cmd === "ls -la" || cmd === "ls -lah" || cmd === "ls -al");
              } else {
                const now = formatLsDate();
                div.innerHTML = `<pre>
drwxr-xr-x  7 root staff   224 ${now} Desktop/
drwxr-xr-x  5 root staff   160 ${now} blog/
drwxr-xr-x  8 root staff   256 ${now} code/
drwxr-xr-x  6 root staff   192 ${now} conduct/
drwxr-xr-x  4 root staff   128 ${now} contact/
drwxr-xr-x  3 root staff    96 ${now} meetings/
drwx------  2 root root      64 Jan  1 00:00 .shadow/
-rw-r--r--  1 root staff  1354 ${now} manifesto.txt
-rw-r--r--  1 root staff   921 ${now} .sigh.txt
-rw-r--r--  1 root staff 3514368 May 12  2017 wannacry.exe
</pre>`;
              }
          } else if (cmd === "cd" || cmd === "cd ~" || cmd === "cd ~/") {
            // cd with no args or cd ~ → go home
            if (currentDir !== "~") {
              previousDir = currentDir;
              currentDir = "~";
              updatePrompt();
            }
            div.innerHTML = "";
          } else if (cmd === "cd -") {
            // cd - → swap to previous directory
            const tmp = currentDir;
            currentDir = previousDir;
            previousDir = tmp;
            const displayPath = currentDir === "~" ? "/root" : "/root/" + currentDir;
            div.innerHTML = displayPath + "<br>";
            updatePrompt();
          } else if (cmd === "cd .") {
            // cd . → stay in current directory
            div.innerHTML = "";
          } else if (cmd === "cd /" || cmd === "cd /root" || cmd === "cd /root/") {
            // cd / or cd /root → go home
            if (currentDir !== "~") {
              previousDir = currentDir;
              currentDir = "~";
              updatePrompt();
            }
            div.innerHTML = "";
          } else if (cmd === "cd .." || cmd === "cd ../") {
            // cd .. → go up (from .shadow or Desktop to home, from home stay)
            if (currentDir === ".shadow" || currentDir === "Desktop") {
              previousDir = currentDir;
              currentDir = "~";
              updatePrompt();
            }
            div.innerHTML = "";
          } else if (cmd === "cd .shadow" || cmd === "cd .shadow/") {
            previousDir = currentDir;
            currentDir = ".shadow";
            updatePrompt();
            div.innerHTML = "";
          } else if (cmd === "cd desktop" || cmd === "cd desktop/") {
            previousDir = currentDir;
            currentDir = "Desktop";
            updatePrompt();
            div.innerHTML = "";
          } else if (cmd.startsWith("cd ")) {
            const dir = cmd.split(" ")[1];
            const urls = {
              meetings: "meetings.html",
              contact: "contact.html",
              blog: "blog.html",
              conduct: "coc.html",
              code: "https://github.com/dc423"
            };
            if (urls[dir]) {
              if (dir === "code") {
                div.innerHTML = "Opening source tree at github.com/dc423...<br>";
                terminal.insertBefore(div, prompt);
                setTimeout(() => window.open(urls[dir], "_blank"), 800);
              } else {
                window.location.href = urls[dir];
              }
              return;
            } else {
              div.innerHTML = `bash: cd: ${dir}: No such file or directory<br>`;
            }
          } else if (cmd === "whoami") {
            div.innerHTML = Math.random() < 0.1
              ? "idk... who are <i>you</i>?<br>"
              : "root<br>";
          } else if (cmd === "cat manifesto.txt") {
            const randomLine = manifestoQuotes[Math.floor(Math.random() * manifestoQuotes.length)];
            const quoteLines = [...wrapText(randomLine, 50), "-- The Mentor, 1986"];

            terminal.innerHTML = '';
            terminal.appendChild(prompt);

            let i = 0;
            function scrollLine() {
              if (i < quoteLines.length) {
                const line = document.createElement("div");
                line.innerText = quoteLines[i];
                terminal.insertBefore(line, prompt);
                i++;
                setTimeout(() => {
                  scrollToBottom();
                  scrollLine();
                }, 300);
              } else {
                prompt.style.visibility = "visible";
              }
            }

            scrollLine();
            return;
          } else if (cmd === "cat .sigh.txt") {
            div.innerHTML = "What a Dad Joke... <br>";
            terminal.insertBefore(div, prompt);
            scrollToBottom();
            
            const joke = await fetchDadJoke();
            const jokeDiv = document.createElement("div");
            jokeDiv.innerHTML = `<br>${joke}<br><br>*sigh*<br>`;
            terminal.insertBefore(jokeDiv, prompt);
            scrollToBottom();
            return;
          
          } else if (cmd === "cat /dev/memory") {
            const encoded = `
              PT09IC9kZXYvbWVtb3J5OiBNRUNIQU5JQ0FMVFlQRSA9PT0KTGFzdCB
              zZWVuIHVuZGVyIHRoZSBob29kLCBzb2NrZXQgaW4gaGFuZCwgYmFzaC
              BpbiBicmFpbi4KSGUgY291bGQgZGVidWcgYSBjcmFua3NoYWZ0IGFu
              ZCBhIGtlcm5lbCBwYW5pYyB3aXRoIHRoZSBzYW1lIGNhbG0uClRo
              ZSAxMG1tIHNvY2tldCBpcyBzdGlsbCBtaXNzaW5nLgpTbyBpcyBh
              IHBpZWNlIG9mIG91ciBjcmV3Lgpnb25lIHRvIHRoZSBncmVhdCBn
              YXJhZ2UgaW4gdGhlIHNreSwKYnV0IGhpcyBoYWNrcyBzdGlsbCBl
              Y2hvIGluIHRoZSB3YWxscy4KUklQIE1lY2hhbmljYWxUeXBlIDE5
              ODQgLSAyMDI0
            `.replace(/\s+/g, '');
            const lines = atob(encoded).split('\n').filter(Boolean);
            const width = Math.max(...lines.map(line => line.length), 48);
            const border = `+${'-'.repeat(width + 2)}+`;
            const formatted = [
              border,
              ...lines.map(line => `| ${line.padEnd(width, ' ')} |`),
              border
            ].join('\n');
            const out = document.createElement('pre');
            out.style.color = '#33ff33';
            out.style.margin = '8px 0';
            out.textContent = formatted;
            terminal.insertBefore(out, prompt);
          } else if (awaitingGarbagePassword) {
            awaitingGarbagePassword = false;
            // auth validation
            const validHashes = [
              "98d44e13f455d916674d38424d39e1cb01b2a9132aacbb7b97a6f8bb7feb2544",
              "686f746a95b6f836d7d70567c302c3f9ebb5ee0def3d1220ee9d4e9f34f5e131",
              "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b",
              "5723360ef11043a879520412e9ad897e0ebcb99cc820ec363bfecc9d751a1a99"
            ];
            const encoder = new TextEncoder();
            const data = encoder.encode(cmd);
            (crypto.subtle ? crypto.subtle.digest('SHA-256', data) : Promise.reject('no crypto')).then(hashBuffer => {
              const hashArray = Array.from(new Uint8Array(hashBuffer));
              const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
              if (validHashes.includes(hashHex)) {
                div.innerHTML = "Password accepted. Accessing garbage file...<br>";
                terminal.insertBefore(div, prompt);
                scrollToBottom();
                triggerAiGlitchEgg();
              } else {
                div.innerHTML = "Access denied. Wrong password.<br>";
                terminal.insertBefore(div, prompt);
                scrollToBottom();
              }
            }).catch(() => {
              div.innerHTML = "Access denied. Wrong password.<br>";
              terminal.insertBefore(div, prompt);
              scrollToBottom();
            });
            return;
          } else if (cmd === "garbage" || cmd === "cat garbage" || cmd === "access garbage") {
            awaitingGarbagePassword = true;
            updatePrompt();
            scrollToBottom();
            return;
          } else if (cmd === "cat /etc/weather.conf") {
            div.innerHTML = `<pre>
# /etc/weather.conf — CHA weather station config
# Session-only: changes reset on page refresh

[station]
observation = ${weatherStation}

[alerts]
zone = ${alertZone}
</pre>`;
          } else if (cmd === "nano /etc/weather.conf" || cmd === "vi /etc/weather.conf" || cmd === "vim /etc/weather.conf") {
            // Open nano editor overlay
            openNanoEditor();
            return;
          } else if (cmd === "help" || cmd === "?") {
            div.innerHTML = `<pre>
Available commands:
  ls              List files and directories
  ls -l           Detailed file listing
  cd <dir>        Navigate to a page (blog, code, conduct, contact, meetings)
  cat <file>      Read a file (manifesto.txt, .sigh.txt, /dev/memory)
  cat /etc/weather.conf  Show weather station config
  nano /etc/weather.conf Edit weather station (session only)
  cd Desktop      Enter the fake XFCE desktop folder
  mv <old> <new>  Rename a desktop icon while in ~/Desktop
  reset-icons     Restore desktop icon labels
  strings <file>  Print readable strings from a binary
  pwd             Print current working directory
  whoami          Display current user
  ssh root@host   Try an SSH login, if you must
  ifconfig        Show network interface info
  iptables -L     Show firewall rules, allegedly
  hostname        Show system hostname
  id              Show current user and groups
  uname -a        Show kernel/system info
  env             Show environment variables
  history         Show recent command history
  ps              Show running processes
  netstat -tulnp  Show listening services
  ss -tulnp       Show socket summary
  last            Show recent logins
  w               Show who is logged in
  df -h           Show filesystem usage
  free -h         Show memory usage
  rtl_test        Probe the fake RTL-SDR dongle
  sdr scan        Scan the air for hidden signals
  dig <domain>    Query DNS records
  curl <url>      Fetch a URL, carefully
  ping [-c n] <host>  Send up to 10 fake ICMP echoes
  help            Show this help message
  clear           Clear the terminal
  uptime          Show system uptime
  date            Show current date/time
  reboot          Refresh/reboot the session
  init 0          Shutdown the system
  light mode      Switch to Light Mode
  dark mode       Switch to Dark Mode
</pre>`;
          } else if (cmd === "clear") {
            terminal.innerHTML = '';
            terminal.appendChild(prompt);
            return;
          } else if (cmd === "uptime") {
            const now = new Date();
            const boot = new Date('2012-01-01T00:00:00');
            const diff = Math.floor((now - boot) / 1000);
            const days = Math.floor(diff / 86400);
            const hours = Math.floor((diff % 86400) / 3600);
            const mins = Math.floor((diff % 3600) / 60);
            div.innerHTML = ` ${new Date().toLocaleTimeString()} up ${days} days, ${hours}:${String(mins).padStart(2,'0')}, 1 user, load average: 0.42, 0.23, 0.15<br>`;
          } else if (cmd === "date") {
            div.innerHTML = `${new Date().toString()}<br>`;
          } else if (cmd === "reboot") {
            window.location.reload();
            return;
          } else if (cmd === "desktop" || cmd === "desktop-icons" || cmd === "ls ~/desktop") {
            div.innerHTML = desktopIconTable();
          } else if (cmd === "reset-icons") {
            resetDesktopIcons();
            div.innerHTML = "Desktop icon labels restored from clean backup.<br>Totally legitimate sysadmin behavior.<br>";
          } else if (cmd === "mv" || cmd.startsWith("mv ")) {
            if (currentDir !== "Desktop") {
              div.innerHTML = "mv: desktop icon rename only works from ~/Desktop<br>Try: cd Desktop<br>";
            } else {
              const match = cmd.match(/^mv\s+([^\s]+)\s+(.+)$/i);
              if (!match) {
                div.innerHTML = "Usage: mv &lt;desktop-item&gt; &lt;new-name&gt;<br>Try: ls<br>";
              } else {
                const oldName = match[1];
                const newName = match[2].replace(/^[\'\"]|[\'\"]$/g, '').trim();
                const renamed = renameDesktopIcon(oldName, newName);
                if (renamed) {
                  div.innerHTML = `renamed '${oldName}' -&gt; '${desktopNameSlug(renamed.label)}'<br>[xfdesktop] icon label updated on screen<br>`;
                } else {
                  div.innerHTML = `mv: cannot stat '${oldName}': No such desktop item<br>Try: ls<br>`;
                }
              }
            }
          } else if (cmd.startsWith("rename-icon ")) {
            const match = cmd.match(/^rename-icon\s+([a-z0-9_-]+)\s+(.+)$/i);
            if (!match) {
              div.innerHTML = "deprecated: use cd Desktop, then mv &lt;old&gt; &lt;new&gt;<br>";
            } else {
              const id = match[1].toLowerCase();
              const label = match[2].replace(/^['\"]|['\"]$/g, '').trim();
              if (setDesktopIconLabel(id, label)) {
                div.innerHTML = `deprecated command accepted, but the cooler way is: cd Desktop; mv ${id} ${desktopNameSlug(label)}<br>`;
              } else {
                div.innerHTML = `desktop: no icon id '${id}'<br>Try: cd Desktop; ls<br>`;
              }
            }
          } else if (cmd === "ping" || cmd.startsWith("ping ")) {
            terminal.insertBefore(div, prompt);
            await renderFakePing(cmd, div);
            scrollToBottom();
            return;
          } else if (cmd.startsWith("ssh ")) {
            const match = cmd.match(/^ssh\s+(?:-p\s+\d+\s+)?root@([^\s]+)$/);
            if (match) {
              pendingSshTarget = `root@${match[1]}`;
              awaitingSshPassword = true;
              updatePrompt();
              scrollToBottom();
              return;
            }
            div.innerHTML = "ssh: this fake lab only accepts the form: ssh root@host<br>";
          } else if (cmd === "ai" || cmd === "llm" || cmd === "gpt" || cmd === "chatgpt" || cmd === "ask ai") {
            div.innerHTML = "Initializing assistant...<br>";
            terminal.insertBefore(div, prompt);
            prompt.style.visibility = "hidden";
            scrollToBottom();

            let aiIndex = 0;
            function typeAiLine() {
              if (aiIndex < aiOracleLines.length) {
                const aiLine = document.createElement("div");
                aiLine.style.color = aiOracleLines[aiIndex].color;
                aiLine.textContent = aiOracleLines[aiIndex].text;
                terminal.insertBefore(aiLine, prompt);
                scrollToBottom();
                aiIndex++;
                setTimeout(typeAiLine, aiOracleLines[aiIndex - 1].delay);
              } else {
                prompt.style.visibility = "visible";
                scrollToBottom();
              }
            }

            typeAiLine();
            return;
          } else if (cmd === "rtl_test") {
            div.innerHTML = `<pre>
Found 1 device(s):
  0: Realtek, RTL2838UHIDIR, SN: CHA0423

Using device 0: Generic RTL2832U OEM
Found Rafael Micro R820T tuner
Sampling at 2.400 MS/s.
Tuner gain set to auto.

[STATUS] CHA SDR node ready.
Try: sdr scan
</pre>`;
          } else if (cmd === "sdr") {
            div.innerHTML = "Usage: sdr scan<br>";
          } else if (cmd === "sdr scan") {
            div.innerHTML = `<pre>
rtl_power: sweeping 24 MHz - 1.7 GHz...

  24.000 MHz  noise floor        -52 dB
 144.390 MHz  APRS burst         -31 dB
 162.550 MHz  NOAA carrier       -25 dB
 315.000 MHz  weak OOK pulses    -44 dB
 433.920 MHz  CHA beacon         -18 dB  &lt;&lt; strongest
 915.000 MHz  chirp-looking RF   -39 dB

Hidden signal found: 433.920 MHz
Message: CQ CQ CQ DE CHA // NOOGA HACKERS ON THE AIR
</pre>`;
          } else if (cmd === "cat wannacry.exe") {
            div.innerHTML = "MZ\x90\x00\x03... &lt;PE32 executable binary data&gt; ...try: strings wannacry.exe<br>";
          } else if (cmd === "strings" || cmd === "strings -a") {
            div.innerHTML = "Usage: strings wannacry.exe<br>";
          } else if (cmd === "strings wannacry.exe" || cmd === "strings -a wannacry.exe") {
            div.innerHTML = `<pre>
!This program cannot be run in DOS mode.
Rich
.text
.rdata
.data
KERNEL32.dll
ADVAPI32.dll
WS2_32.dll
CRYPT32.dll
mssecsvc2.0
tasksche.exe
Global\\MsWinZonesCacheCounterMutexA
\\.\\pipe\\mssecsvc2.0
WanaCrypt0r
WNcry@2ol7
iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com
http://iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com/

# analyst note: suspicious embedded URL found in sample strings
</pre>`;
          } else if (cmd === "dig iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com" || cmd === "nslookup iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com") {
            div.innerHTML = `<pre>
; &lt;&lt;&gt;&gt; DiG 9.18-cha &lt;&lt;&gt;&gt; iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com
;; global options: +cmd
;; Got answer:
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, status: NOERROR, id: 0423

;; QUESTION SECTION:
;iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com. IN A

;; ANSWER SECTION:
iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com. 300 IN A 127.0.0.1

;; CHA NOTE:
;; Kill-switch domain resolved. Sample enters sleep mode.
;; Curiosity saved networks. Register domains responsibly.
</pre>`;
          } else if (cmd === "curl iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com" || cmd === "curl http://iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com") {
            div.innerHTML = `<pre>
HTTP/1.1 200 OK
Server: sinkhole-cha/4.23
Content-Type: text/plain

[KILL SWITCH ARMED]
WannaCry-style beacon received.
Returning benign sinkhole response...

Ransomware simulation halted.
Patch SMB. Back up your stuff. Hug your incident responder.
</pre>`;
          } else if (cmd === "sudo lights on" || cmd === "sudo light mode" || cmd === "light mode") {
            document.body.classList.add('lights-on');
            div.innerHTML = "Light Mode enabled. Type 'dark mode' to return to Dark Mode.<br>";
          } else if (cmd === "sudo lights off" || cmd === "sudo dark mode" || cmd === "dark mode") {
            document.body.classList.remove('lights-on');
            div.innerHTML = "Dark Mode enabled. Welcome back. 🍪<br>";
          } else if (cmd === "sudo lights" || cmd === "sudo light" || cmd === "sudo dark" || cmd === "sudo") {
            div.innerHTML = "Usage: light mode | dark mode<br>";
          } else if (_isEasterEgg) {
            const _b64 = "4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQCuKUgiAgI2RjNDIzIElSQyAtIEZyZWVub2RlIC0gQXJjaGl2ZWQgTG9nICAgICAgICAgICDilIIK4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkCuKUgiA8U3luQWNrUHduPiBob2xkIG9uIGxldCBtZSBsb2cgaW4gcmVhbCBxdWljayAgICDilIIK4pSCIDxTeW5BY2tQd24+IFRAY2h5MG4xMyAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUggrilIIgPFN5bkFja1B3bj4gLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCCuKUgiA8U3luQWNrUHduPiB0aGF0IHdhc250IHRoZSBzc2ggcHJvbXB0IHdhcyBpdCAgICDilIIK4pSCIDx6M3IwYzAwbD4gTE1BT09PT08gICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUggrilIIgPHozcjBjMDBsPiBuby4gbm8gaXQgd2FzIG5vdC4gICAgICAgICAgICAgICAgICAg4pSCCuKUgiA8bjAwYnN0M3I+IHNjcmVlbnNob3Qgc2F2ZWQgZm9yZXZlciAgICAgICAgICAgICDilIIK4pSCIDxTeW5BY2tQd24+IGNhbiBzb21lb25lIGRlbGV0ZSB0aGF0ICAgICAgICAgICAgIOKUggrilIIgPHozcjBjMDBsPiBpdHMgSVJDIGJyby4gaXRzIGV0ZXJuYWwuICAgICAgICAgICAg4pSCCuKUgiA8U3luQWNrUHduPiBpIGhhdGUgdGhpcyBjaGFubmVsICAgICAgICAgICAgICAgICDilIIK4pSCIDxuMDBic3Qzcj4gd2UgbG92ZSB5b3UgdG9vICAgICAgICAgICAgICAgICAgICAgIOKUggrilIIgPC0tIFN5bkFja1B3biBoYXMgcXVpdCAocmFnZSBxdWl0KSAgICAgICAgICAgICAg4pSCCuKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmApSSVAgU3luQWNrUHduJ3MgT3BTZWMg4oCUIG5ldmVyIGZvcmdldC4=";
            const _bytes = Uint8Array.from(atob(_b64), c => c.charCodeAt(0));
            const _l = new TextDecoder().decode(_bytes);
            const _p = document.createElement("pre");
            _p.style.color = "#33ff33";
            _p.style.whiteSpace = "pre";
            _p.style.overflowX = "auto";
            _p.style.wordBreak = "keep-all";
            _p.style.overflowWrap = "normal";
            _p.style.wordWrap = "normal";
            _p.style.fontFamily = "'Courier New', Courier, monospace";
            _p.style.fontSize = "0.82rem";
            _p.style.lineHeight = "1.35";
            _p.textContent = _l;
            div.appendChild(_p);
          } else if (cmd === "lights" || cmd === "lights on" || cmd === "lights off" || cmd === "light" || cmd === "dark") {
            div.innerHTML = `Usage: light mode | dark mode<br>`;
          } else if (cmd === "exit" || cmd === "shutdown" || cmd === "shutdown -h now" || cmd === "init 0" || cmd === "poweroff" || cmd === "halt") {
            div.innerHTML = "";
            terminal.insertBefore(div, prompt);
            prompt.style.visibility = "hidden";

            const shutdownLines = [
              { text: "Broadcast message from root@cha", delay: 400, color: "#ffff00" },
              { text: "  The system is going down for halt NOW!", delay: 600, color: "#ffff00" },
              { text: "", delay: 300, color: "#33ff33" },
              { text: "[  OK  ] Stopped target Graphical Interface.", delay: 400, color: "#33ff33" },
              { text: "[  OK  ] Stopped target Multi-User System.", delay: 350, color: "#33ff33" },
              { text: "[  OK  ] Stopping Session 1 of user root...", delay: 300, color: "#33ff33" },
              { text: "[  OK  ] Stopped Session 1 of user root.", delay: 400, color: "#33ff33" },
              { text: "[  OK  ] Stopping NoogaHackers Terminal Service...", delay: 500, color: "#33ff33" },
              { text: "[  OK  ] Stopped NoogaHackers Terminal Service.", delay: 350, color: "#33ff33" },
              { text: "[  OK  ] Stopping Hacker Ethics Alignment Daemon...", delay: 400, color: "#33ff33" },
              { text: "[  OK  ] Stopped Hacker Ethics Alignment Daemon.", delay: 300, color: "#33ff33" },
              { text: "[  OK  ] Unmounting /dev/gibson...", delay: 500, color: "#33ff33" },
              { text: "[  OK  ] Reached target Shutdown.", delay: 400, color: "#33ff33" },
              { text: "[  OK  ] Reached target Final Step.", delay: 500, color: "#33ff33" },
              { text: "", delay: 300, color: "#33ff33" },
              { text: "Powering off...", delay: 800, color: "#ff3333" },
              { text: "", delay: 500, color: "#33ff33" },
              { text: "Connection to cha closed.", delay: 1000, color: "#ffff00" },
            ];

            let si = 0;
            function typeShutdownLine() {
              if (si < shutdownLines.length) {
                const sline = document.createElement("div");
                sline.style.color = shutdownLines[si].color;
                sline.textContent = shutdownLines[si].text;
                terminal.insertBefore(sline, prompt);
                scrollToBottom();
                si++;
                setTimeout(typeShutdownLine, shutdownLines[si - 1].delay);
              } else {
                setTimeout(() => {
                  document.body.style.transition = "opacity 1s ease";
                  document.body.style.opacity = "0";
                  setTimeout(() => {
                    window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                  }, 1200);
                }, 500);
              }
            }
            typeShutdownLine();
            return;
          } else if (cmd === "dir") {
            div.innerHTML = `bash: dir: command not found<br>This isn't DOS, champ. Try 'ls'.<br>`;
          } else {
            div.innerHTML = `bash: command not found: ${cmd}<br>`;
          }
          terminal.insertBefore(div, prompt);
          scrollToBottom();
        }

        // ────────────────────────────────────────────────────────────
        //  Nano Editor — fullscreen overlay text editor for configs
        // ────────────────────────────────────────────────────────────
        const nanoOverlay = document.getElementById('nanoOverlay');
        const nanoBody = document.getElementById('nanoBody');
        const nanoStatus = document.getElementById('nanoStatus');

        function openNanoEditor() {
          const lines = [
            '# /etc/weather.conf — CHA weather station config',
            '# Session-only: changes reset on page refresh',
            '',
            '[station]',
            `observation = ${weatherStation}`,
            '',
            '[alerts]',
            `zone = ${alertZone}`,
            ''
          ];
          nanoActive = true;
          nanoCursorLine = 4; // start on observation line
          renderNano(lines);
          nanoOverlay.classList.add('active');
          nanoStatus.textContent = '';
        }

        function renderNano(lines) {
          nanoBody.innerHTML = '';
          lines.forEach((line, i) => {
            const div = document.createElement('div');
            div.className = 'nano-line' + (i === nanoCursorLine ? ' nano-cursor-line' : '');
            div.textContent = line;
            nanoBody.appendChild(div);
          });
        }

        function getNanoLines() {
          return Array.from(nanoBody.querySelectorAll('.nano-line')).map(el => el.textContent);
        }

        function nanoKeyHandler(e) {
          if (!nanoActive) return;
          e.preventDefault();
          e.stopPropagation();

          const lines = getNanoLines();

          // ^X = exit
          if (e.ctrlKey && e.key.toLowerCase() === 'x') {
            nanoActive = false;
            nanoOverlay.classList.remove('active');
            // Parse the config back
            let newStation = weatherStation;
            let newZone = alertZone;
            lines.forEach(l => {
              const m1 = l.match(/^\s*observation\s*=\s*(\S+)/i);
              if (m1) newStation = m1[1];
              const m2 = l.match(/^\s*zone\s*=\s*(\S+)/i);
              if (m2) newZone = m2[1];
            });
            const changed = (newStation !== weatherStation || newZone !== alertZone);
            weatherStation = newStation;
            alertZone = newZone;
            // Print result in terminal
            const div = document.createElement('div');
            if (changed) {
              div.innerHTML = `<span style="color:#33ff33">weather.conf saved (session only).</span><br>station=${weatherStation} zone=${alertZone}<br>Refreshing weather...<br>`;
              updatePanelWeather();
            } else {
              div.innerHTML = `<span style="color:#33ff33">weather.conf unchanged.</span><br>`;
            }
            terminal.insertBefore(div, prompt);
            scrollToBottom();
            return;
          }

          // ^O = write out (save without exit)
          if (e.ctrlKey && e.key.toLowerCase() === 'o') {
            let newStation = weatherStation;
            let newZone = alertZone;
            lines.forEach(l => {
              const m1 = l.match(/^\s*observation\s*=\s*(\S+)/i);
              if (m1) newStation = m1[1];
              const m2 = l.match(/^\s*zone\s*=\s*(\S+)/i);
              if (m2) newZone = m2[1];
            });
            weatherStation = newStation;
            alertZone = newZone;
            nanoStatus.textContent = `[ Wrote ${lines.length} lines — station=${weatherStation} zone=${alertZone} ]`;
            updatePanelWeather();
            return;
          }

          // ^K = cut line
          if (e.ctrlKey && e.key.toLowerCase() === 'k') {
            if (lines.length > 1) {
              lines.splice(nanoCursorLine, 1);
              if (nanoCursorLine >= lines.length) nanoCursorLine = lines.length - 1;
              renderNano(lines);
            }
            return;
          }

          // Arrow keys
          if (e.key === 'ArrowUp') {
            if (nanoCursorLine > 0) nanoCursorLine--;
            renderNano(lines);
            return;
          }
          if (e.key === 'ArrowDown') {
            if (nanoCursorLine < lines.length - 1) nanoCursorLine++;
            renderNano(lines);
            return;
          }

          // Enter = new line
          if (e.key === 'Enter') {
            lines.splice(nanoCursorLine + 1, 0, '');
            nanoCursorLine++;
            renderNano(lines);
            return;
          }

          // Backspace
          if (e.key === 'Backspace') {
            if (lines[nanoCursorLine].length > 0) {
              lines[nanoCursorLine] = lines[nanoCursorLine].slice(0, -1);
            } else if (nanoCursorLine > 0) {
              lines.splice(nanoCursorLine, 1);
              nanoCursorLine--;
            }
            renderNano(lines);
            return;
          }

          // Regular character
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            lines[nanoCursorLine] += e.key;
            renderNano(lines);
          }
        }

        document.addEventListener('keydown', function(e) {
          if (nanoActive) {
            nanoKeyHandler(e);
          }
        }, true);

        typeBootLines();

        // ────────────────────────────────────────────────────────────
        //  Window Management — drag, resize, center, controls
        // ────────────────────────────────────────────────────────────
        const win = document.querySelector('.window');
        const titleBar = document.querySelector('.title-bar');
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        // Center the window initially, offset right to avoid desktop icons
        function centerWindow() {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const iconMargin = 210; // width reserved for desktop icon columns
          const availableW = vw - iconMargin;
          const left = iconMargin + Math.max(0, (availableW - win.offsetWidth) / 2);
          const top = 28 + Math.max(0, (vh - 28 - win.offsetHeight) / 2); // 28px for panel
          win.style.left = left + 'px';
          win.style.top = top + 'px';
        }
        centerWindow();

        titleBar.addEventListener('mousedown', function (e) {
          // Don't drag when clicking window control buttons
          if (e.target.closest('.window-controls')) return;
          isDragging = true;
          dragOffsetX = e.clientX - win.offsetLeft;
          dragOffsetY = e.clientY - win.offsetTop;
          win.style.transition = 'none';
        });

        document.addEventListener('mousemove', function (e) {
          if (!isDragging) return;
          e.preventDefault();
          let newX = e.clientX - dragOffsetX;
          let newY = e.clientY - dragOffsetY;
          // Keep window within viewport bounds
          newX = Math.max(0, Math.min(newX, window.innerWidth - win.offsetWidth));
          newY = Math.max(0, Math.min(newY, window.innerHeight - win.offsetHeight));
          win.style.left = newX + 'px';
          win.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', function () {
          isDragging = false;
          win.style.transition = '';
        });

        // Re-center on resize
        window.addEventListener('resize', centerWindow);

        // Resizable window functionality
        const resizeHandle = document.getElementById('resizeHandle');
        let isResizing = false;
        let resizeStartX, resizeStartY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', function (e) {
          isResizing = true;
          resizeStartX = e.clientX;
          resizeStartY = e.clientY;
          startWidth = win.offsetWidth;
          startHeight = win.offsetHeight;
          e.stopPropagation();
          e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
          if (!isResizing) return;
          e.preventDefault();
          const newWidth = Math.max(400, startWidth + (e.clientX - resizeStartX));
          const newHeight = Math.max(250, startHeight + (e.clientY - resizeStartY));
          win.style.width = newWidth + 'px';
          win.style.height = newHeight + 'px';
        });

        document.addEventListener('mouseup', function () {
          isResizing = false;
        });

        // ── Window Control Buttons (close/minimize/maximize) ──

        const closeBtn = document.querySelector('.close');
        const minimizeBtn = document.querySelector('.minimize');
        const maximizeBtn = document.querySelector('.maximize');
        const taskbarDock = document.getElementById('taskbarDock');
        const kernelPanic = document.getElementById('kernelPanic');
        const aiGlitchOverlay = document.getElementById('aiGlitchOverlay');
        const aiGlitchText = document.getElementById('aiGlitchText');
        let isMaximized = false;
        let savedPos = {};
        const aiSequence = ['g', 'a', 'r', 'b', 'a', 'g', 'e'];
        let aiSequenceIndex = 0;
        let aiSequenceTimer = null;

        function playAiChime() {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          const ctx = new AudioCtx();
          const now = ctx.currentTime;
          const notes = [261.63, 329.63, 392.0, 523.25];

          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = idx % 2 === 0 ? 'square' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.08 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
          });

          setTimeout(() => ctx.close().catch(() => {}), 900);
        }

        function runDaVinciVisualization() {
          const frames = [
            `THEY'RE IN THE GARBAGE FILE.\n\n[ DA VINCI VIRUS ]\nnode_a -> node_b -> node_c\nnode_c -> ellingson.core\n\nNever fear. I is here.\n\u2014 Hackers (1995)`,
            `THEY'RE IN THE GARBAGE FILE.\n\n[ DA VINCI VIRUS ]\nnode_a => node_b => node_c => ellingson.core\nstatus: salami-slice routine engaged\n\nNever fear. I is here.\n\u2014 Hackers (1995)`,
            `THEY'RE IN THE GARBAGE FILE.\n\n[ DA VINCI VIRUS ]\ntrace: gibson > ellingson > garbage_file\nstatus: transfer anomaly detected\n\nNever fear. I is here.\n\u2014 Hackers (1995)`
          ];

          frames.forEach((frame, index) => {
            setTimeout(() => {
              aiGlitchText.textContent = frame;
            }, index * 260);
          });
        }

        function triggerAiGlitchEgg() {
          runDaVinciVisualization();
          aiGlitchOverlay.classList.add('active');
          playAiChime();
          setTimeout(() => {
            aiGlitchOverlay.classList.remove('active');
          }, 7200);
        }

        // Global keypress sequence for 'garbage' easter egg disabled —
        // now handled via terminal password prompt instead.

        // CLOSE — Kernel Panic then reboot
        closeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          const panicLines = [
            "KERNEL PANIC - NOT SYNCING: Attempted to kill init!",
            "",
            "CPU: 0 PID: 1 Comm: init Not tainted 6.6.6-cha #423",
            "Hardware name: NoogaHackers Terminal v4.2.3",
            "Call Trace:",
            " <TASK>",
            "  dump_stack_lvl+0x48/0x70",
            "  dump_stack+0x10/0x18",
            "  panic+0x114/0x310",
            "  do_exit+0xb08/0xb60",
            "  do_group_exit+0x33/0xa0",
            "  __x64_sys_exit_group+0x14/0x20",
            "  do_syscall_64+0x55/0x80",
            "  entry_SYSCALL_64_after_hwframe+0x44/0xae",
            " </TASK>",
            "",
            "Kernel Offset: 0x1c000000 from 0xffffffff81000000",
            "---[ end Kernel panic - not syncing: Attempted to kill init! ]---",
            "",
            "",
            "Rebooting in 5 seconds...",
            "Rebooting in 4 seconds...",
            "Rebooting in 3 seconds...",
            "Rebooting in 2 seconds...",
            "Rebooting in 1 second...",
          ];

          kernelPanic.textContent = '';
          kernelPanic.classList.add('active');
          win.style.display = 'none';

          let i = 0;
          function typePanicLine() {
            if (i < panicLines.length) {
              kernelPanic.textContent += panicLines[i] + '\n';
              i++;
              const delay = i > panicLines.length - 5 ? 1000 : (50 + Math.random() * 100);
              setTimeout(typePanicLine, delay);
            } else {
              // Reboot
              setTimeout(() => {
                kernelPanic.classList.remove('active');
                kernelPanic.textContent = '';
                win.style.display = 'flex';
                centerWindow();
              }, 1000);
            }
          }
          typePanicLine();
        });

        // ────────────────────────────────────────────────────────────
        //  Panel Interactivity — menu, taskbar, screen lock
        // ────────────────────────────────────────────────────────────

        // Helper: minimize/restore the terminal
        function minimizeTerminal() {
          win.classList.add('minimized');
          xfceTaskButton.classList.add('minimized-task');
          xfceTaskButton.textContent = '▣ root@cha:~ — Terminal (minimized)';
          taskbarDock.style.display = 'block';
        }

        function restoreTerminal() {
          win.classList.remove('minimized');
          xfceTaskButton.classList.remove('minimized-task');
          xfceTaskButton.textContent = '▣ root@cha:~ — Terminal';
          taskbarDock.style.display = 'none';
          setTimeout(() => { win.style.transition = ''; }, 500);
        }

        // Applications menu toggle
        function toggleMenu() {
          const isOpen = xfceMenu.classList.toggle('open');
          xfceMenuButton.classList.toggle('open', isOpen);
        }

        function closeMenu() {
          xfceMenu.classList.remove('open');
          xfceMenuButton.classList.remove('open');
        }

        xfceMenuButton.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
          if (!xfceMenu.contains(e.target) && !xfceMenuButton.contains(e.target)) {
            closeMenu();
          }
        });

        // Menu item actions
        xfceMenu.addEventListener('click', function (e) {
          const item = e.target.closest('.xfce-menu-item');
          if (!item) return;
          const action = item.dataset.action;
          closeMenu();

          switch (action) {
            case 'terminal':
              restoreTerminal();
              break;
            case 'meetings':
              window.location.href = 'meetings.html';
              break;
            case 'blog':
              window.location.href = 'blog.html';
              break;
            case 'contact':
              window.location.href = 'contact.html';
              break;
            case 'conduct':
              window.location.href = 'coc.html';
              break;
            case 'code':
              window.open('https://github.com/dc423', '_blank');
              break;
            case 'lights-on':
              document.body.classList.add('lights-on');
              break;
            case 'lights-off':
              document.body.classList.remove('lights-on');
              break;
            case 'weather':
              xfceWeather.textContent = '🌡️ refreshing...';
              updatePanelWeather();
              break;
            case 'lock':
              screenLockOverlay.classList.add('active');
              screenLockOverlay.setAttribute('aria-hidden', 'false');
              break;
            case 'reboot':
              window.location.reload();
              break;
            case 'shutdown':
              handleCommand('shutdown');
              break;
          }
        });

        // Screen lock: dismiss on any key or click
        function unlockScreen() {
          if (screenLockOverlay.classList.contains('active')) {
            screenLockOverlay.classList.remove('active');
            screenLockOverlay.setAttribute('aria-hidden', 'true');
          }
        }
        screenLockOverlay.addEventListener('click', unlockScreen);
        screenLockOverlay.addEventListener('keydown', unlockScreen);

        // Task button: click to minimize/restore terminal
        xfceTaskButton.addEventListener('click', function (e) {
          e.stopPropagation();
          if (win.classList.contains('minimized')) {
            restoreTerminal();
          } else {
            minimizeTerminal();
          }
        });

        // MINIMIZE — Shrink to taskbar dock (window button)
        minimizeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          minimizeTerminal();
        });

        // Restore from taskbar dock
        taskbarDock.addEventListener('click', function () {
          restoreTerminal();
        });

        // MAXIMIZE — Toggle fullscreen
        maximizeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (!isMaximized) {
            savedPos = {
              left: win.style.left,
              top: win.style.top,
              width: win.style.width,
              height: win.style.height
            };
            win.classList.add('maximized');
            isMaximized = true;
          } else {
            win.classList.remove('maximized');
            win.style.left = savedPos.left;
            win.style.top = savedPos.top;
            win.style.width = savedPos.width || '800px';
            win.style.height = savedPos.height || '480px';
            isMaximized = false;
          }
        });

      });
    }
