const calendarEl = document.getElementById("calendar"); //the calendar grid
const monthYearEl = document.getElementById("monthYear");
const modalEl = document.getElementById("eventModal");
let currentDate = new Date();

// 📅 Generate Full Calendar View
function renderCalendar(date = new Date()) {
  calendarEl.innerHTML = "";//clear the div content before rendering new content

  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  //sets the day to "0", which JavaScript interprets as the last day of the previous month.
  const totalDays = new Date(year, month + 1, 0).getDate();//It calculates the number of days in a given month/gives you the last day of the month you're actually interested in.

  const firstDayOfMonth = new Date(year, month, 1).getDay();

  //display month and year header like July 2025
  monthYearEl.textContent = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }); //This line turns a Date like 2025-07-18 into: July 2025 --> <h2 id="month-year">July 2025</h2> it will be like this

  //set days of the week above the calendar grid
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekDays.forEach((day) => {
    const dayEl = document.createElement("div"); //create a <div> for each day 
    dayEl.className = "day-name";//set a class for this element
    dayEl.textContent = day;//set the day name from the array
    calendarEl.appendChild(dayEl);
  });


  //It tells you which day of the week the 1st of the month falls on ex: Sunday = 0, Monday = 1, Saturday = 6
  //So if the month starts on Wednesday, firstDayOfMonth = 3, and this loop will create 3 empty <div>s before rendering the first day — to align the days correctly under their weekdays.
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  //loop through days
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;//String(day).padStart(2, '0') turns 1 into '01', 9 into '09', etc.

    const cell = document.createElement("div");//it creates divs as much as the totalDays number
    cell.className = "day";

    if (
      day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) { //checks if the day is today
      cell.classList.add("today");//the div now has 2 classes: day and today (if it was today)
    }

    const dateEl = document.createElement("div");
    dateEl.className = "date-number";
    dateEl.textContent = day;
    cell.appendChild(dateEl);

    const eventsToday = events.filter((e) => e.date === dateStr);//Filters your list of events to get only those that match the current date being rendered in the loop.
    const eventBox = document.createElement("div");
    eventBox.className = "events";

    eventsToday.forEach((event) => {
      const ev = document.createElement("div");
      ev.className = "event";

      const courseEl = document.createElement("div");
      courseEl.className = "course";
      courseEl.textContent = event.title.split(" - ")[0];//is splitting the title string into two parts based on the separator " - " and returning the first part.

      const instructorEl = document.createElement("div");
      instructorEl.className = "instructor";
      instructorEl.textContent = event.title.split(" - ")[1]; //is splitting the title string into two parts based on the separator " - " and returning the second part.

      const timeEl = document.createElement("div");
      timeEl.className = "time";
      timeEl.textContent = `${event.start_time} - ${event.end_time}`;

      ev.appendChild(courseEl);
      ev.appendChild(instructorEl);
      ev.appendChild(timeEl);
      eventBox.appendChild(ev);
    });

    // Overlay Buttons
    const overlay = document.createElement("div");
    overlay.className = "day-overlay";

    const addBtn = document.createElement("button");
    addBtn.className = "overlay-btn";
    addBtn.textContent = "+ Add";
    addBtn.onclick = (e) => {
      e.stopPropagation(); //when clicking a button inside a popup shouldn’t close the popup
      openModalForAdd(dateStr);
    };
    overlay.appendChild(addBtn);

    if (eventsToday.length > 0) { //if there is an event already
      const editBtn = document.createElement("button");
      editBtn.className = "overlay-btn";
      editBtn.textContent = "✏️ Edit";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        openModalForEdit(eventsToday);
      };
      overlay.appendChild(editBtn);
    }

    cell.appendChild(overlay);
    cell.appendChild(eventBox);
    calendarEl.appendChild(cell);
  }
}

// Add Event Modal
function openModalForAdd(dateStr) {
  document.getElementById("formAction").value = "add";
  document.getElementById("eventId").value = "";
  document.getElementById("deleteEventId").value = "";
  document.getElementById("courseName").value = "";
  document.getElementById("instructorName").value = "";
  document.getElementById("startDate").value = dateStr;
  document.getElementById("endDate").value = dateStr;
  document.getElementById("startTime").value = "09:00";
  document.getElementById("endTime").value = "10:00";

  const selector = document.getElementById("eventSelector");
  const wrapper = document.getElementById("eventSelectorWrapper");
  if (selector && wrapper) {
    selector.innerHTML = ""; //bcz the dropdown doesn't appear when adding an event
    wrapper.style.display = "none";
  }

  modalEl.style.display = "flex";
}

// Edit Event Modal
function openModalForEdit(eventsOnDate) {
  document.getElementById("formAction").value = "edit";
  modalEl.style.display = "flex";

  const selector = document.getElementById("eventSelector");
  const wrapper = document.getElementById("eventSelectorWrapper");

  selector.innerHTML = "<option disabled selected>Choose event...</option>";

  eventsOnDate.forEach((e) => {
    const option = document.createElement("option");
    option.value = JSON.stringify(e);
    option.textContent = `${e.title} (${e.start} ➡️ ${e.end})`;
    selector.appendChild(option);
  });

  if (eventsOnDate.length > 1) {
    wrapper.style.display = "block";
  } else {
    wrapper.style.display = "none";
  }

  handleEventSelection(JSON.stringify(eventsOnDate[0]));
}

// Autofill the Form
function handleEventSelection(eventJSON) {
  const event = JSON.parse(eventJSON);

  document.getElementById("eventId").value = event.id;
  document.getElementById("deleteEventId").value = event.id;

  const [course, instructor] = event.title.split(" - ").map((e) => e.trim());

  document.getElementById("courseName").value = course || "";
  document.getElementById("instructorName").value = instructor || "";
  document.getElementById("startDate").value = event.start || "";
  document.getElementById("endDate").value = event.end || "";
  document.getElementById("startTime").value = event.start_time || "";
  document.getElementById("endTime").value = event.end_time || "";
}

// Close the Modal
function closeModal() {
  modalEl.style.display = "none";
}

// Navigate Between Months
function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

// Update the Clock
function updateClock() {
  const now = new Date();
  const clock = document.getElementById("clock");
  clock.textContent = [
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
  ].join(":");
}

// Run on Page Load
renderCalendar(currentDate);
updateClock();
setInterval(updateClock, 1000); //Calls the function updateClock every 1000 milliseconds (1 second) repeatedly.

 