let data = JSON.parse(localStorage.getItem('questionTracker')) || { users: {}, currentUser: '' };
let chart = null; // Global chart instance
let currentView = 'weekly'; // Default view

function saveData() {
    localStorage.setItem('questionTracker', JSON.stringify(data));
}

function getDateString(date) {
    return date.toISOString().split('T')[0];
}

function loadMain() {
    document.getElementById('userSelection').style.display = 'none';
    document.getElementById('main').style.display = 'block';
    document.getElementById('currentUser').textContent = data.currentUser;
    updateDisplays();
    initializeChart();
    updateChart();
}

function updateDisplays() {
    const userData = data.users[data.currentUser];
    const today = getDateString(new Date());
    const dailyCount = userData[today] || 0;
    document.getElementById('daily').textContent = dailyCount;

    // Weekly progress
    const weeklyDiv = document.getElementById('weekly');
    weeklyDiv.innerHTML = '';
    const weeklyCounts = [];
    const weeklyDates = [];
    let weeklySum = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getDateString(d);
        const count = userData[dateStr] || 0;
        weeklyDates.push(dateStr);
        weeklyCounts.push(count);
        weeklySum += count;
    }
    const maxWeekly = Math.max(...weeklyCounts, 1);
    for (let j = 0; j < 7; j++) {
        const percent = (weeklyCounts[j] / maxWeekly) * 100;
        weeklyDiv.innerHTML += `<div class="day"><span>${weeklyDates[j]}: ${weeklyCounts[j]}</span><div class="bar" style="width: ${percent}%"></div></div>`;
    }
    weeklyDiv.innerHTML += `<p>Total this week: ${weeklySum}</p>`;

    // Monthly progress
    const monthlyDiv = document.getElementById('monthly');
    monthlyDiv.innerHTML = '';
    const now = new Date();
    const monthlyCounts = [];
    const monthlyDates = [];
    let monthlySum = 0;
    const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    while (currentDate <= endDate) {
        const dateStr = getDateString(currentDate);
        const count = userData[dateStr] || 0;
        monthlyDates.push(dateStr);
        monthlyCounts.push(count);
        monthlySum += count;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    const maxMonthly = Math.max(...monthlyCounts, 1);
    for (let j = 0; j < monthlyDates.length; j++) {
        const percent = (monthlyCounts[j] / maxMonthly) * 100;
        monthlyDiv.innerHTML += `<div class="day"><span>${monthlyDates[j]}: ${monthlyCounts[j]}</span><div class="bar" style="width: ${percent}%"></div></div>`;
    }
    monthlyDiv.innerHTML += `<p>Total this month: ${monthlySum}</p>`;

    updateChart();
}

function initializeChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Questions Completed',
                data: [],
                borderColor: '#bb86fc',
                backgroundColor: 'rgba(187, 134, 252, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6200ea',
                pointHoverBackgroundColor: '#6200ea',
                pointHoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Questions',
                        color: '#e0e0e0'
                    },
                    ticks: {
                        color: '#e0e0e0',
                        stepSize: 1
                    },
                    grid: {
                        color: '#444444'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        color: '#e0e0e0'
                    },
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: '#444444'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

function updateChart() {
    const userData = data.users[data.currentUser];
    let labels = [];
    let counts = [];

    if (currentView === 'daily') {
        const today = getDateString(new Date());
        labels = [today];
        counts = [userData[today] || 0];
        chart.options.scales.x.title.text = 'Today';
    } else if (currentView === 'weekly') {
        labels = [];
        counts = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = getDateString(d);
            labels.push(dateStr);
            counts.push(userData[dateStr] || 0);
        }
        chart.options.scales.x.title.text = 'Date';
    } else if (currentView === 'monthly') {
        labels = [];
        counts = [];
        const now = new Date();
        const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        while (currentDate <= endDate) {
            const dateStr = getDateString(currentDate);
            labels.push(dateStr);
            counts.push(userData[dateStr] || 0);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        chart.options.scales.x.title.text = 'Date';
    }

    chart.data.labels = labels;
    chart.data.datasets[0].data = counts;
    chart.update();

    // Update button styles
    document.getElementById('showDaily').classList.toggle('active', currentView === 'daily');
    document.getElementById('showWeekly').classList.toggle('active', currentView === 'weekly');
    document.getElementById('showMonthly').classList.toggle('active', currentView === 'monthly');
}

window.addEventListener('load', () => {
    if (data.currentUser && data.users[data.currentUser]) {
        loadMain();
    }
});

document.getElementById('setUser').addEventListener('click', () => {
    const user = document.getElementById('username').value.trim();
    if (user) {
        data.currentUser = user;
        if (!data.users[user]) {
            data.users[user] = {};
        }
        saveData();
        loadMain();
    }
});

document.getElementById('logQuestion').addEventListener('click', () => {
    const userData = data.users[data.currentUser];
    const today = getDateString(new Date());
    if (!userData[today]) {
        userData[today] = 0;
    }
    userData[today]++;
    saveData();
    updateDisplays();
});

document.getElementById('changeUser').addEventListener('click', () => {
    data.currentUser = '';
    saveData();
    location.reload();
});

document.getElementById('showDaily').addEventListener('click', () => {
    currentView = 'daily';
    updateChart();
});

document.getElementById('showWeekly').addEventListener('click', () => {
    currentView = 'weekly';
    updateChart();
});

document.getElementById('showMonthly').addEventListener('click', () => {
    currentView = 'monthly';
    updateChart();
});