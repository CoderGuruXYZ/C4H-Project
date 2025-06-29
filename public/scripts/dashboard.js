// Code creates a popup for all the user guide info, and if the user selects "Don't show again", it will not show the guide again

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('dashboardDontShowGuide') !== 'true') {
        let userGuideModal = new bootstrap.Modal(document.getElementById('userGuideModal'));
        userGuideModal.show();
    }
    document.getElementById('dontShowGuide').checked = localStorage.getItem('dashboardDontShowGuide') === 'true';
    document.getElementById('dontShowGuide').addEventListener('change', function (e) {
        localStorage.setItem('dashboardDontShowGuide', e.target.checked ? 'true' : 'false');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Checks if the user is logged in, and if not, redirects them to the login page
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            window.currentUserId = user.uid;
            loadEntries();
        } else {
            window.location.href = 'login.html';
        }
    });

    // Submit event listener for the entry form
    document.getElementById('entryForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveEntry();
    });

    // Event listener for the export CSV button
    document.getElementById('exportCSVBtn').addEventListener('click', function () {
        const userId = window.currentUserId;
        if (!userId) return;
        firebase.database().ref('users/' + userId + '/entries').once('value').then(function (snapshot) {
            const entries = Object.values(snapshot.val() || {}).sort((a, b) => a.date.localeCompare(b.date));
            exportDataAsCSV(entries);
        });
    });

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Function which saves the entry data to Firebase
function saveEntry() {
    const userId = window.currentUserId;
    if (!userId) {
        return;
    }
    const date = document.getElementById('entryDate').value;
    // Gathers all data from the inputs, and defaults empty ones to 0
    const netWorth = parseFloat(document.getElementById('netWorth').value) || 0;
    const investments = parseFloat(document.getElementById('investments').value) || 0;
    const debts = parseFloat(document.getElementById('debts').value) || 0;
    const expenses = parseFloat(document.getElementById('expenses').value) || 0;
    if (!date) {
        return alert('Please select a date.');
    }
    const entry = {
        date,
        netWorth,
        investments,
        debts,
        expenses
    };

    // Saves the data to firebase under the UID and date, then reloads the entries
    firebase.database().ref('users/' + userId + '/entries/' + date).set(entry).then(function () {
        loadEntries();
    });
}

// Function to load all entries from Firebase and display them in the dashboard
function loadEntries() {
    const userId = window.currentUserId;
    if (!userId) {
        return;
    }

    // Grabs all entries from Firebase for the current user, sorts them by date, and loads them into the dashboard
    firebase.database().ref('users/' + userId + '/entries').once('value').then(function (snapshot) {
        const entries = snapshot.val() || {};
        const sorted = Object.values(entries).sort((a, b) => a.date.localeCompare(b.date));

        loadChart(sorted);
        loadLatestSummary(sorted);
        loadDataPointsList(sorted);
        loadProjectionsAndPie(sorted);
    });
}

// Loads the summary of the most recent entry into the dashboard
function loadLatestSummary(entries) {
    let summaryDiv = document.getElementById('latestSummary');
    summaryDiv.innerHTML = '';

    if (entries.length <= 0) {
        summaryDiv.innerHTML = '<div class="col">No data yet. Enter your first record above.</div>';
        return;
    }

    // Gets the most recent entry and displays it in the summary section
    let mostRecent = entries[entries.length - 1];
    summaryDiv.innerHTML = `
        <div class="col-md-3">
            <div class="card text-center">
                <div class="card-body">
                    <h6 class="card-title">Net Worth</h6>
                    <p class="card-text fw-bold">$${mostRecent.netWorth.toLocaleString()}</p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-center">
                <div class="card-body">
                    <h6 class="card-title">Investments</h6>
                    <p class="card-text fw-bold">$${mostRecent.investments.toLocaleString()}</p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-center">
                <div class="card-body">
                    <h6 class="card-title">Debts</h6>
                    <p class="card-text fw-bold">$${mostRecent.debts.toLocaleString()}</p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-center">
                <div class="card-body">
                    <h6 class="card-title">Monthly Expenses</h6>
                    <p class="card-text fw-bold">$${mostRecent.expenses.toLocaleString()}</p>
                </div>
            </div>
        </div>
    `;
}

