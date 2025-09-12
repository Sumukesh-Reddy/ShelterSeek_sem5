document.addEventListener("DOMContentLoaded", async function () {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("Please log in to view your profile.");
        window.location.href = "/loginweb";
        return;
    }
    
    // Function to get proper image URL
    function getProfilePhotoUrl(profilePhoto) {
        if (!profilePhoto) return "public/images/sai.jpg";
        
        // If it's already a full URL, return it as is
        if (profilePhoto.startsWith('/api/images/') || profilePhoto.startsWith('/public/') || profilePhoto.startsWith('http')) {
            return profilePhoto;
        }
        
        // If it's just an ID, construct the proper URL
        if (profilePhoto.length === 24) { // MongoDB ObjectId length
            return `/api/images/${profilePhoto}`;
        }
        
        // Default fallback
        return "public/images/sai.jpg";
    }

    // Fetch updated user data from server
    async function fetchUserData() {
        try {
            const response = await fetch(`/api/users?email=${encodeURIComponent(currentUser.email)}&accountType=${currentUser.accountType}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === "success") {
                const user = result.data.travelers[0] || result.data.hosts[0];
                if (user) {
                    // Update sessionStorage with latest data
                    const updatedUser = {
                        ...currentUser,
                        name: user.name,
                        email: user.email,
                        accountType: user.accountType,
                        profilePhoto: user.profilePhoto
                    };
                    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
                    return updatedUser;
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Fall back to existing sessionStorage data
            return currentUser;
        }
    }

    // Get updated user data
    const updatedUser = await fetchUserData();
    
    // Populate profile data
    document.getElementById("profile-name").textContent = updatedUser.name;
    document.getElementById("profile-email").textContent = updatedUser.email;
    document.getElementById("profile-account-type").textContent = updatedUser.accountType;
    
    // Set profile picture
    const profilePicElement = document.getElementById("profile-pic");
    if (profilePicElement && updatedUser.profilePhoto) {
        profilePicElement.src = getProfilePhotoUrl(updatedUser.profilePhoto);
        
        // Add error handling for image loading
        profilePicElement.onerror = function() {
            console.error("Failed to load profile photo:", this.src);
            this.src = "public/images/sai.jpg";
        };
    }

    // Activity button handler
    document.getElementById("activity").addEventListener("click", () => {
        if (updatedUser.accountType === "host") {
            window.location.href = '/dashboard';
        }
        if (updatedUser.accountType === "traveller") {
            window.location.href = '/history';
        }
    });
    
    // Set login/logout button
    const loginLogoutButton = document.getElementById("login-logout-text");
    if (loginLogoutButton) {
        loginLogoutButton.textContent = "Logout";
    }

    // Handle logout
    if (loginLogoutButton) {
        loginLogoutButton.addEventListener("click", function () {
            sessionStorage.removeItem("currentUser");
            window.location.href = "/";
        });
    }

    // Handle profile picture change
    const changeProfilePicButton = document.getElementById("change-profile-pic");
    if (changeProfilePicButton) {
        const profilePicInput = document.createElement("input");
        profilePicInput.type = "file";
        profilePicInput.accept = "image/*";
        profilePicInput.style.display = "none";
        
        changeProfilePicButton.addEventListener("click", function () {
            profilePicInput.click();
        });

        profilePicInput.addEventListener("change", async function (e) {
            const file = e.target.files[0];
            if (file) {
                try {
                    // Upload image to server
                    const formData = new FormData();
                    formData.append("image", file);

                    const uploadResponse = await fetch("/api/images", {
                        method: "POST",
                        body: formData,
                        credentials: "include",
                    });
                    
                    const uploadResult = await uploadResponse.json();
                    
                    if (uploadResult.status !== "success") {
                        throw new Error(uploadResult.message || "Failed to upload image");
                    }
                    
                    // Update user profile with new photo ID
                    const updateResponse = await fetch("/api/update-profile-photo", {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: updatedUser.email,
                            accountType: updatedUser.accountType,
                            profilePhoto: uploadResult.data.id,
                        }),
                        credentials: "include",
                    });
                    
                    const updateResult = await updateResponse.json();
                    
                    if (updateResult.status === "success") {
                        // Update the profile picture display
                        const newProfilePhotoUrl = `/api/images/${uploadResult.data.id}`;
                        profilePicElement.src = newProfilePhotoUrl;
                        
                        // Update sessionStorage
                        const newUserData = {
                            ...updatedUser,
                            profilePhoto: newProfilePhotoUrl
                        };
                        sessionStorage.setItem("currentUser", JSON.stringify(newUserData));
                        
                        showAlert("Profile picture updated successfully!", "success");
                    } else {
                        throw new Error(updateResult.message || "Failed to update profile photo");
                    }
                } catch (error) {
                    console.error('Error updating profile picture:', error);
                    showAlert(error.message || "Failed to update profile picture", "error");
                }
            }
        });
    }

    // Handle password change
    const changePasswordForm = document.getElementById("change-password-form");
    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById("current-password").value;
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;
            
            // Client-side validation
            if (newPassword !== confirmPassword) {
                showAlert("New passwords don't match!", "error");
                return;
            }
            
            if (newPassword.length < 8) {
                showAlert("Password must be at least 8 characters long!", "error");
                return;
            }
            
            try {
                const response = await fetch('/api/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: updatedUser.email,
                        currentPassword,
                        newPassword,
                        accountType: updatedUser.accountType
                    }),
                    credentials: 'include'
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to change password');
                }
                
                showAlert("Password changed successfully!", "success");
                changePasswordForm.reset();
            } catch (error) {
                console.error('Password change error:', error);
                showAlert(error.message || "Failed to change password. Please try again.", "error");
            }
        });
    }

    function showAlert(message, type) {
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector(".profile-container");
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            setTimeout(() => alertDiv.remove(), 3000);
        }
    }
});