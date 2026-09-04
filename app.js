// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    // Setup global SOS button
    document.getElementById('header-sos-btn').addEventListener('click', () => {
        showToast('Global Emergency Protocol Initiated!', true);
    });

    // Initialize the default view (dashboard)
    window.renderView('dashboard');
});

window.renderView = function(id) {
    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${id}`);
    if (activeNav) activeNav.classList.add('active');
    
    // Update active state of page sections
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active-page'));
    const activeSection = document.getElementById(`page-${id}`);
    if (activeSection) {
        activeSection.classList.add('active-page');
    }

    // Initialize libraries if needed after making the section visible
    setTimeout(() => {
        if (id === 'dashboard') {
            initDashboardChart();
        } else if (id === 'command-map') {
            initLeafletMap();
        } else if (id === 'analytics') {
            initAnalyticsCharts();
        }
    }, 100);
};

// --- LIBRARY INITIALIZATIONS ---

let mapInstance = null;
let charts = [];

function clearCharts() {
    charts.forEach(c => c.destroy());
    charts = [];
}

function initDashboardChart() {
    clearCharts();
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;

    // Dark theme configuration for Chart.js
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Actual Output (Tons)',
                data: [1200, 1350, 1100, 1400, 1550, 1600, 1650],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 4
            }, {
                label: 'Target',
                type: 'line',
                data: [1300, 1300, 1300, 1400, 1400, 1500, 1500],
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
    charts.push(chart);
}

function initAnalyticsCharts() {
    clearCharts();
    
    // Predictive Line Chart
    const ctxPredictive = document.getElementById('predictiveChart');
    if (ctxPredictive) {
        const c1 = new Chart(ctxPredictive, {
            type: 'line',
            data: {
                labels: Array.from({length: 30}, (_, i) => `Day ${i+1}`),
                datasets: [{
                    label: 'Predicted Pump Failure Probability (%)',
                    data: [10, 12, 11, 15, 18, 22, 21, 25, 30, 35, 32, 40, 45, 55, 60, 58, 65, 70, 75, 80, 85, 88, 92, 95, 96, 98, 99, 99, 100, 100],
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
        charts.push(c1);
    }

    // Radar Risk Chart
    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar) {
        const c2 = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['Ventilation', 'Seismic', 'Water Ingress', 'Gas Levels', 'Structural', 'Equipment'],
                datasets: [{
                    label: 'Jharia Block II',
                    data: [85, 30, 45, 90, 60, 75],
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    pointBackgroundColor: 'rgba(239, 68, 68, 1)'
                }, {
                    label: 'Raniganj East',
                    data: [30, 20, 40, 35, 50, 45],
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { backdropColor: 'transparent', color: '#94a3b8' }
                    }
                }
            }
        });
        charts.push(c2);
    }
}

function initLeafletMap() {
    const mapDiv = document.getElementById('gis-map');
    if (!mapDiv) return;
    
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    mapInstance = L.map('gis-map').setView([23.7957, 86.4304], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapInstance);

    const mineIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:var(--primary); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--primary);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const alertIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:var(--danger); width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px var(--danger); animation: pulse 1s infinite;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });

    L.marker([23.7957, 86.4304], {icon: alertIcon}).addTo(mapInstance).bindPopup("<b>Jharia Block II</b><br>Critical Sub-surface heating.");
    L.marker([23.6333, 85.5167], {icon: mineIcon}).addTo(mapInstance).bindPopup("<b>Ramgarh</b><br>Normal Operations.");
    L.marker([23.65, 86.95], {icon: mineIcon}).addTo(mapInstance).bindPopup("<b>Raniganj East</b><br>Normal Operations.");
    L.marker([17.67, 80.88], {icon: mineIcon}).addTo(mapInstance).bindPopup("<b>Godavari Cluster</b><br>Warning: Pressure drop.");
    L.marker([20.93, 85.15], {icon: mineIcon}).addTo(mapInstance).bindPopup("<b>Talcher</b><br>Normal Operations.");
}

window.showToast = function(message, isDanger = false) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    const icon = toast.querySelector('i');
    
    msg.textContent = message;
    
    if(isDanger) {
        toast.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        toast.style.background = 'rgba(239, 68, 68, 0.1)';
        icon.className = 'fa-solid fa-triangle-exclamation';
        icon.style.color = 'var(--danger)';
    } else {
        toast.style.borderColor = 'var(--border-light)';
        toast.style.background = 'var(--bg-surface)';
        icon.className = 'fa-solid fa-circle-info';
        icon.style.color = 'var(--success)';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
};
