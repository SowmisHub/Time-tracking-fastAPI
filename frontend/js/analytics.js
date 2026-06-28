// analytics.js

document.addEventListener("DOMContentLoaded", () => {

    const analyticsDate = document.getElementById("analyticsDate");
    const analyticsContent = document.getElementById("analyticsContent");
    const emptyAnalytics = document.getElementById("emptyAnalytics");
    const loadingAnalytics = document.getElementById("loadingAnalytics");

    const navUserName = document.getElementById("navUserName");
    const navUserInitial = document.getElementById("navUserInitial");

    const logoutBtn = document.getElementById("logoutBtn");

    const totalHours = document.getElementById("totalHours");
    const totalActivities = document.getElementById("totalActivities");
    const topCategory = document.getElementById("topCategory");
    const avgDuration = document.getElementById("avgDuration");

    const categoryList = document.getElementById("categoryList");

    let pieChart = null;
    let barChart = null;

    let currentDate = Utils.getTodayDate();
    let activities = [];

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
        window.location.href = "index.html";
        return;
    }

    if (navUserName) {
        navUserName.textContent = user.name;
    }

    if (navUserInitial) {
        navUserInitial.textContent = user.name.charAt(0).toUpperCase();
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get("date")) {
        currentDate = params.get("date");
    }

    analyticsDate.value = currentDate;
    analyticsDate.max = Utils.getTodayDate();

    loadAnalytics();

    async function loadAnalytics() {

        showLoading(true);

        try {

            activities = await DB.getActivities(currentDate);

            if (!activities || activities.length === 0) {

                analyticsContent.classList.add("hidden");
                emptyAnalytics.classList.remove("hidden");

            } else {

                emptyAnalytics.classList.add("hidden");
                analyticsContent.classList.remove("hidden");

                updateSummary();
                renderCharts();
                renderCategoryBreakdown();

            }

        } catch (err) {

            console.error(err);

            analyticsContent.classList.add("hidden");
            emptyAnalytics.classList.remove("hidden");

        }

        showLoading(false);

    }

    function showLoading(show) {

        if (show) {

            loadingAnalytics.classList.remove("hidden");
            analyticsContent.classList.add("hidden");
            emptyAnalytics.classList.add("hidden");

        } else {

            loadingAnalytics.classList.add("hidden");

        }

    }

    function updateSummary() {

        const total = activities.reduce((sum, item) => sum + item.duration, 0);

        totalHours.textContent = Utils.formatDuration(total);

        totalActivities.textContent = activities.length;

        const totals = {};

        activities.forEach(activity => {

            if (!totals[activity.category]) {

                totals[activity.category] = 0;

            }

            totals[activity.category] += activity.duration;

        });

        const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

        if (sorted.length) {

            topCategory.textContent =
                Utils.getCategoryEmoji(sorted[0][0]) + " " + sorted[0][0];

        } else {

            topCategory.textContent = "-";

        }

        avgDuration.textContent = Utils.formatDuration(
            activities.length ? Math.round(total / activities.length) : 0
        );

    }

    function getCategoryTotals() {

        const totals = {};

        activities.forEach(activity => {

            if (!totals[activity.category]) {

                totals[activity.category] = 0;

            }

            totals[activity.category] += activity.duration;

        });

        return totals;

    }

    function renderCharts() {

        renderPieChart();

        renderBarChart();

    }

    function renderPieChart() {

        const canvas = document.getElementById("pieChart");

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        const totals = getCategoryTotals();

        const labels = Object.keys(totals);

        const data = Object.values(totals);

        const colors = labels.map(c => Utils.getCategoryColor(c));

        if (pieChart) {

            pieChart.destroy();

        }

        pieChart = new Chart(ctx, {

            type: "doughnut",

            data: {

                labels,

                datasets: [{

                    data,

                    backgroundColor: colors,

                    borderColor: "#ffffff",

                    borderWidth: 2

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        });

    }

    function renderBarChart() {

        const canvas = document.getElementById("barChart");

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (barChart) {

            barChart.destroy();

        }

        barChart = new Chart(ctx, {

            type: "bar",

            data: {

                labels: activities.map(a => a.name),

                datasets: [{

                    data: activities.map(a => a.duration),

                    backgroundColor: activities.map(a =>
                        Utils.getCategoryColor(a.category)
                    )

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

    }

    function renderCategoryBreakdown() {

        const totals = getCategoryTotals();

        categoryList.innerHTML = "";

        Object.entries(totals)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, duration]) => {

                categoryList.innerHTML += `

                <div class="category-item">

                    <span class="category-dot"
                        style="background:${Utils.getCategoryColor(category)}">
                    </span>

                    <span class="category-name">
                        ${Utils.getCategoryEmoji(category)}
                        ${category}
                    </span>

                    <span class="category-duration">
                        ${Utils.formatDuration(duration)}
                    </span>

                </div>

                `;

            });

    }

    analyticsDate.addEventListener("change", e => {

        currentDate = e.target.value;

        history.replaceState(
            {},
            "",
            `analytics.html?date=${currentDate}`
        );

        loadAnalytics();

    });

    logoutBtn?.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";

    });

});