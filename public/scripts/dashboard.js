document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login to view the dashboard.');
        window.location.href = '/loginweb';
        return;
    }

    document.querySelector('.nav-link.logout').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = '/loginweb';
    });

    // Handle bookings link click
    document.querySelector('.nav-link[href="#bookings"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.bookings-section').classList.remove('hidden');
        document.querySelector('.earnings-section').classList.add('hidden');
        displayBookings(currentUser.email);
    });

    // Handle earnings link click
    document.querySelector('.nav-link[href="#earnings"]').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.bookings-section').classList.add('hidden');
        document.querySelector('.earnings-section').classList.remove('hidden');
        displayEarnings(currentUser.email);
    });

    // Fetch and display listings from backend API
    let hostListings = [];
    try {
        const response = await fetch('/api/listings');
        const result = await response.json();
        if (result.status === 'success') {
            hostListings = result.data.listings.filter(listing => listing.email === currentUser.email);
        }
    } catch (e) {
        console.error('Failed to fetch listings', e);
        showAlert('Failed to load listings. Please try again later.', 'error');
    }
    displayListings(hostListings);

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredListings = hostListings.filter(listing =>
            listing.title.toLowerCase().includes(searchTerm) ||
            listing.location.toLowerCase().includes(searchTerm)
        );
        displayListings(filteredListings);
    });

    // Function to show alerts
    function showAlert(message, type) {
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        document.querySelector(".profile-container").insertBefore(
            alertDiv,
            document.querySelector(".profile-container").firstChild
        );
        setTimeout(() => alertDiv.remove(), 3000);
    }

    // Handle update and delete actions (event delegation)
    document.getElementById('listings-container').addEventListener('click', async (event) => {
        const target = event.target;
        const listingId = target.getAttribute('data-id');
        
        if (target.classList.contains('update-listing-btn')) {
            window.location.href = `/host_index?listingId=${listingId}`;
        }
        
        if (target.classList.contains('delete-listing-btn')) {
            if (confirm('Are you sure you want to delete this listing?')) {
                try {
                    const response = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (result.status === 'success') {
                        showAlert('Listing deleted successfully!', 'success');
                        target.closest('.listing-card').remove();
                        hostListings = hostListings.filter(listing => listing._id !== listingId);
                    } else {
                        showAlert(result.message || 'Failed to delete listing.', 'error');
                    }
                } catch (e) {
                    showAlert('Failed to delete listing.', 'error');
                }
            }
        }
        
    });

    // Function to display bookings
    async function displayBookings(hostEmail) {
        try {
            const response = await fetch(`/api/bookings/host/${hostEmail}`);
            const result = await response.json();
            if (result.status === 'success') {
                const bookings = result.data.bookings;
                const monthlyBookings = processMonthlyBookings(bookings);
                renderBookingsChart(monthlyBookings);
                displayMonthlyBookingsList(monthlyBookings);
            } else {
                showAlert('Failed to load bookings.', 'error');
            }
        } catch (e) {
            console.error('Error fetching bookings:', e);
            showAlert('Failed to load bookings.', 'error');
        }
    }

    // Function to display earnings
    async function displayEarnings(hostEmail) {
        try {
            const response = await fetch(`/api/bookings/host/${hostEmail}`);
            const result = await response.json();
            if (result.status === 'success') {
                const bookings = result.data.bookings;
                const monthlyEarnings = processMonthlyEarnings(bookings);
                renderEarningsChart(monthlyEarnings);
                displayMonthlyEarningsList(monthlyEarnings);
            } else {
                showAlert('Failed to load earnings.', 'error');
            }
        } catch (e) {
            console.error('Error fetching earnings:', e);
            showAlert('Failed to load earnings.', 'error');
        }
    }

    // Process bookings by month
    function processMonthlyBookings(bookings) {
        const monthlyCounts = {};
        bookings.forEach(booking => {
            const date = new Date(booking.checkIn);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
        });
        return monthlyCounts;
    }

    // Process earnings by month
    function processMonthlyEarnings(bookings) {
        const monthlyEarnings = {};
        bookings.forEach(booking => {
            const date = new Date(booking.checkIn);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthlyEarnings[monthYear] = (monthlyEarnings[monthYear] || 0) + booking.amount;
        });
        return monthlyEarnings;
    }

    // Render bookings chart
    function renderBookingsChart(monthlyBookings) {
        const ctx = document.getElementById('bookingsChart').getContext('2d');
        const labels = Object.keys(monthlyBookings).sort();
        const data = labels.map(label => monthlyBookings[label]);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(label => {
                    const [year, month] = label.split('-');
                    return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: 'Bookings per Month',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Bookings'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }

    // Render earnings chart
    function renderEarningsChart(monthlyEarnings) {
        const ctx = document.getElementById('earningsChart').getContext('2d');
        const labels = Object.keys(monthlyEarnings).sort();
        const data = labels.map(label => monthlyEarnings[label]);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(label => {
                    const [year, month] = label.split('-');
                    return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: 'Earnings per Month',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Earnings (₹)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }

    // Display monthly bookings list
    function displayMonthlyBookingsList(monthlyBookings) {
        const list = document.getElementById('monthly-bookings-list');
        list.innerHTML = '';
        Object.entries(monthlyBookings).sort().forEach(([monthYear, count]) => {
            const [year, month] = monthYear.split('-');
            const date = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            const li = document.createElement('li');
            li.textContent = `${date}: ${count} booking${count > 1 ? 's' : ''}`;
            list.appendChild(li);
        });
    }

    // Display monthly earnings list
    function displayMonthlyEarningsList(monthlyEarnings) {
        const list = document.getElementById('monthly-earnings-list');
        list.innerHTML = '';
        Object.entries(monthlyEarnings).sort().forEach(([monthYear, amount]) => {
            const [year, month] = monthYear.split('-');
            const date = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            const li = document.createElement('li');
            li.textContent = `${date}: ₹${amount.toFixed(2)}`;
            list.appendChild(li);
        });
    }

    // Generate comprehensive suggestions for a listing
    function generateSuggestions(listing) {
        const suggestions = [];
        
        // Image suggestions
        if (!listing.images || listing.images.length === 0) {
            suggestions.push({
                type: 'images',
                priority: 'high',
                icon: 'fas fa-images',
                title: 'Add Images',
                message: 'No images found. Add at least 5 high-quality photos to increase bookings by 40%.',
                action: 'Add photos of bedrooms, kitchen, bathroom, and exterior'
            });
        } else if (listing.images.length < 3) {
            suggestions.push({
                type: 'images',
                priority: 'high',
                icon: 'fas fa-images',
                title: 'More Images Needed',
                message: `Only ${listing.images.length} image(s) uploaded. Add more photos to showcase your space better.`,
                action: 'Add photos of different rooms and angles'
            });
        } else if (listing.images.length < 5) {
            suggestions.push({
                type: 'images',
                priority: 'medium',
                icon: 'fas fa-images',
                title: 'Enhance Image Gallery',
                message: `${listing.images.length} images uploaded. Consider adding more to showcase all amenities.`,
                action: 'Add photos of amenities, neighborhood, and unique features'
            });
        }

        // Amenities suggestions
        const amenities = listing.amenities || [];
        const essentialAmenities = ['Wi-Fi', 'Parking', 'Kitchen', 'Air Conditioning', 'Heating'];
        const missingEssential = essentialAmenities.filter(amenity => 
            !amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        );
        
        if (amenities.length === 0) {
            suggestions.push({
                type: 'amenities',
                priority: 'high',
                icon: 'fas fa-star',
                title: 'Add Amenities',
                message: 'No amenities listed. Essential amenities can increase bookings significantly.',
                action: 'Add Wi-Fi, parking, kitchen access, and other facilities'
            });
        } else if (amenities.length < 3) {
            suggestions.push({
                type: 'amenities',
                priority: 'high',
                icon: 'fas fa-star',
                title: 'More Amenities Needed',
                message: `Only ${amenities.length} amenit${amenities.length === 1 ? 'y' : 'ies'} listed. Add more to attract guests.`,
                action: 'Consider adding Wi-Fi, parking, kitchen, and other facilities'
            });
        } else if (missingEssential.length > 0) {
            suggestions.push({
                type: 'amenities',
                priority: 'medium',
                icon: 'fas fa-star',
                title: 'Missing Essential Amenities',
                message: `Consider adding: ${missingEssential.join(', ')}`,
                action: 'Add these popular amenities to increase appeal'
            });
        }

        // Description suggestions
        const description = listing.description || '';
        if (!description || description.length < 50) {
            suggestions.push({
                type: 'description',
                priority: 'high',
                icon: 'fas fa-align-left',
                title: 'Improve Description',
                message: 'Description is too short or missing. Detailed descriptions increase booking rates.',
                action: 'Write 100+ characters describing the space, location, and unique features'
            });
        } else if (description.length < 150) {
            suggestions.push({
                type: 'description',
                priority: 'medium',
                icon: 'fas fa-align-left',
                title: 'Enhance Description',
                message: 'Description could be more detailed. Include neighborhood info and unique selling points.',
                action: 'Add details about location, nearby attractions, and what makes your place special'
            });
        }

        // Pricing suggestions
        const price = parseFloat(listing.price) || 0;
        if (price === 0) {
            suggestions.push({
                type: 'pricing',
                priority: 'high',
                icon: 'fas fa-rupee-sign',
                title: 'Set Competitive Price',
                message: 'No price set. Research similar listings in your area to set an attractive rate.',
                action: 'Check competitor prices and set a competitive rate'
            });
        } else if (price < 300) {
            suggestions.push({
                type: 'pricing',
                priority: 'medium',
                icon: 'fas fa-rupee-sign',
                title: 'Consider Price Increase',
                message: `Price ₹${price} might be too low. You could potentially earn more.`,
                action: 'Research market rates and consider increasing your price'
            });
        } else if (price > 5000) {
            suggestions.push({
                type: 'pricing',
                priority: 'medium',
                icon: 'fas fa-rupee-sign',
                title: 'Price Optimization',
                message: `Price ₹${price} might be too high. Consider reducing to attract more bookings.`,
                action: 'Lower your price or add value to justify the higher rate'
            });
        }

        // Discount suggestions
        if (!listing.discount || listing.discount === 0) {
            suggestions.push({
                type: 'discount',
                priority: 'low',
                icon: 'fas fa-percentage',
                title: 'Offer Discounts',
                message: 'No discounts offered. Consider weekly or monthly discounts to attract longer stays.',
                action: 'Add 10-20% discount for stays longer than 7 days'
            });
        }

        // Reviews suggestions
        if (!listing.reviews || listing.reviews.length === 0) {
            suggestions.push({
                type: 'reviews',
                priority: 'medium',
                icon: 'fas fa-comments',
                title: 'Encourage Reviews',
                message: 'No reviews yet. Reviews build trust and increase booking confidence.',
                action: 'Ask guests to leave reviews after their stay'
            });
        }

        // Location suggestions
        if (!listing.coordinates || !listing.coordinates.lat || !listing.coordinates.lng) {
            suggestions.push({
                type: 'location',
                priority: 'high',
                icon: 'fas fa-map-marker-alt',
                title: 'Add Precise Location',
                message: 'Exact coordinates missing. Precise location helps guests find your place easily.',
                action: 'Add accurate GPS coordinates for better visibility'
            });
        }

        // Capacity suggestions
        const capacity = parseInt(listing.capacity) || 0;
        if (capacity === 0) {
            suggestions.push({
                type: 'capacity',
                priority: 'high',
                icon: 'fas fa-users',
                title: 'Set Guest Capacity',
                message: 'Guest capacity not specified. This is essential information for guests.',
                action: 'Specify how many guests your space can accommodate'
            });
        }

        // Property type suggestions
        if (!listing.propertyType) {
            suggestions.push({
                type: 'property',
                priority: 'medium',
                icon: 'fas fa-home',
                title: 'Specify Property Type',
                message: 'Property type not specified. Help guests understand what type of space you offer.',
                action: 'Choose from apartment, house, room, etc.'
            });
        }

        // Room details suggestions
        if (!listing.bedrooms || !listing.beds) {
            suggestions.push({
                type: 'rooms',
                priority: 'medium',
                icon: 'fas fa-bed',
                title: 'Add Room Details',
                message: 'Bedroom and bed information missing. Guests need this to plan their stay.',
                action: 'Specify number of bedrooms and beds available'
            });
        }

        // Food facility suggestions
        if (!listing.foodFacility) {
            suggestions.push({
                type: 'food',
                priority: 'low',
                icon: 'fas fa-utensils',
                title: 'Specify Food Options',
                message: 'Food facility information missing. This helps guests plan their meals.',
                action: 'Specify if you provide meals, kitchen access, or nearby restaurants'
            });
        }

        // Host gender suggestions
        if (!listing.hostGender) {
            suggestions.push({
                type: 'host',
                priority: 'low',
                icon: 'fas fa-user',
                title: 'Add Host Information',
                message: 'Host gender not specified. Some guests prefer this information.',
                action: 'Add your gender preference for better guest matching'
            });
        }

        // Booking availability suggestions
        if (!listing.booking) {
            suggestions.push({
                type: 'booking',
                priority: 'high',
                icon: 'fas fa-calendar-check',
                title: 'Enable Booking',
                message: 'Booking is disabled. Enable booking to start receiving reservations.',
                action: 'Turn on booking availability to accept guests'
            });
        }

        // Sort suggestions by priority
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

        return suggestions;
    }

    // Display listings with enhanced suggestions
    function displayListings(listings) {
        const listingsContainer = document.getElementById('listings-container');
        if (!listingsContainer) {
            console.error("Listings container not found!");
            return;
        }
        if (listings.length === 0) {
            listingsContainer.innerHTML = "No listings found. Create your first listing!";
            return;
        }
        listingsContainer.innerHTML = listings.map(listing => {
            const suggestions = generateSuggestions(listing);
            const suggestionsHtml = suggestions.length > 0 ? `
                <div class="suggestions-simple">
                    <strong>Suggestions:</strong>
                    <ul>
                        ${suggestions.map(suggestion => `<li>${suggestion.message}</li>`).join('')}
                    </ul>
                </div>
            ` : `
                <div class="suggestions-simple success">
                    <strong>Suggestions:</strong> Your listing looks great!
                </div>
            `;

            return `
                <div class="listing-card" data-id="${listing._id}" data-title="${listing.title.toLowerCase()}" data-location="${listing.location.toLowerCase()}">
                    <div class="listing-header">
                        <h4>${listing.title}</h4>
                        <div class="listing-status ${listing.status}">${listing.status}</div>
                    </div>
                    
                    <div class="listing-details">
                        <p><strong>Description:</strong> ${listing.description}</p>
                        <p><strong>Price:</strong> ₹${listing.price}</p>
                        <p><strong>Location:</strong> ${listing.location}</p>
                        <p><strong>Coordinates:</strong> (${listing.coordinates && listing.coordinates.lat ? listing.coordinates.lat : ''}, ${listing.coordinates && listing.coordinates.lng ? listing.coordinates.lng : ''})</p>
                        <p><strong>Max Days Allowed:</strong> ${listing.maxdays}</p>
                        <p><strong>Property Type:</strong> ${listing.propertyType}</p>
                        <p><strong>Capacity:</strong> ${listing.capacity}</p>
                        <p><strong>Room Type:</strong> ${listing.roomType}</p>
                        <p><strong>Bedrooms:</strong> ${listing.bedrooms}</p>
                        <p><strong>Beds:</strong> ${listing.beds}</p>
                        <p><strong>Room Size:</strong> ${listing.roomSize}</p>
                        <p><strong>Room Location:</strong> ${listing.roomLocation || ''}</p>
                        <p><strong>Transport Distance:</strong> ${listing.transportDistance || ''}</p>
                        <p><strong>Host Gender:</strong> ${listing.hostGender || ''}</p>
                        <p><strong>Food Facility:</strong> ${listing.foodFacility || ''}</p>
                        <p><strong>Amenities:</strong> ${listing.amenities && listing.amenities.length ? listing.amenities.join(', ') : ''}</p>
                        <p><strong>Discount:</strong> ${listing.discount || ''}</p>
                        <p><strong>Likes:</strong> ${listing.likes}</p>
                        <p><strong>Status:</strong> ${listing.status}</p>
                        <p><strong>Booking Available:</strong> ${listing.booking ? 'Yes' : 'No'}</p>
                        <p><strong>Reviews:</strong> ${listing.reviews && listing.reviews.length ? listing.reviews.join(', ') : ''}</p>
                        <p><strong>Created At:</strong> ${listing.createdAt ? new Date(listing.createdAt).toLocaleString() : ''}</p>
                    </div>
                    
                    ${suggestionsHtml}
                    
                    ${listing.images && listing.images.length > 0 ? `
                        <div class="images-container">
                            <strong>Images:</strong>
                            <div class="image-gallery">
                                ${listing.images.map(imgId => `<img src="/api/images/${imgId}" alt="Listing Image" class="listing-image" />`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="listing-actions">
                        <button class="update-listing-btn" data-id="${listing._id}">Update</button>
                        <button class="delete-listing-btn" data-id="${listing._id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }
});