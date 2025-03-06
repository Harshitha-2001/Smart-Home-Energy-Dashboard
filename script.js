document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;

    // Check if dark mode was previously enabled
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
    }

    darkModeToggle.addEventListener("click", function () {
        body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });

    let ctx = document.getElementById("energyChart").getContext("2d");
    let lineCtx = document.getElementById("energyLineChart").getContext("2d");
    let doughnutCtx = document.getElementById("energyDoughnutChart").getContext("2d");
    let pieCtx = document.getElementById("energyPieChart").getContext("2d");
    let predictionCtx = document.getElementById("energyPredictionChart").getContext("2d");

    let originalData = [100, 80, 50, 120, 90];
    let energyData = {
        labels: ["AC", "Fridge", "TV", "Washing Machine", "Lights"],
        datasets: [{
            label: "Energy Usage (kWh)",
            data: [...originalData],
            backgroundColor: ["red", "blue", "yellow", "green", "purple"]
        }]
    };

    let energyChart = new Chart(ctx, { type: "bar", data: energyData, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } } });

    let lineChartData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
            label: "Energy Usage (kWh)",
            data: [400, 380, 420, 450, 410, 390, 370],
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.1)",
            fill: true
        }]
    };

    let energyLineChart = new Chart(lineCtx, { type: "line", data: lineChartData, options: { responsive: true, maintainAspectRatio: false } });
    let energyDoughnutChart = new Chart(doughnutCtx, { type: "doughnut", data: { labels: energyData.labels, datasets: [{ data: [...originalData], backgroundColor: ["red", "blue", "yellow", "green", "purple"] }] }, options: { responsive: true, maintainAspectRatio: false } });
    let energyPieChart = new Chart(pieCtx, { type: "pie", data: { labels: ["Renewable Energy", "Non-Renewable Energy"], datasets: [{ data: [60, 40], backgroundColor: ["green", "gray"] }] }, options: { responsive: true, maintainAspectRatio: false } });

    function predictEnergyUsage() {
        let pastUsage = [400, 380, 420, 450, 410, 390, 370];
        let predictedUsage = [];
        let slope = (pastUsage[pastUsage.length - 1] - pastUsage[0]) / pastUsage.length;
        for (let i = 1; i <= 7; i++) {
            predictedUsage.push(Math.round(pastUsage[pastUsage.length - 1] + slope * i));
        }
        return predictedUsage;
    }

    let energyPredictionChart = new Chart(predictionCtx, { type: "line", data: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], datasets: [{ label: "Predicted Energy Usage (kWh)", data: predictEnergyUsage(), borderColor: "orange", backgroundColor: "rgba(255, 165, 0, 0.2)", fill: true }] }, options: { responsive: true, maintainAspectRatio: false } });

    function generateSuggestions(data) {
        if (!data || data.length === 0) return;
        let maxUsage = Math.max(...data);
        let maxUsageIndices = data.map((val, index) => (val === maxUsage ? index : -1)).filter(index => index !== -1);
        let suggestions = { "AC": "Set the AC to 24°C instead of 18°C to save energy.", "Fridge": "Ensure the fridge door is properly closed and defrost regularly.", "TV": "Turn off the TV when not in use or switch to energy-saving mode.", "Washing Machine": "Use cold water and wash full loads to reduce power consumption.", "Lights": "Switch to LED bulbs and turn off lights when leaving the room." };
        if (!maxUsageIndices.length) return;
        let appliances = maxUsageIndices.map(index => energyData.labels[index]).join(" and ");
        let messages = maxUsageIndices.map(index => suggestions[energyData.labels[index]]).join(" ");
        let suggestionElement = document.getElementById("energySuggestions");
        if (suggestionElement) {
            suggestionElement.innerText = `💡 Renewable Energy Suggestions\nHigh usage detected on ${appliances}. ${messages}`;
        }
    }

    generateSuggestions(originalData);

    window.updateGraph = function () {
        let budget = parseInt(document.getElementById("energyBudget").value);
        let totalUsage = originalData.reduce((a, b) => a + b, 0);
        if (isNaN(budget) || budget <= 0) {
            alert("⚠️ Please enter a valid energy budget!");
            return;
        }
        let scaleFactor = budget < totalUsage ? budget / totalUsage : 1;
        let newUsageData = originalData.map(val => Math.round(val * scaleFactor));
        energyChart.data.datasets[0].data = newUsageData;
        energyChart.update();
        energyLineChart.data.datasets[0].data = lineChartData.datasets[0].data.map(val => Math.round(val * scaleFactor));
        energyLineChart.update();
        energyDoughnutChart.data.datasets[0].data = newUsageData;
        energyDoughnutChart.update();
        let renewablePercentage = Math.min((budget / totalUsage) * 100, 100);
        let nonRenewablePercentage = 100 - renewablePercentage;
        energyPieChart.data.datasets[0].data = [renewablePercentage, nonRenewablePercentage];
        energyPieChart.update();
        let predictedUsage = predictEnergyUsage().map(val => Math.round(val * scaleFactor));
        energyPredictionChart.data.datasets[0].data = predictedUsage;
        energyPredictionChart.update();
        generateSuggestions(newUsageData);
    };
});