// Loads the data points list into the dashboard table
function loadDataPointsList(entries) {
    const table = document.getElementById('dataPointsTable').getElementsByTagName('tbody')[0];
    const noDataMsg = document.getElementById('noDataMsg');

    table.innerHTML = '';
    if (!entries.length) {
        noDataMsg.textContent = 'No data points yet. Add your first entry above!';
        return;
    }

    noDataMsg.textContent = '';
    entries.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-semibold">${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td class="">$${e.netWorth.toLocaleString()}</td>
            <td class="">$${e.investments.toLocaleString()}</td>
            <td class="">$${e.debts.toLocaleString()}</td>
            <td class="">$${e.expenses.toLocaleString()}</td>
        `;

        table.appendChild(row);
    });
}

let historyChart;

// Loads the history chart with all data points, using Chart.js
function loadChart(entries) {
    // Grabs all data required for the chart, including labels and datasets
    const labels = entries.map(e => e.date);
    const netWorth = entries.map(e => e.netWorth);
    const investments = entries.map(e => e.investments);
    const debts = entries.map(e => e.debts);
    const expenses = entries.map(e => e.expenses);
    const ctx = document.getElementById('historyChart').getContext('2d');

    // Removes the existing chart if it exists
    if (historyChart) {
        historyChart.destroy();
    }

    // Labels, data, colours and options for the chart
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                    label: 'Net Worth',
                    data: netWorth,
                    borderColor: '#007bff',
                    fill: false
                },
                {
                    label: 'Investments',
                    data: investments,
                    borderColor: '#28a745',
                    fill: false
                },
                {
                    label: 'Debts',
                    data: debts,
                    borderColor: '#dc3545',
                    fill: false
                },
                {
                    label: 'Expenses',
                    data: expenses,
                    borderColor: '#ffc107',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

// Loads the projections and pie charts into the dashboard, underneath the graph
function loadProjectionsAndPie(entries) {
    const projectionDiv = document.getElementById('projectionCharts');
    const projContainer = document.getElementById('projectionChartContainer');
    const pieContainer = document.getElementById('pieChartContainer');
    const avgExpenseContainer = document.getElementById('avgExpenseChartContainer');
    const debtToAssetContainer = document.getElementById('debtToAssetChartContainer');

    // Hides all containers initially
    projContainer.style.display = 'none';
    pieContainer.style.display = 'none';
    avgExpenseContainer.style.display = 'none';
    debtToAssetContainer.style.display = 'none';
    if (entries.length < 3) {
        return;
    }

    // Net Worth Projection Chart w/ Linear Regression
    let dates = entries.map(e => e.date);
    let netWorth = entries.map(e => e.netWorth);
    let n = netWorth.length;
    let x = [...Array(n).keys()];
    let sumX = x.reduce((a, b) => a + b, 0);
    let sumY = netWorth.reduce((a, b) => a + b, 0);
    let sumXY = x.reduce((a, b, i) => a + b * netWorth[i], 0);
    let sumXX = x.reduce((a, b) => a + b * b, 0);
    let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;
    let futureX = [n, n + 1, n + 2];
    let futureNetWorth = futureX.map(xi => slope * xi + intercept);
    let allLabels = [...dates, 'Proj 1', 'Proj 2', 'Proj 3'];
    let allNetWorth = [...netWorth, ...futureNetWorth];
    /* The above is AI generated code, which calculates the linear regression for the net worth data and projects it into the future. */

    // all the .destroy() functions are to ensure that if the chart already exists, it is destroyed before creating a new one

    projContainer.style.display = '';
    const projCtx = document.getElementById('projectionChart').getContext('2d');
    if (window.projectionChart && typeof window.projectionChart.destroy === 'function') {
        window.projectionChart.destroy();
    }

    // Creates the projection chart with the calculated data
    window.projectionChart = new Chart(projCtx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [{
                label: 'Net Worth (with Projection)',
                data: allNetWorth,
                borderColor: '#007bff',
                fill: false,
                pointStyle: 'circle'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 6
                    }
                }
            }
        }
    });

    // Pie Chart for Latest Data
    pieContainer.style.display = '';
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    if (window.pieChart && typeof window.pieChart.destroy === 'function') {
        window.pieChart.destroy();
    }

    const mostRecent = entries[entries.length - 1];
    window.pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Investments', 'Debts', 'Expenses'],
            datasets: [{
                data: [mostRecent.investments, mostRecent.debts, mostRecent.expenses],
                backgroundColor: ['#28a745', '#dc3545', '#ffc107']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Single Bar for Average Monthly Expenses
    avgExpenseContainer.style.display = '';
    const avgExpenseCtx = document.getElementById('avgExpenseChart').getContext('2d');

    if (window.avgExpenseChart && typeof window.avgExpenseChart.destroy === 'function') {
        window.avgExpenseChart.destroy();
    }

    const avgExpense = (entries.reduce((sum, e) => sum + e.expenses, 0)) / entries.length;
    window.avgExpenseChart = new Chart(avgExpenseCtx, {
        type: 'bar',
        data: {
            labels: ['Average Expenses'],
            datasets: [{
                label: 'Avg Monthly Expenses',
                data: [avgExpense],
                backgroundColor: '#ffc107'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Line Chart for Debt/Asset Ratio over Time
    debtToAssetContainer.style.display = '';
    const debtToAssetCtx = document.getElementById('debtToAssetChart').getContext('2d');

    if (window.debtToAssetChart && typeof window.debtToAssetChart.destroy === 'function') {
        window.debtToAssetChart.destroy();
    }

    const debtToAssetLabels = entries.map(e => e.date);
    const debtToAssetData = entries.map(e => {
        const assets = e.netWorth + e.debts;
        return assets > 0 ? (e.debts / assets) : 0;
    });
    window.debtToAssetChart = new Chart(debtToAssetCtx, {
        type: 'line',
        data: {
            labels: debtToAssetLabels,
            datasets: [{
                label: 'Debt/Asset Ratio',
                data: debtToAssetData,
                borderColor: '#dc3545',
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 1
                }
            }
        }
    });
}

// CSV Data Export Function
function exportDataAsCSV(entries) {
    if (!entries.length) {
        alert('No data to export!');
        return;
    }

    // Sorts the entries by date before exporting
    const header = ['Date', 'Net Worth', 'Investments', 'Debts', 'Expenses'];
    const rows = entries.map(e => [e.date, e.netWorth, e.investments, e.debts, e.expenses]);
    const csvContent = [header, ...rows].map(row => row.join(",")).join("\r\n");
    const blob = new Blob([csvContent], {
        type: 'text/csv'
    });
    // Creates a temporary link to download the CSV file, clicks the link, and then removes it, causing a download prompt
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}