// Global variables
let practiceId = null;

// Function to get API base URL
function getApiBaseUrl() {
    // Use Make.com webhook URLs with token as URL parameter
    return {
        practice: (token) => `https://hook.us1.make.com/nbr5vo4v4udjah5gs52cdwmh2aq74je2?type=practice&token=${encodeURIComponent(token)}`,
        forms: (token) => `https://hook.us1.make.com/nbr5vo4v4udjah5gs52cdwmh2aq74je2?type=forms&token=${encodeURIComponent(token)}`,
        signout: (token) => `https://hook.us1.make.com/nbr5vo4v4udjah5gs52cdwmh2aq74je2?type=signout&token=${encodeURIComponent(token)}`
    };
}

// Function to get form base URL
function getFormBaseUrl() {
    // Use the current origin for form URLs
    return window.location.origin;
}

// Check authentication status
async function checkAuth() {
    try {
        const token = new URLSearchParams(window.location.search).get('token');
        console.log('Checking auth with token:', token);
        
        if (!token) {
            console.log('No token found, redirecting to login');
            window.location.href = '/login';
            return null;
        }

        console.log('Making webhook request to practice endpoint');
        const response = await fetch(getApiBaseUrl().practice(token), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('Webhook response status:', response.status);
        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received practice data:', data);
        return data;
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/login';
        return null;
    }
}

// Function to fetch practice data
async function fetchPracticeData() {
    try {
        const data = await checkAuth();
        if (!data) return;

        practiceId = data.recordId || data.id || data['Record ID'];
        
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = 'Hello ' + (data['Primary Contact First Name'] || 'Practice');
        }

        await fetchFormStates();
    } catch (error) {
        console.error('Error fetching practice data:', error);
    }
}

// Function to fetch form states
async function fetchFormStates() {
    try {
        const token = new URLSearchParams(window.location.search).get('token');
        const response = await fetch(getApiBaseUrl().forms(token), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch form states');
        }

        const forms = await response.json();
        console.log('Forms data:', forms);
        forms.forEach(form => {
            if (form.type === 'Zepbound Inquiry') {
                const content = document.getElementById('zepboundContent');
                const urlInput = document.getElementById('zepboundURL');
                const qrCode = document.getElementById('zepboundQR');
                
                if (content) {
                    const formUrl = `${getFormBaseUrl()}/form/zepbound-inquiry?practice_id=${practiceId}`;
                    console.log('Form URL:', formUrl);
                    urlInput.value = formUrl;
                    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}`;
                }
            }
        });
    } catch (error) {
        console.error('Error fetching form states:', error);
    }
}

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = element.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Function to handle sign out
async function signOut() {
    try {
        const token = new URLSearchParams(window.location.search).get('token');
        await fetch(getApiBaseUrl().signout(token), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        window.location.href = '/login';
    } catch (error) {
        console.error('Error signing out:', error);
        window.location.href = '/login';
    }
}

// Initialize dashboard
async function initDashboard() {
    await fetchPracticeData();
}

// Initialize login page
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Here you would typically make a request to your authentication endpoint
                // For now, we'll simulate a successful login and redirect to the dashboard
                // with a mock token
                const mockToken = 'mock-auth-token';
                window.location.href = `/dashboard?token=${mockToken}`;
            } catch (error) {
                errorMessage.textContent = 'Invalid email or password';
                errorMessage.style.display = 'block';
            }
        });
    }
}

// Initialize homepage
function initHomepage() {
    document.addEventListener('DOMContentLoaded', async () => {
        const token = new URLSearchParams(window.location.search).get('token');
        if (token) {
            const data = await checkAuth();
            if (data) {
                window.location.href = '/dashboard';
            }
        }
    });
} 