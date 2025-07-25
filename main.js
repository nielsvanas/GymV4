const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('date');
  dateInput.value = today;

  const exercisesByDay = {
    PUSH: [
      "Benchpress",
      "Incline benchpress",
      "Incline benchpress (smith)",
      "Incline dumbell press",
      "Tricep extention",
      "V bar overhead extension",
      "Single arm tricep extension",
      "Machine fly",
      "Cable side raise"
    ],
    PULL: [
      "Deadlift",
      "Hammer curl",
      "Preacher curl",
      "Ez bar curl",
      "Latt pulldown",
      "Cable row",
      "Rear delt extension"
    ],
    LEGS: [
      "Squat",
      "Hack squat",
      "Ham curl",
      "Seated ham curl",
      "Leg extensions"
    ]
  };

  let log = JSON.parse(localStorage.getItem('weightliftingLog')) || [];

  function updateExercises() {
    const day = document.getElementById('workoutDay').value;
    const exerciseSelect = document.getElementById('exercise');
    const filterSelect = document.getElementById('exerciseFilter');

    // Update workout dropdown
    exerciseSelect.innerHTML = '';
    if (!day) {
      exerciseSelect.innerHTML = '<option value="">Select workout day first</option>';
    } else {
      exercisesByDay[day].forEach(exercise => {
        const option = document.createElement('option');
        option.text = exercise;
        option.value = exercise;
        exerciseSelect.add(option);
      });
    }

    // Update exercise filter dropdown
    const allExercises = log.map(e => e.exercise);
    const uniqueExercises = [...new Set(allExercises)].sort();
    filterSelect.innerHTML = '<option value="">— Show All —</option>';
    uniqueExercises.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex;
      opt.textContent = ex;
      filterSelect.appendChild(opt);
    });
  }

  function renderLog() {
    const logList = document.getElementById('log');
    logList.innerHTML = '';

    if (log.length === 0) {
      logList.innerHTML = '<li>No entries yet.</li>';
      return;
    }

    const filter = document.getElementById('exerciseFilter').value;
    const filtered = log.filter(entry => !filter || entry.exercise === filter);

    const grouped = {};
    filtered.forEach(entry => {
      if (!grouped[entry.date]) grouped[entry.date] = [];
      grouped[entry.date].push(entry);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    sortedDates.forEach(date => {
      const dateHeader = document.createElement('li');
      dateHeader.innerHTML = `<strong>🗓 ${date}</strong>`;
      logList.appendChild(dateHeader);

      grouped[date].forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `- ${entry.exercise} - ${entry.sets} sets x ${entry.reps} reps @ ${entry.weight} kg`;
        logList.appendChild(li);
      });
    });
  }

  function renderLogByExercise() {
    const logList = document.getElementById('log');
    logList.innerHTML = '';

    if (log.length === 0) {
      logList.innerHTML = '<li>No entries yet.</li>';
      return;
    }

    const filter = document.getElementById('exerciseFilter').value;
    const filtered = log.filter(entry => !filter || entry.exercise === filter);

    const grouped = {};
    filtered.forEach(entry => {
      if (!grouped[entry.exercise]) grouped[entry.exercise] = [];
      grouped[entry.exercise].push(entry);
    });

    const sortedExercises = Object.keys(grouped).sort();
    sortedExercises.forEach(exercise => {
      const header = document.createElement('li');
      header.innerHTML = `<strong>🏋️ ${exercise}</strong>`;
      logList.appendChild(header);

      grouped[exercise]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(entry => {
          const li = document.createElement('li');
          li.textContent = `- ${entry.date} — ${entry.sets} sets x ${entry.reps} reps @ ${entry.weight} kg`;
          logList.appendChild(li);
        });
    });
  }

  function switchView() {
    const view = document.getElementById('viewMode').value;
    if (view === 'exercise') {
      renderLogByExercise();
    } else {
      renderLog();
    }
  }

  function addEntry() {
    const date = dateInput.value || today;
    const exercise = document.getElementById('exercise').value;
    const sets = parseInt(document.getElementById('sets').value);
    const reps = parseInt(document.getElementById('reps').value);
    const weight = parseFloat(document.getElementById('weight').value);

    if (!exercise || isNaN(sets) || sets <= 0 || isNaN(reps) || reps <= 0 || isNaN(weight) || weight < 0) {
      alert('Please fill out all fields correctly.');
      return;
    }

    log.push({ date, exercise, sets, reps, weight });
    localStorage.setItem('weightliftingLog', JSON.stringify(log));
    switchView();
    updateExercises();

    // Reset form
    dateInput.value = today;
    document.getElementById('workoutDay').value = '';
    document.getElementById('exercise').innerHTML = '<option value="">Select workout day first</option>';
    document.getElementById('sets').value = '';
    document.getElementById('reps').value = '';
    document.getElementById('weight').value = '';
  }

   function exportLog() {
    if (log.length === 0) {
      alert("No entries to export.");
      return;
    }

    const dataStr = JSON.stringify(log, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "workout_log.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  function importLog(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error("Invalid format");

        // Merge or replace? (Here we merge)
        log = log.concat(imported);
        localStorage.setItem('weightliftingLog', JSON.stringify(log));
        renderLog();
        alert("Entries imported successfully.");
      } catch (err) {
        alert("Failed to import file. Make sure it's a valid .json export.");
      }
    };

    reader.readAsText(file);
  }

function clearEntriesByDate() {
  const dateToClear = dateInput.value;
  if (!dateToClear) {
    alert("Please select a date.");
    return;
  }

  const originalLength = log.length;
  log = log.filter(entry => entry.date !== dateToClear);

  if (log.length === originalLength) {
    alert("No entries found for the selected date.");
    return;
  }

  localStorage.setItem('weightliftingLog', JSON.stringify(log));
  switchView();
  alert(`Entries for ${dateToClear} have been cleared.`);
}


  switchView();
  updateExercises();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js').then(function (registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
