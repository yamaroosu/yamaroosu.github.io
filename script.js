document.addEventListener('DOMContentLoaded', () => {
    let currentWeekStart = new Date(2025, 1, 10);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Start on Monday
    let darkMode = false;
    let subjectDetails = JSON.parse(localStorage.getItem('subjectDetails')) || {};
    let holidays = [];

    const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

    function updateSchedule() {
        const scheduleGrid = document.getElementById('schedule-grid');
        scheduleGrid.innerHTML = '';

        for (let hour = 1; hour <= 8; hour++) {
            const row = document.createElement('div');
            row.className = 'row';

            // Add time column
            const timeCell = document.createElement('div');
            timeCell.className = 'cell time-column';
            timeCell.textContent = `${hour}. Stunde`;
            row.appendChild(timeCell);

            // Add subject cells
            days.forEach((day, index) => {
                const subjectKey = `${hour}-${index + 1}`;
                const subjectCell = document.createElement('div');
                subjectCell.className = 'cell';

                const subjectElement = document.createElement('div');
                subjectElement.className = 'subject';
                subjectElement.textContent = subjectDetails[subjectKey]?.name || `Fach ${subjectKey}`;
                subjectElement.style.backgroundColor = getSubjectColor(subjectKey);
                subjectElement.addEventListener('click', () => showSubjectDetails(subjectKey));

                // Check for exams
                if (subjectDetails[subjectKey] && subjectDetails[subjectKey].exams.length > 0) {
                    const examLabel = document.createElement('div');
                    examLabel.textContent = 'Klassenarbeit!';
                    examLabel.style.color = 'red';
                    subjectElement.appendChild(examLabel);
                }

                subjectCell.appendChild(subjectElement);
                row.appendChild(subjectCell);
            });

            scheduleGrid.appendChild(row);
        }
    }

    function getSubjectColor(subjectKey) {
        if (darkMode) {
            return subjectKey === "1-1" ? '#006400' : subjectKey === "2-2" ? '#8b0000' : '#00008b';
        } else {
            return subjectKey === "1-1" ? '#90ee90' : subjectKey === "2-2" ? '#ffa07a' : '#add8e6';
        }
    }

    function showSubjectDetails(subjectKey) {
        const details = subjectDetails[subjectKey] || { name: `Fach ${subjectKey}`, notes: '', homework: '', exams: [] };
        const detailsForm = `
            <div class="details-form">
                <label>Fachname:</label>
                <input type="text" id="subjectName" value="${details.name}">
                <label>Notizen:</label>
                <textarea id="notes">${details.notes}</textarea>
                <label>Hausaufgaben:</label>
                <textarea id="homework">${details.homework}</textarea>
                <button id="addExam">Klassenarbeit eintragen</button>
                <button id="saveDetails">Speichern</button>
            </div>
        `;
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = detailsForm;
        document.body.appendChild(overlay);

        document.getElementById('addExam').addEventListener('click', () => addExam(subjectKey));
        document.getElementById('saveDetails').addEventListener('click', () => {
            subjectDetails[subjectKey] = {
                name: document.getElementById('subjectName').value,
                notes: document.getElementById('notes').value,
                homework: document.getElementById('homework').value,
                exams: details.exams
            };
            localStorage.setItem('subjectDetails', JSON.stringify(subjectDetails));
            overlay.remove();
            updateSchedule();
        });
    }

    function addExam(subjectKey) {
        const examForm = `
            <div class="exam-form">
                <textarea id="examDescription" placeholder="Klassenarbeit beschreiben..."></textarea>
                <button id="saveExam">Speichern</button>
            </div>
        `;
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = examForm;
        document.body.appendChild(overlay);

        document.getElementById('saveExam').addEventListener('click', () => {
            const examDescription = document.getElementById('examDescription').value;
            if (!subjectDetails[subjectKey]) {
                subjectDetails[subjectKey] = { name: `Fach ${subjectKey}`, notes: '', homework: '', exams: [] };
            }
            subjectDetails[subjectKey].exams.push(examDescription);
            localStorage.setItem('subjectDetails', JSON.stringify(subjectDetails));
            overlay.remove();
            updateSchedule();
        });
    }

    function toggleDarkMode() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
        updateSchedule();
    }

    function changeWeek(weeks) {
        currentWeekStart.setDate(currentWeekStart.getDate() + weeks * 7);
        updateSchedule();
    }

    function startTimer() {
        setInterval(() => {
            document.getElementById('time').textContent = new Date().toLocaleTimeString('de-DE');
        }, 1000);
    }

    async function loadHolidays() {
        const response = await fetch('https://date.nager.at/api/v2/publicholidays/2025/DE');
        holidays = await response.json();
        updateSchedule();
    }

    document.getElementById('prevWeek').addEventListener('click', () => changeWeek(-1));
    document.getElementById('nextWeek').addEventListener('click', () => changeWeek(1));
    document.getElementById('darkMode').addEventListener('click', toggleDarkMode);
    document.getElementById('addSubject').addEventListener('click', () => {
        const subjectName = prompt('Fachname eingeben:');
        if (subjectName) {
            alert(`Fach hinzugefügt: ${subjectName}`);
        }
    });
    document.getElementById('export').addEventListener('click', () => alert('Stundenplan exportiert!'));

    startTimer();
    loadHolidays();
    updateSchedule();
});