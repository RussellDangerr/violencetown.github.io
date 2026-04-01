# Personal Portfolio Website

A sleek, modern, and technical personal portfolio website with tabbed navigation. Built with pure HTML, CSS, and JavaScript - no frameworks, no dependencies, just clean code.

## Features

- **Dark Mode Design**: Professional dark theme with cyan accents
- **Tab Navigation**: Smooth switching between Videos, Writing, and Personal sections
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Modern Styling**: CSS Grid, Flexbox, custom properties, and smooth animations
- **Keyboard Navigation**: Use arrow keys to switch between tabs
- **Bookmarkable URLs**: Each tab has its own URL hash for easy sharing
- **Zero Dependencies**: Pure vanilla JavaScript, no build tools required

## Project Structure

```
personal-website/
├── index.html      # Main HTML structure
├── styles.css      # All styling and dark mode theme
├── script.js       # Tab switching functionality
└── README.md       # This file
```

## Getting Started

### View Locally

Simply open `index.html` in your web browser:

1. Navigate to the project folder
2. Double-click `index.html`
3. The website will open in your default browser

Or use a local server (recommended for development):

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Customization

### Update Your Information

1. **Open `index.html`** and replace:
   - "Your Name" with your actual name
   - "Developer / Creator / Writer" with your subtitle
   - Email, GitHub, Twitter, LinkedIn links in the Personal section

### Add Your Content

#### Videos Section
Replace the placeholder video cards with your actual video content:
- Embed YouTube videos using `<iframe>` tags
- Add video thumbnails and descriptions
- Link to video hosting platforms

#### Writing Section
Update the article previews:
- Change dates and titles
- Write article summaries
- Link to full articles or blog posts
- Update tags/categories

#### Personal Section
Customize your about page:
- Write your bio
- Update skills and technologies
- Add your contact information
- Include links to your social profiles

### Customize Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --bg-primary: #0a0a0a;      /* Main background */
    --accent: #00d9ff;          /* Accent color (cyan) */
    --text-primary: #e0e0e0;    /* Main text color */
    /* ... more variables */
}
```

Popular accent colors:
- Cyan: `#00d9ff` (current)
- Green: `#00ff9f`
- Purple: `#b794f4`
- Pink: `#ff6b9d`
- Orange: `#ff9f43`

## Deployment

### GitHub Pages

1. Create a new GitHub repository
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```
3. Go to Settings > Pages
4. Select "main" branch as source
5. Your site will be live at `https://yourusername.github.io/your-repo`

### Netlify

1. Drag and drop the project folder at [netlify.com/drop](https://app.netlify.com/drop)
2. Your site is live instantly with a custom URL
3. Optional: Connect to GitHub for automatic deployments

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts
4. Your site is deployed!

## Features Explained

### Tab Navigation
- Click tabs to switch between sections
- Use keyboard arrow keys (← →) to navigate
- Each tab has a unique URL (e.g., `#videos`, `#writing`)
- Share specific tabs by copying the URL

### Responsive Design
- Breakpoints at 768px (tablet) and 480px (mobile)
- Optimized layouts for all screen sizes
- Touch-friendly on mobile devices

### Performance
- No external dependencies
- Minimal CSS and JS (under 10KB total)
- Fast loading and rendering
- Optimized animations

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## License

Free to use and modify for your personal portfolio.

## Tips

- Keep content sections focused and scannable
- Use high-quality images and videos
- Update your content regularly
- Consider adding Google Analytics to track visitors
- Optimize images before uploading (use WebP format)
- Add a favicon for a professional touch

## Need Help?

- HTML/CSS issues: Check browser console (F12)
- JavaScript errors: Look at console logs
- Styling problems: Inspect elements with DevTools
- General questions: Review the code comments

Built with ❤️ using HTML, CSS, and JavaScript.
