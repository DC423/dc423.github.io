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
- Tab and F2 command completion while the terminal is focused
- Responsive light and dark themes
- Live clock, weather, and Chattanooga-time meeting information
- Community pages for meetings, contact information, articles, and conduct
- A mobile-specific interface for smaller screens
- A draggable Python/Tkinter-style CHA Snake desktop app launched with `snake` or from Applications
- A local-only, three-stage Scenic City CTF launched with `ctf`
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
├── st4t1c.css       Shared styling for standalone pages
├── m33t1ng.js       Chattanooga meeting schedule and timezone logic
├── meetings.html    Meeting information
├── blog.html        Community articles and updates
├── contact.html     Contact and community links
├── coc.html         Code of Conduct
├── LICENSE          MIT license for source code and tooling
├── LICENSE-CONTENT  CC BY-NC-SA 4.0 license for content and artwork
└── CNAME            Custom-domain configuration
```

The unconventional filenames are intentional and match the site's visual style.

## Development Notes

- Desktop interactions are enabled on viewports wider than 768 pixels.
- Smaller screens receive a dedicated mobile experience.
- Session-based interface changes reset when the page is reloaded.
- Dynamic information is retrieved from public web services and has local fallback behavior where appropriate.
- Changes should preserve keyboard usability, responsive behavior, and the site's no-build architecture.

## Recent Improvements

Recent work on the site includes:

- Centralized meeting calculations in `America/New_York`, including DST and month-boundary handling
- Safer terminal and blog rendering for user-, network-, and file-derived text
- Responsive desktop initialization when resizing from the mobile layout
- Keyboard, focus, dialog, reduced-motion, and semantic-control accessibility improvements
- Masked terminal secret prompts and safer screen-lock behavior
- Shared styling and semantic landmarks for the blog, meetings, contact, and conduct pages
- Safer blog conversion and a constrained structured-image format
- A local-only Scenic City CTF built over the site's existing simulated puzzles
- A Python/Tkinter-style desktop window for the existing CHA Snake game

The Snake game itself was already part of the site; the recent change moves that same game out of terminal output and into a dedicated desktop window.

## Help Wanted / Ideas

We would appreciate help from contributors, testers, writers, designers, and accessibility users. Useful ideas include:

- Cross-browser testing in current Chrome, Firefox, Safari, and Edge releases
- Mobile and tablet testing across orientation changes and unusual viewport sizes
- Screen-reader reviews of the terminal, desktop controls, popout windows, and static pages
- Keyboard-navigation testing, especially terminal completion, menus, dialogs, and Snake
- More automated tests for timezone boundaries, terminal commands, blog rendering, and CTF state
- Additional Chattanooga-themed, local-only CTF stages that never contact or target real systems
- Optional Snake improvements such as touch controls, selectable difficulty, sound controls, or persistent local high scores
- Better blog-author tooling, schema validation, previews, and index generation without adding a heavy build system
- Performance and resilience improvements for slow connections or unavailable public APIs
- Community-written blog posts, meeting recaps, project showcases, and accessibility documentation
- Visual polish that preserves the retro terminal identity and reduced-motion support

If you have another idea, open an issue or a focused pull request. Please explain the user benefit, keep hidden interactions spoiler-light, and describe how you tested the change.

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

This repository uses separate licenses for software and creative content:

- Source code and tooling—including HTML, CSS, JavaScript, and Python—are licensed under the [MIT License](LICENSE).
- Original written site content, blog posts, graphics, and artwork are licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE-CONTENT), unless a file or asset states otherwise.
- Third-party names, trademarks, services, and externally sourced assets remain subject to their respective owners' rights and terms.

Contributions are expected to use the license applicable to the files or material being changed unless the contribution explicitly states otherwise.

Suggested attribution for CC-licensed content:

> Chattanooga Hackers Anonymous website — Chattanooga Hackers Anonymous contributors, licensed under CC BY-NC-SA 4.0. Changes were made where applicable.

