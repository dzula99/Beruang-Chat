/**
 * layout-toggle.js
 */
(function () {
    'use strict';

    let isLayoutVisible = true;

    function applyLayoutVisibility() {
        const appContainer = document.querySelector('.app-container');
        const topBar = document.querySelector('.external-top-bar');
        const themeBtn = document.getElementById('btn-change-bg');

        if (appContainer) {
            appContainer.style.display = isLayoutVisible ? 'flex' : 'none';
        }

        if (topBar) {
            topBar.style.display = isLayoutVisible ? 'flex' : 'none';
        }

        if (themeBtn) {
            themeBtn.style.display = isLayoutVisible ? 'block' : 'none';
        }
    }

    function toggleFullLayout() {
        isLayoutVisible = !isLayoutVisible;
        applyLayoutVisibility();

        if (isLayoutVisible) {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }
    }

    document.addEventListener('keydown', function (e) {
        const activeElem = document.activeElement;
        const isInputFocused = activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA');

        if (e.key === '/' && !isInputFocused) {
            e.preventDefault();
            toggleFullLayout();
        }
    });

    window.addEventListener('load', function () {
        applyLayoutVisibility();
    });
})();