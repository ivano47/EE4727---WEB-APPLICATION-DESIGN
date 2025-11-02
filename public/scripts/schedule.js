// Schedule page - Time slot selection and confirmation (accidental booking prevention -_-)
//declare initial variables
let selectedSlot = null;
let selectedDateTime = null;
let selectedDoctorId = null;

function selectTimeSlot(button, datetime, doctorId, displayTime) {
    // reset form
    const allButtons = document.querySelectorAll('.time-button:not(.booked)');
    allButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    
    selectedSlot = button;
    selectedDateTime = datetime;
    selectedDoctorId = doctorId;
    
    // Show confirmation section
    showConfirmation(displayTime, datetime);
}

function showConfirmation(displayTime, datetime) {
    let confirmSection = document.getElementById('booking-confirmation');
    
    if (!confirmSection) {
        confirmSection = document.createElement('div');
        confirmSection.id = 'booking-confirmation';
        confirmSection.className = 'booking-confirmation';
        
        const timeslotContainer = document.querySelector('.timeslot-container');
        timeslotContainer.appendChild(confirmSection);
    }
    const date = new Date(datetime);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Update confirmation content
    confirmSection.innerHTML = `
        <h4>Confirm Your Appointment</h4>
        <div class="booking-details">
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${displayTime}</p>
        </div>
        <form action="../includes/book.php" method="POST" style="margin: 0;">
            <input type="hidden" name="doctor_id" value="${selectedDoctorId}">
            <input type="hidden" name="appointment_time" value="${datetime}">
            <button type="submit" class="confirm-button">Confirm Booking</button>
            <button type="button" class="cancel-selection-button" onclick="cancelSelection()">Cancel</button>
        </form>
    `;
    
    confirmSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cancelSelection() {
    if (selectedSlot) {
        selectedSlot.classList.remove('selected');
    }
    
    const confirmSection = document.getElementById('booking-confirmation');
    if (confirmSection) {
        confirmSection.remove();
    }
    
    // reset form back to emptiness
    selectedSlot = null;
    selectedDateTime = null;
    selectedDoctorId = null;
}
