/**
 * Personal Website - Tab Switching Functionality
 * Handles navigation between Videos, Writing, and Personal sections
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get all tab buttons and content sections
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    /**
     * Switch to a specific tab
     * @param {string} tabName - The name of the tab to activate
     */
    function switchTab(tabName, updateUrl = true) {
        // Hide all content sections
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tab buttons
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        // Show the selected content section
        const selectedContent = document.getElementById(`${tabName}-section`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }

        // Add active class to the clicked tab button
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        if (updateUrl) {
            history.replaceState(null, null, `#${tabName}`);
        }
    }

    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Check URL hash on page load to open the correct tab
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (hash && ['videos', 'writing', 'fun', 'work'].includes(hash)) {
        switchTab(hash);
    } else {
        // Default to videos tab without modifying the URL
        switchTab('videos', false);
    }

    // Listen for hash changes (browser back/forward buttons)
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.substring(1);
        if (newHash && ['videos', 'writing', 'fun', 'work'].includes(newHash)) {
            switchTab(newHash);
        }
    });

    // Optional: Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Get currently active tab
        const activeButton = document.querySelector('.tab-button.active');
        const currentIndex = Array.from(tabButtons).indexOf(activeButton);

        // Left arrow - previous tab
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            const prevButton = tabButtons[currentIndex - 1];
            switchTab(prevButton.getAttribute('data-tab'));
        }

        // Right arrow - next tab
        if (e.key === 'ArrowRight' && currentIndex < tabButtons.length - 1) {
            const nextButton = tabButtons[currentIndex + 1];
            switchTab(nextButton.getAttribute('data-tab'));
        }
    });

    console.log('✓ russelldangerr.com loaded.');
});
