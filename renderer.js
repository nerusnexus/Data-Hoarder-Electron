lucide.createIcons();

// --- Sidebar Toggle Logic ---
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-sidebar');
toggleBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

// --- Sidebar Navigation ---
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const activeIndicator = document.getElementById('active-indicator');

function updateIndicator(button) {
    activeIndicator.style.transform = `translateY(${button.offsetTop}px)`;
}

const initialActive = document.querySelector('.nav-btn.active');
if (initialActive) updateIndicator(initialActive);

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
        updateIndicator(btn);
    });
});

// --- Inner Tabs Logic ---
const tabButtons = document.querySelectorAll('.tab-btn, .inner-tab-btn');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const parentContext = btn.closest('.view') || btn.closest('.panel');
        parentContext.querySelectorAll('.tab-btn, .inner-tab-btn').forEach(b => b.classList.remove('active'));
        parentContext.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        if(targetId) document.getElementById(targetId).classList.add('active');
        lucide.createIcons(); 
    });
});

// --- Initial Data Load (Triggers DB Creation) ---
async function initApp() {
    try {
        // This initial call forces Python to boot, loading config.py and creating Data/
        const response = await window.api.runPython('get_library_data');
        if (response.status === 'success') {
            renderTrees(response.data);
        } else {
            console.error("Python Error:", response.message);
        }
    } catch (err) {
        console.error("IPC Bridge Error:", err);
    }
}

// --- Global variables to track Treeview selection ---
let selectedGroup = null;
let selectedChannel = null;

function renderTrees(groups) {
    let html = '<ul style="list-style:none; padding:0; margin:0; color: var(--text-muted);">';
    groups.forEach(g => {
        // Added classes and data-attributes for selection
        html += `<li class="tree-item group-item" data-group="${g.name}" style="padding:5px; cursor:pointer; font-weight:bold; color:var(--text-main); border-radius:4px;">📁 ${g.name}</li>`;
        if(g.channels.length > 0) {
            html += '<ul style="list-style:none; padding-left:15px; border-left:1px solid var(--border-subtle); margin-left:5px;">';
            g.channels.forEach(c => {
                html += `<li class="tree-item channel-item" data-group="${g.name}" data-channel="${c.name}" style="padding:4px; cursor:pointer; border-radius:4px;">▶ ${c.name}</li>`;
            });
            html += '</ul>';
        }
    });
    html += '</ul>';
    
    // Inject into all trees
    document.getElementById('library-channels-tree').innerHTML = html;
    document.getElementById('fetch-channels-tree').innerHTML = html;
    document.getElementById('dl-channels-tree').innerHTML = html;
    document.getElementById('manage-tree').innerHTML = html;

    // --- NEW: Add click selection logic to the tree items ---
    document.querySelectorAll('.tree-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove highlight from all items
            document.querySelectorAll('.tree-item').forEach(i => i.style.backgroundColor = 'transparent');
            // Highlight the clicked item with your purple active background
            e.target.style.backgroundColor = 'var(--active-bg)';
            
            // Track what was clicked
            if (e.target.classList.contains('group-item')) {
                selectedGroup = e.target.getAttribute('data-group');
                selectedChannel = null;
            } else {
                selectedGroup = e.target.getAttribute('data-group');
                selectedChannel = e.target.getAttribute('data-channel');
            }
        });
    });
}

// --- NEW: Button Click Listeners ---
document.getElementById('btn-add-group').addEventListener('click', async () => {
    // Native prompt acts as your AddGroupDialog
    const groupName = prompt("Enter new Group Name:");
    if (!groupName) return; // User canceled
    
    const response = await window.api.runPython('add_group', [groupName]);
    if (response.status === 'success') {
        initApp(); // Instantly reload the trees from the database!
    } else {
        alert("Error creating group: " + response.message);
    }
});

document.getElementById('btn-add-channel').addEventListener('click', async () => {
    if (!selectedGroup) {
        alert("Please select a Group from the tree first!");
        return;
    }
    
    // Native prompt acts as your AddChannelDialog
    const channelUrl = prompt(`Enter Channel URL or Handle to add to '${selectedGroup}':`);
    if (!channelUrl) return; 
    
    // Change button text temporarily to show it's working
    const btn = document.getElementById('btn-add-channel');
    btn.innerText = "Adding...";
    
    const response = await window.api.runPython('add_channel', [selectedGroup, channelUrl]);
    
    btn.innerText = "+ Channel"; // Reset button
    
    if (response.status === 'success') {
        initApp(); // Instantly reload the trees!
    } else {
        alert("Error adding channel: " + response.message);
    }
});

// Run on load
window.addEventListener('DOMContentLoaded', initApp);