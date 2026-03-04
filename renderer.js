// Initialize icons on first load
lucide.createIcons();

// --- Sidebar Toggle Logic ---
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-sidebar');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// --- Sidebar Navigation & Sliding Indicator Logic ---
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const activeIndicator = document.getElementById('active-indicator');

function updateIndicator(button) {
    // Moves the purple glow box down on the Y axis
    activeIndicator.style.transform = `translateY(${button.offsetTop}px)`;
}

// Initial position for the glow box
const initialActive = document.querySelector('.nav-btn.active');
if (initialActive) updateIndicator(initialActive);

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        // Animate the sliding purple glow box
        updateIndicator(btn);
    });
});

// --- Inner Tabs Logic (Notebooks) ---
const tabButtons = document.querySelectorAll('.tab-btn');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const parentView = btn.closest('.view');
        
        parentView.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        parentView.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
        
        // Ensure icons load when tabs switch
        lucide.createIcons(); 
    });
});

// --- yt-dlp Python Bridge Logic ---
const downloadBtn = document.getElementById('download-btn');
const urlInput = document.getElementById('video-url-input');
const outputConsole = document.getElementById('output-console');

downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    // Update UI to show loading state
    outputConsole.innerHTML = `Sending request to Python...<br>URL: ${url}`;
    outputConsole.style.color = "var(--text-main)";
    downloadBtn.disabled = true;
    downloadBtn.style.opacity = '0.5';

    try {
        // Call the Python backend through the secure preload bridge
        const response = await window.api.downloadVideo(url);
        
        // Display the JSON response from Python
        outputConsole.innerHTML = `
            <span style="color: var(--success);">✔ Success</span><br><br>
            <strong>Python Response:</strong><br>
            ${response.message}
        `;
    } catch (error) {
        outputConsole.innerHTML = `<span style="color: var(--danger);">✖ Error connecting to Python backend.</span>`;
    } finally {
        // Reset button
        downloadBtn.disabled = false;
        downloadBtn.style.opacity = '1';
    }
});