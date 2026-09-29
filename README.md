# Chattanooga Hackers Anonymous

The official website for **Chattanooga Hackers Anonymous (CHA)**, a community of security professionals, researchers, programmers, makers, breakers, and curious technologists in and around Chattanooga, Tennessee.

The site presents CHA through a playful, browser-based Linux desktop and terminal experience while providing practical access to meeting information, community resources, contact details, and the code of conduct.

## Live Site

- [noogahackers.com](https://noogahackers.com/)
- [dc423.org](http://dc423.org/) — redirects to noogahackers.com
- [dc423.github.io](https://dc423.github.io/)

## About CHA

CHA is a local community focused on information security, ethical hacking, technology education, and knowledge sharing. People of all experience levels are welcome—from those opening a terminal for the first time to experienced defenders, researchers, developers, and operators.

Visit the website for current meeting information and ways to connect with the community.

## Site Experience

The desktop version of the site is designed as an interactive, retro-inspired computing environment. Public-facing features include:

- A simulated Linux terminal and command-line interface
- An XFCE-inspired desktop, application menu, and window controls
- Keyboard-driven terminal interaction with command history and completion
- Copy and paste support for terminal input and output
- Responsive light and dark themes
- Live clock, weather, and meeting information
- Community pages for meetings, contact information, articles, and conduct
- A mobile-specific interface for smaller screens
- Playful details for visitors who enjoy exploring

Some interactions are intentionally undocumented. Exploration is part of the experience, so this README remains spoiler-free.

## Technology

This is a static website built with:

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages

There is no application framework, package manager, compilation step, or server-side runtime required. The site can be hosted by any standard static-file server.

## Running Locally

Clone the repository and serve its root directory over HTTP:

```bash
git clone https://github.com/dc423/dc423.github.io.git
cd dc423.github.io
python -m http.server 8000
```

Then open `http://localhost:8000/` in a modern browser.

Serving the project over HTTP is recommended instead of opening `index.html` directly because some browser features and external data requests may behave differently for local files.

## Project Structure

```text
.
├── index.html       Main desktop and mobile experience
├── k3rn3l.js        Application behavior and terminal simulation
├── c0r3.css         Base styles and shared defaults
├── d3skt0p.css      Desktop, icons, panel, and menus
├── w1nd0w.css       Window layout and controls
├── t3rm.css         Terminal presentation
├── 0v3rlay.css      Dialogs and overlays
├── th3m3.css        Theme overrides
├── m0b1l3.css       Responsive mobile interface
├── meetings.html    Meeting information
├── blog.html        Community articles and updates
├── contact.html     Contact and community links
├── coc.html         Code of Conduct
├── LICENSE          Project license
└── CNAME            Custom-domain configuration
```

The unconventional filenames are intentional and match the site's visual style.

## Development Notes

- Desktop interactions are enabled on viewports wider than 768 pixels.
- Smaller screens receive a dedicated mobile experience.
- Session-based interface changes reset when the page is reloaded.
- Dynamic information is retrieved from public web services and has local fallback behavior where appropriate.
- Changes should preserve keyboard usability, responsive behavior, and the site's no-build architecture.

## Contributing

Contributions that improve accessibility, browser compatibility, performance, community information, or the overall experience are welcome.

When proposing a change:

1. Create a focused branch or fork.
2. Keep the implementation dependency-free unless there is a strong reason otherwise.
3. Test both desktop and mobile layouts.
4. Test keyboard interaction as well as mouse or touch input.
5. Avoid documenting intentionally hidden interactions in public pull-request descriptions.
6. Submit a clear pull request describing the user-facing change and how it was tested.

Please follow the community's [Code of Conduct](https://noogahackers.com/coc.html) in all project discussions and contributions.

## Responsible Use

CHA supports ethical, authorized security research and education. Examples, jokes, and simulated system behavior on this website are presented for community and entertainment purposes. Do not test systems or networks without explicit permission.

## License

Except where otherwise noted, this repository's original source code and content are licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE).

You may share and adapt the material for noncommercial purposes provided that you give appropriate credit, link to the license, indicate whether changes were made, and distribute adaptations under the same license. See `LICENSE` for the complete terms.

Suggested attribution:

> Chattanooga Hackers Anonymous website — Chattanooga Hackers Anonymous contributors, licensed under CC BY-NC-SA 4.0. Changes were made where applicable.

