// body.js
const today = new Date().toISOString().split("T")[0];
const dateInput = document.getElementById("date");
dateInput.value = today;

let metrics = JSON.parse(localStorage.getItem("bodyMetricsLog")) || [];

// ----- render -----
function renderMetrics() {
  const ul = document.getElementById("metricsLog");
  ul.innerHTML = "";

  if (metrics.length === 0) {
    ul.innerHTML = "<li>No metrics yet.</li>";
    return;
  }

  // group by date (latest first)
  const grouped = {};
  metrics.forEach(m => {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m);
  });

  Object.keys(grouped)
    .sort((a, b) => new Date(b) - new Date(a))
    .forEach(date => {
      const header = document.createElement("li");
      header.innerHTML = `<strong>🗓 ${date}</strong>`;
      ul.appendChild(header);

      grouped[date].forEach(m => {
        const li = document.createElement("li");
        li.textContent = `- ${m.weight} kg @ ${m.bodyFat}% body fat`;
        ul.appendChild(li);
      });
    });
}

// ----- add entry -----
function addMetric() {
  const date = dateInput.value || today;
  const weightVal = parseFloat(document.getElementById("bodyWeight").value);
  const fatVal = parseFloat(document.getElementById("bodyFat").value);

  if (isNaN(weightVal) || weightVal <= 0 || isNaN(fatVal) || fatVal < 0 || fatVal > 100) {
    alert("Please enter valid weight and body-fat values.");
    return;
  }

  metrics.push({ date, weight: weightVal, bodyFat: fatVal });
  localStorage.setItem("bodyMetricsLog", JSON.stringify(metrics));
  renderMetrics();

  // reset form
  dateInput.value = today;
  document.getElementById("bodyWeight").value = "";
  document.getElementById("bodyFat").value = "";
}

// initial render
renderMetrics();
