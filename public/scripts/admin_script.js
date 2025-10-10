class DashboardManager {
    constructor() {
        this.state = {
            bookings: [],
            newCustomers: [],
            recentActivities: []
        };

        this.elements = {
            bookingsTableBody: document.getElementById("bookingsTableBody"),
            guestsTableBody: document.getElementById("guestsTableBody"),
            newCustomersList: document.getElementById("newCustomersList"),
            activitiesList: document.getElementById("activitiesList"),
            errorBox: document.getElementById("errorBox")
        };

        this.init();
    }

    // ✅ Reusable XHR helper
    xhrRequest(method, url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        callback(null, response);
                    } catch (err) {
                        callback(err, null);
                    }
                } else {
                    callback(new Error(`Request failed: ${xhr.status}`), null);
                }
            }
        };
        xhr.send();
    }

    // ✅ Fetch bookings via XHR
    fetchBookings() {
        return new Promise((resolve) => {
            this.xhrRequest("GET", "/api/bookings", (err, response) => {
                if (err) {
                    console.error("Error fetching bookings:", err.message);
                    resolve([]);
                } else {
                    resolve(response.data || []); // expects { data: [...] }
                }
            });
        });
    }

    // ✅ Fetch new customers via XHR
    fetchNewCustomers() {
        this.xhrRequest("GET", "/api/new-customers", (err, response) => {
            if (err) {
                console.error("Error fetching new customers:", err.message);
                this.showError("Failed to load new customers.");
            } else {
                this.state.newCustomers = response.data || [];
                this.renderNewCustomers();
            }
        });
    }

    // ✅ Fetch recent activities via XHR
    fetchRecentActivities() {
        this.xhrRequest("GET", "/api/recent-activities", (err, response) => {
            if (err) {
                console.error("Error fetching recent activities:", err.message);
                this.showError("Failed to load recent activities.");
            } else {
                this.state.recentActivities = response.data || [];
                this.renderRecentActivities();
            }
        });
    }

    // ✅ Render bookings
    async renderBookings() {
        this.state.bookings = await this.fetchBookings();

        if (!this.elements.bookingsTableBody) return;
        this.elements.bookingsTableBody.innerHTML = "";

        this.state.bookings.forEach((booking) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${booking.bookingId}</td>
                <td>${booking.guestName}</td>
                <td>${booking.checkIn}</td>
                <td>${booking.checkOut}</td>
                <td>${booking.amount}</td>
                <td>${booking.userEmail}</td>
            `;
            this.elements.bookingsTableBody.appendChild(row);
        });
    }

    // ✅ Render guests (your provided code)
    renderGuests(guests) {
        if (!this.elements.guestsTableBody) return;
        this.elements.guestsTableBody.innerHTML = "";
        guests.forEach((guest) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${guest.id}</td>
                <td>${guest.name}</td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td class="actions">
                    <button class="edit" data-id="${guest.id}">Edit</button>
                    <button class="delete" data-id="${guest.id}">Delete</button>
                </td>
            `;
            this.elements.guestsTableBody.appendChild(row);
        });
        this.addTableEventListeners();
    }

    // ✅ Render new customers
    renderNewCustomers() {
        if (!this.elements.newCustomersList) return;
        this.elements.newCustomersList.innerHTML = "";

        this.state.newCustomers.forEach((customer) => {
            const li = document.createElement("li");
            li.textContent = `${customer.name} (${customer.email})`;
            this.elements.newCustomersList.appendChild(li);
        });
    }

    // ✅ Render recent activities
    renderRecentActivities() {
        if (!this.elements.activitiesList) return;
        this.elements.activitiesList.innerHTML = "";

        this.state.recentActivities.forEach((activity) => {
            const li = document.createElement("li");
            li.textContent = `${activity.description} at ${activity.time}`;
            this.elements.activitiesList.appendChild(li);
        });
    }

    // ✅ Error display
    showError(message) {
        if (!this.elements.errorBox) return;
        this.elements.errorBox.textContent = message;
        this.elements.errorBox.style.display = "block";
    }

    // ✅ Add table listeners (edit/delete for guests)
    addTableEventListeners() {
        document.querySelectorAll(".edit").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                alert("Edit guest: " + id);
            });
        });

        document.querySelectorAll(".delete").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                alert("Delete guest: " + id);
            });
        });
    }

    // ✅ Init dashboard
    init() {
        this.renderBookings();
        this.fetchNewCustomers();
        this.fetchRecentActivities();
    }
}

// Boot up
document.addEventListener("DOMContentLoaded", () => {
    new DashboardManager();
});
