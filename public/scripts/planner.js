function openTipsPopup() {
    document.getElementById('tipsModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevents background scrolling
}

function closeTipsPopup(event) {
    // Only close if clicking either the backdrop or close button
    if (!event || event.target === document.getElementById('tipsModal') || event.target.classList.contains('close-tips')) {
        document.getElementById('tipsModal').style.display = 'none';
        document.body.style.overflow = 'auto'; // Allow normal scrolling to happen again
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeTipsPopup();
        }
    });

    // Better scrolling through the tips popup
    const tipsBody = document.querySelector('.tips-body');
    if (tipsBody) {
        tipsBody.style.scrollBehavior = 'smooth';
    }
});