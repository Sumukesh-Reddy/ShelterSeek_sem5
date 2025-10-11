document.addEventListener('DOMContentLoaded', () => {
    // Admin data (local)
    const admin_data = [
        {
            name: 'Admin1',
            email: 'admin1@ShelterSeek.com',
            password: 'admin123',
            accountType: 'admin',
            isAdmin: true,
            createdAt: new Date().toISOString()
        },
        {
            name: 'Admin2',
            email: 'admin2@ShelterSeek.com',
            password: 'admin123',
            accountType: 'admin',
            isAdmin: true,
            createdAt: new Date().toISOString()
        },
        {
            name: 'Admin3',
            email: 'admin3@ShelterSeek.com',
            password: 'admin123',
            accountType: 'admin',
            isAdmin: true,
            createdAt: new Date().toISOString()
        }
    ];

    // Get DOM elements
    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    const loginOptions = document.getElementById('loginOptions');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBackButton = document.getElementById('loginBackButton');
    const goToRegister = document.getElementById('goToRegister');
    const goToLogin = document.getElementById('goToLogin');
    const heroTitle = document.getElementById('heroTitle');
    const profilePhotoInput = document.getElementById('registerProfilePhoto');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    let selectedType = null;

    // Profile photo preview handler
    if (profilePhotoInput && profilePhotoPreview) {
        profilePhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePhotoPreview.src = e.target.result;
                    profilePhotoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                profilePhotoPreview.src = '';
                profilePhotoPreview.style.display = 'none';
            }
        });
    }

    // Add click handlers to login type buttons
    document.querySelectorAll('.login-button').forEach(button => {
        button.addEventListener('click', () => {
            selectedType = button.dataset.type;
            loginOptions.style.display = 'none';
            loginForm.classList.add('active');
            
            const titles = {
                traveller: 'Welcome Back, Traveler',
                host: 'Welcome Back, Host',
                admin: 'Admin Portal'
            };
            heroTitle.textContent = titles[selectedType] || 'Welcome Back';
        });
    });

    // Add back button handler
    loginBackButton.addEventListener('click', () => {
        loginOptions.style.display = 'flex';
        loginForm.classList.remove('active');
        selectedType = null;
        heroTitle.textContent = 'Welcome to ShelterSeek';
    });

    // Handle admin login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Basic validation
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            // Handle admin login separately
            if (selectedType === 'admin') {
                const admin = admin_data.find(a => a.email === email && a.password === password);
                if (!admin) throw new Error('Invalid admin credentials');
                
                sessionStorage.setItem('currentUser', JSON.stringify({
                    name: admin.name,
                    email: admin.email,
                    accountType: 'admin',
                    isAdmin: true
                }));
                window.location.href = '/admin_index';
                return;
            }

            // Handle regular user login
            const response = await fetch('/loginweb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: "signIn", 
                    email, 
                    password,
                    accountType: selectedType 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (!data.data?.user) {
                throw new Error('Invalid server response');
            }

            const user = data.data.user;
            sessionStorage.setItem('currentUser', JSON.stringify({
                name: user.name,
                email: user.email,
                accountType: user.accountType,
                isAdmin: false,
                profilePhoto: user.profilePhoto
            }));

            // Redirect based on account type
            window.location.href = user.accountType === 'host' ? '/host_index' : '/';
            
        } catch (err) {
            alert(err.message);
            console.error('Login error:', err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });

    // Handle registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const accountType = document.querySelector('input[name="accountType"]:checked')?.value;
        const profilePhoto = document.getElementById('registerProfilePhoto').files[0];
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Validation
        if (!name || !email || !password || !confirmPassword || !accountType) {
            alert('Please fill all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        try {
            const formData = new FormData();
            formData.append('type', 'signUp');
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('accountType', accountType);
            if (profilePhoto) {
                formData.append('profilePhoto', profilePhoto);
            }

            const response = await fetch('/loginweb', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            alert('Registration successful! Please login');
            registerForm.reset();
            profilePhotoPreview.src = '';
            profilePhotoPreview.style.display = 'none';
            goToLogin.click();
        } catch (err) {
            alert(err.message);
            console.error('Registration error:', err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });

    // Navigation between login and register pages
    goToRegister.addEventListener('click', () => {
        loginPage.classList.add('hidden');
        registerPage.classList.remove('hidden');
        heroTitle.textContent = 'Join ShelterSeek';
        loginForm.classList.remove('active');
        loginOptions.style.display = 'flex';
        selectedType = null;
    });

    goToLogin.addEventListener('click', () => {
        registerPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
        heroTitle.textContent = 'Welcome to ShelterSeek';
        registerForm.reset();
        profilePhotoPreview.src = '';
        profilePhotoPreview.style.display = 'none';
    });

    // Forgot Password Functionality
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    
    const forgotPasswordStep1 = document.getElementById('forgotPasswordStep1');
    const forgotPasswordStep2 = document.getElementById('forgotPasswordStep2');
    const forgotPasswordStep3 = document.getElementById('forgotPasswordStep3');
    
    const forgotEmail = document.getElementById('forgotEmail');
    const otpCode = document.getElementById('otpCode');
    const newPassword = document.getElementById('newPassword');
    const confirmNewPassword = document.getElementById('confirmNewPassword');

    let currentStep = 1;
    let userEmail = '';
    let generatedOtp = '';

    // Ensure modal starts hidden and reset form
    forgotPasswordModal.classList.add('hidden');
    resetForgotPasswordForm();
    console.log('Page loaded - Modal should be hidden:', forgotPasswordModal.classList.contains('hidden'));

    // Open forgot password modal
    forgotPasswordBtn.addEventListener('click', () => {
        console.log('Forgot password button clicked');
        forgotPasswordModal.classList.remove('hidden');
        resetForgotPasswordForm();
    });

    // Close forgot password modal
    closeForgotPasswordModal.addEventListener('click', () => {
        forgotPasswordModal.classList.add('hidden');
        resetForgotPasswordForm();
    });

    // Close modal when clicking outside
    forgotPasswordModal.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.classList.add('hidden');
            resetForgotPasswordForm();
        }
    });

    // Reset forgot password form
    function resetForgotPasswordForm() {
        currentStep = 1;
        userEmail = '';
        generatedOtp = '';
        forgotEmail.value = '';
        otpCode.value = '';
        newPassword.value = '';
        confirmNewPassword.value = '';
        
        forgotPasswordStep1.classList.remove('hidden');
        forgotPasswordStep2.classList.add('hidden');
        forgotPasswordStep3.classList.add('hidden');
        
        removeMessages();
    }

    // Remove any existing messages
    function removeMessages() {
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
    }

    // Show message
    function showMessage(text, type = 'info') {
        removeMessages();
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        
        const currentStepDiv = document.querySelector('.forgot-password-step:not(.hidden)');
        currentStepDiv.insertBefore(messageDiv, currentStepDiv.firstChild);
    }

    // Send OTP
    sendOtpBtn.addEventListener('click', async () => {
        const email = forgotEmail.value.trim();
        
        if (!email) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        if (!email.includes('@')) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        try {
            sendOtpBtn.disabled = true;
            sendOtpBtn.textContent = 'Sending...';

            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, accountType: selectedType || 'traveller' })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send verification code');
            }

            userEmail = email;
            generatedOtp = data.otp;
            currentStep = 2;
            
            forgotPasswordStep1.classList.add('hidden');
            forgotPasswordStep2.classList.remove('hidden');
            
            showMessage('Verification code sent! Check your terminal for the OTP.', 'success');

        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = 'Send Verification Code';
        }
    });

    // Verify OTP
    verifyOtpBtn.addEventListener('click', async () => {
        const enteredOtp = otpCode.value.trim();
        
        if (!enteredOtp) {
            showMessage('Please enter the verification code', 'error');
            return;
        }

        if (enteredOtp.length !== 6) {
            showMessage('Please enter a valid 6-digit code', 'error');
            return;
        }

        try {
            verifyOtpBtn.disabled = true;
            verifyOtpBtn.textContent = 'Verifying...';

            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, otp: enteredOtp })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid verification code');
            }

            currentStep = 3;
            forgotPasswordStep2.classList.add('hidden');
            forgotPasswordStep3.classList.remove('hidden');
            
            showMessage('Code verified! Please enter your new password.', 'success');

        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = 'Verify Code';
        }
    });

    // Resend OTP
    resendOtpBtn.addEventListener('click', async () => {
        try {
            resendOtpBtn.disabled = true;
            resendOtpBtn.textContent = 'Resending...';

            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, accountType: selectedType || 'traveller' })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification code');
            }

            generatedOtp = data.otp;
            showMessage('New verification code sent! Check your terminal.', 'success');

        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            resendOtpBtn.disabled = false;
            resendOtpBtn.textContent = 'Resend Code';
        }
    });

    // Reset Password
    resetPasswordBtn.addEventListener('click', async () => {
        const password = newPassword.value;
        const confirmPassword = confirmNewPassword.value;
        
        if (!password || !confirmPassword) {
            showMessage('Please enter both password fields', 'error');
            return;
        }

        if (password.length < 8) {
            showMessage('Password must be at least 8 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            resetPasswordBtn.disabled = true;
            resetPasswordBtn.textContent = 'Resetting...';

            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: userEmail, 
                    newPassword: password,
                    accountType: selectedType || 'traveller'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            showMessage('Password reset successfully! You can now login with your new password.', 'success');
            
            setTimeout(() => {
                forgotPasswordModal.classList.add('hidden');
                resetForgotPasswordForm();
            }, 2000);

        } catch (err) {
            showMessage(err.message, 'error');
        } finally {
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.textContent = 'Reset Password';
        }
    });
});