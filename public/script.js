document.addEventListener('DOMContentLoaded', () => {
  const courseSelect = document.getElementById('course');
  const uvuIdInput = document.getElementById('uvuId');
  const uvuIdLabel = document.getElementById('uvuIdLabel');
  const uvuIdDisplay = document.getElementById('uvuIdDisplay');
  const logsList = document.querySelector('[data-cy="logs"]');
  const addLogBtn = document.getElementById('addLogBtn');
  const newLogTextarea = document.getElementById('newLog');

  function getLogs() {
    const uvuId = uvuIdInput.value;
    const courseId = courseSelect.value;
    //if uvuId has 8 digits and a course is selected
    if (/^\d{8}$/.test(uvuId) && courseId) {
      fetch(
        //get a response object from the url
        `https://json-server-ft3qa5--3000.local.webcontainer.io/logs?courseId=${courseId}&uvuId=${uvuId}`
      )
        .then((response) => {
          //extract the json promise if the response doesn't throw errors
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to fetch logs');
        })
        .then((logs) => {
          //.then((logs) => extract the value array from the promise
          uvuIdDisplay.textContent = `Student Logs for ${uvuId}`;
          uvuIdDisplay.classList.remove('hidden');
          logsList.innerHTML = '';
          logs.forEach((log) => {
            const li = document.createElement('li');
            li.innerHTML = `<div><small>${log.date}</small></div><pre><p>${log.text}</p></pre>`;
            li.addEventListener('click', () => {
              li.querySelector('p').classList.toggle('hidden');
            });
            logsList.appendChild(li);
          });
          if (logs.length > 0 || newLogTextarea.value.trim()) {
            addLogBtn.disabled = false;
          }
        })
        .catch((error) => {
          console.error(error);
          uvuIdDisplay.textContent = 'Failed to load logs. Please try again.';
          logsList.innerHTML = '';
          addLogBtn.disabled = true;
        });
    } else {
      //Hide the log display
      uvuIdDisplay.classList.add('hidden');
      logsList.innerHTML = '';
      addLogBtn.disabled = true;
    }
  }

  // Fetch courses from the API and populate the course dropdown
  fetch('https://json-server-ft3qa5--3000.local.webcontainer.io/api/v1/courses')
    .then((response) => response.json())
    .then((courses) => {
      courses.forEach((course) => {
        const option = document.createElement('option');
        option.value = course.id;
        option.text = course.display;
        courseSelect.appendChild(option);
      });
    });

  // Event listener to show or hide UVU ID input based on course selection
  courseSelect.addEventListener('change', () => {
    const selectedCourse = courseSelect.value;
    //If a course was selected that wasn't the default
    if (selectedCourse) {
      uvuIdLabel.classList.remove('hidden');
      uvuIdInput.classList.remove('hidden');
    } else {
      uvuIdLabel.classList.add('hidden');
      uvuIdInput.classList.add('hidden');
      uvuIdInput.value = '';
      uvuIdDisplay.classList.add('hidden');
      logsList.innerHTML = '';
      addLogBtn.disabled = true;
    }
    getLogs();
  });

  //Validate UVU ID input and fetch logs
  uvuIdInput.addEventListener('blur', () => {
    getLogs();
  });

  // Enable or disable the Add Log button based on textarea content
  newLogTextarea.addEventListener('input', () => {
    if (newLogTextarea.value.trim()) {
      addLogBtn.disabled = false;
    } else if (logsList.children.length === 0) {
      addLogBtn.disabled = true;
    }
  });

  // Handle the submission of a new log
  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const newLog = newLogTextarea.value.trim();
    if (newLog) {
      fetch(`https://json-server-ft3qa5--3000.local.webcontainer.io/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseSelect.value,
          uvuId: uvuIdInput.value,
          text: newLog,
          date: new Date().toISOString(),
        }),
      })
        .then((response) => {
          if (response.ok) {
            const li = document.createElement('li');
            li.innerHTML = `<div><small>${new Date().toLocaleString()}</small></div><pre><p>${newLog}</p></pre>`;
            li.addEventListener('click', () => {
              li.querySelector('p').classList.toggle('hidden');
            });
            logsList.appendChild(li);
            newLogTextarea.value = '';
            addLogBtn.disabled = true;
          } else {
            throw new Error('Failed to add log');
          }
        })
        .catch((error) => {
          console.error(error);
          alert('Failed to add log. Please try again.');
        });
    }
  });
});
