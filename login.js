// DOM Elements
const loginCard = document.getElementById('loginCard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const toastContainer = document.getElementById('toast-container');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    loadTheme();
    setupEventListeners();
    addKeyboardNavigation();
});

// Animation initialization
function initializeAnimations() {
    // Add staggered animation to glow orbs
    const orbs = document.querySelectorAll('.glow-orb');
    orbs.forEach((orb, index) => {
        orb.style.animationDelay = `${index * 0.5}s`;
    });

    // Add form appearance animation
    setTimeout(() => {
        loginCard.style.animation = 'cardSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }, 200);
}

// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme icon
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Add theme transition effect
    document.body.style.transition = 'background-color 0.5s ease, color 0.3s ease';
    
    showToast(`已切换到${newTheme === 'light' ? '浅色' : '深色'}主题`, 'success');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Form tab switching
function switchTab(targetTab) {
    // Update tab buttons
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === targetTab) {
            btn.classList.add('active');
        }
    });
    
    // Update forms with animation
    const currentForm = document.querySelector('.auth-form:not(.hidden)');
    const targetForm = targetTab === 'login' ? loginForm : registerForm;
    
    if (currentForm && currentForm !== targetForm) {
        // Fade out current form
        currentForm.style.animation = 'formFadeOut 0.3s ease-in forwards';
        
        setTimeout(() => {
            currentForm.classList.add('hidden');
            targetForm.classList.remove('hidden');
            targetForm.style.animation = 'formFadeIn 0.6s ease-out';
        }, 300);
    }
}

// Password visibility toggle
function togglePassword() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    passwordInputs.forEach((input, index) => {
        if (input.type === 'password') {
            input.type = 'text';
            if (toggleButtons[index]) {
                toggleButtons[index].innerHTML = '<i class="fas fa-eye-slash"></i>';
            }
        } else {
            input.type = 'password';
            if (toggleButtons[index]) {
                toggleButtons[index].innerHTML = '<i class="fas fa-eye"></i>';
            }
        }
    });
}

// Form validation
function validateForm(formType) {
    const form = formType === 'login' ? loginForm : registerForm;
    const inputs = form.querySelectorAll('.form-input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        const value = input.value.trim();
        const formGroup = input.closest('.form-group');
        
        // Remove previous error states
        input.classList.remove('error');
        formGroup.classList.remove('error');
        
        // Validate required fields
        if (!value) {
            showError(input, '此字段为必填项');
            isValid = false;
            return;
        }
        
        // Email validation
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showError(input, '请输入有效的邮箱地址');
                isValid = false;
                return;
            }
        }
        
        // Password validation
        if (input.placeholder && input.placeholder.includes('至少8位')) {
            if (value.length < 8) {
                showError(input, '密码至少需要8位字符');
                isValid = false;
                return;
            }
        }
        
        // Confirm password validation
        if (input.placeholder && input.placeholder.includes('再次输入密码')) {
            const passwordInput = form.querySelector('input[placeholder*="至少8位"]');
            if (passwordInput && value !== passwordInput.value) {
                showError(input, '两次输入的密码不一致');
                isValid = false;
                return;
            }
        }
    });
    
    return isValid;
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    input.classList.add('error');
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

// Form submission
function handleFormSubmit(event, formType) {
    event.preventDefault();
    
    if (!validateForm(formType)) {
        showToast('请检查表单信息', 'error');
        return;
    }
    
    const submitBtn = formType === 'login' ? loginBtn : registerBtn;
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.opacity = '0';
    spinner.classList.remove('hidden');
    
    // Simulate API call
    setTimeout(() => {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.opacity = '1';
        spinner.classList.add('hidden');
        
        // Show success message
        const action = formType === 'login' ? '登录' : '注册';
        showToast(`${action}成功！`, 'success');
        
        // Simulate redirect after login
        if (formType === 'login') {
            setTimeout(() => {
                // In a real app, this would redirect to the dashboard
                console.log('Redirecting to dashboard...');
                showToast('正在跳转到仪表盘...', 'info');
            }, 1500);
        }
    }, 2000);
}

// Toast notifications
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = toastContainer.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = getToastIcon(type);
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        hideToast(toast);
    }, 4000);
}

function hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Event listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Form submissions
    loginForm.addEventListener('submit', (e) => handleFormSubmit(e, 'login'));
    registerForm.addEventListener('submit', (e) => handleFormSubmit(e, 'register'));
    
    // Input focus effects
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            if (input.value.trim()) {
                input.parentElement.classList.add('filled');
            } else {
                input.parentElement.classList.remove('filled');
            }
        });
        
        input.addEventListener('input', () => {
            // Clear error state when user starts typing
            if (input.classList.contains('error')) {
                input.classList.remove('error');
                input.closest('.form-group').classList.remove('error');
                const errorMessage = input.closest('.form-group').querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }
        });
    });
    
    // Social login buttons
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.classList.contains('google-btn') ? 'Google' : 'GitHub';
            showToast(`正在跳转到${provider}登录...`, 'info');
            
            // Simulate OAuth redirect
            setTimeout(() => {
                console.log(`Redirecting to ${provider} OAuth...`);
            }, 1500);
        });
    });
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Checkbox animations
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const customBox = checkbox.nextElementSibling;
            if (checkbox.checked) {
                customBox.style.animation = 'checkboxCheck 0.3s ease-out';
            } else {
                customBox.style.animation = 'checkboxUncheck 0.3s ease-out';
            }
        });
    });
}

// Keyboard navigation
function addKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape key to close any open modals or focus
        if (e.key === 'Escape') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.blur) {
                activeElement.blur();
            }
        }
        
        // Tab key navigation enhancement
        if (e.key === 'Tab') {
            // Add visual indicator for keyboard navigation
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// Additional animations
const additionalStyles = `
    @keyframes formFadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    @keyframes checkboxCheck {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    @keyframes checkboxUncheck {
        0% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .keyboard-navigation *:focus {
        outline: 2px solid var(--primary) !important;
        outline-offset: 2px !important;
    }
    
    .form-group.error .form-input {
        border-color: var(--danger) !important;
        background: rgba(239, 68, 68, 0.05) !important;
    }
    
    .form-group.error .form-label {
        color: var(--danger) !important;
    }
    
    .error-message {
        color: var(--danger);
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        animation: errorSlideDown 0.3s ease-out;
    }
    
    .error-message::before {
        content: '⚠';
        font-size: 0.75rem;
    }
    
    @keyframes errorSlideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .input-wrapper.focused .form-input {
        transform: scale(1.02);
    }
    
    .input-wrapper.filled .form-input {
        background: rgba(81, 108, 247, 0.05);
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .toast-success {
        border-left: 4px solid var(--success);
    }
    
    .toast-error {
        border-left: 4px solid var(--danger);
    }
    
    .toast-warning {
        border-left: 4px solid var(--warning);
    }
    
    .toast-info {
        border-left: 4px solid var(--primary);
    }
`;

// Add additional styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Auto-save form data (for demo purposes)
function autoSaveFormData() {
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        const key = `form_${input.type}_${input.placeholder}`;
        
        // Load saved data
        const savedValue = localStorage.getItem(key);
        if (savedValue && input.type !== 'password') {
            input.value = savedValue;
        }
        
        // Save data on input
        input.addEventListener('input', () => {
            if (input.type !== 'password' && input.value) {
                localStorage.setItem(key, input.value);
            }
        });
    });
}

// Initialize auto-save after a short delay
setTimeout(autoSaveFormData, 1000);

// Demo functions for testing
window.demoLogin = function() {
    loginForm.querySelector('input[type="email"]').value = 'demo@example.com';
    loginForm.querySelector('input[type="password"]').value = 'password123';
    showToast('已填入演示账号信息', 'info');
};

window.demoRegister = function() {
    const nameInput = registerForm.querySelector('input[placeholder*="姓名"]');
    const emailInput = registerForm.querySelector('input[type="email"]');
    const passwordInput = registerForm.querySelector('input[placeholder*="至少8位"]');
    const confirmInput = registerForm.querySelector('input[placeholder*="再次输入"]');
    
    nameInput.value = '演示用户';
    emailInput.value = 'demo@example.com';
    passwordInput.value = 'password123';
    confirmInput.value = 'password123';
    
    showToast('已填入演示注册信息', 'info');
};

// Console welcome message
console.log(`
🎨 Qiuhe Agent Login Page
✨ 基于 Thumbnail Light 设计风格
🌈 支持浅色/深色主题切换
📱 完全响应式设计
♿ 无障碍访问支持

演示功能:
- demoLogin() - 填入演示登录信息
- demoRegister() - 填入演示注册信息
`);