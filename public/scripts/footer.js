// Generates a footer for the website
(function () {
    const footerHTML = `
        <footer class="footer bg-dark text-white py-4">
            <div class="container">
                <div class="row">
                    <div class="col-md-6 mb-4 mb-md-0">
                        <h5 class="text-uppercase mb-3">WealthLink</h5>
                        <p>Innovating financial solutions for a better tomorrow.</p>
                    </div>
                </div>
                <hr class="my-4 bg-light">
                <div class="text-center">
                    <p class="mb-0">&copy; 2025 WealthLink. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;

    // Remove the old footer if it exists and insert the new footer
    const oldFooter = document.querySelector('footer.footer');
    if (oldFooter) {
        oldFooter.parentNode.removeChild(oldFooter);
    }

    // Insert the new footer HTML at the end of the body
    document.body.insertAdjacentHTML('beforeend', footerHTML);
})();

if (window.location.href.includes("index") || !window.location.href.includes(".html")) {
    document.querySelector("footer").style.marginTop = 0;
}