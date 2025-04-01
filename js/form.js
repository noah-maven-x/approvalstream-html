class TypeformStyleForm {
    constructor(questions) {
        this.questions = questions;
        this.currentIndex = 0;
        this.answers = {};
        this.formContainer = document.getElementById('form-container');
        this.progressBar = document.getElementById('progress-bar');
        this.questionCounter = document.getElementById('question-counter');
        this.init();
    }

    init() {
        this.updateProgress();
        this.showQuestion();
        this.setupEventListeners();
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.questionCounter.textContent = `${this.currentIndex + 1} of ${this.questions.length}`;
    }

    showQuestion() {
        const question = this.questions[this.currentIndex];
        const questionHTML = this.createQuestionHTML(question);
        
        // Fade out current question
        if (this.formContainer.children.length > 0) {
            this.formContainer.children[0].classList.add('opacity-0');
            setTimeout(() => {
                this.formContainer.innerHTML = questionHTML;
                // Fade in new question
                this.formContainer.children[0].classList.remove('opacity-0');
            }, 300);
        } else {
            this.formContainer.innerHTML = questionHTML;
        }
    }

    createQuestionHTML(question) {
        let inputHTML = '';
        switch (question.type) {
            case 'text':
                inputHTML = `
                    <input type="text" 
                           class="w-full px-6 py-4 rounded-xl border-2 border-secondary-100 focus:border-manu-accent focus:ring-2 focus:ring-manu-accent/20 outline-none transition-all text-lg"
                           placeholder="${question.placeholder || ''}">
                `;
                break;
            case 'select':
                inputHTML = `
                    <select class="w-full px-6 py-4 rounded-xl border-2 border-secondary-100 focus:border-manu-accent focus:ring-2 focus:ring-manu-accent/20 outline-none transition-all text-lg appearance-none bg-white">
                        <option value="">Select an option</option>
                        ${question.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                `;
                break;
            case 'radio':
                inputHTML = `
                    <div class="space-y-4">
                        ${question.options.map(opt => `
                            <label class="flex items-center p-4 rounded-xl border-2 border-secondary-100 hover:border-manu-accent/50 cursor-pointer transition-all group">
                                <input type="radio" name="q${this.currentIndex}" value="${opt}" 
                                       class="w-5 h-5 text-manu-accent border-2 border-secondary-300 focus:ring-manu-accent">
                                <span class="ml-4 text-lg text-secondary-700 group-hover:text-secondary-900">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
        }

        return `
            <div class="space-y-8 transition-opacity duration-300">
                <h2 class="text-3xl font-display font-semibold text-secondary-800">${question.text}</h2>
                <div class="space-y-4">
                    ${inputHTML}
                </div>
                <div class="flex justify-between items-center pt-6">
                    ${this.currentIndex > 0 ? `
                        <button class="px-8 py-3 text-secondary-600 hover:text-secondary-900 transition-colors text-lg font-medium" onclick="form.previousQuestion()">
                            ← Previous
                        </button>
                    ` : '<div></div>'}
                    ${this.currentIndex < this.questions.length - 1 ? `
                        <button class="px-8 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium" onclick="form.nextQuestion()">
                            Continue →
                        </button>
                    ` : `
                        <button class="px-8 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium" onclick="form.submitForm()">
                            Submit
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    getCurrentAnswer() {
        const input = this.formContainer.querySelector('input, select, textarea');
        if (!input) return null;

        if (input.type === 'radio') {
            const selected = this.formContainer.querySelector('input[type="radio"]:checked');
            return selected ? selected.value : null;
        }

        return input.value;
    }

    nextQuestion() {
        const answer = this.getCurrentAnswer();
        if (!answer) {
            alert('Please provide an answer before continuing.');
            return;
        }

        this.answers[this.currentIndex] = answer;
        this.currentIndex++;
        this.updateProgress();
        this.showQuestion();
    }

    previousQuestion() {
        this.currentIndex--;
        this.updateProgress();
        this.showQuestion();
    }

    submitForm() {
        const answer = this.getCurrentAnswer();
        if (!answer) {
            alert('Please provide an answer before submitting.');
            return;
        }

        this.answers[this.currentIndex] = answer;
        
        // Here you would typically send the answers to your server
        console.log('Form submitted:', this.answers);
        
        // Show success message
        this.formContainer.innerHTML = `
            <div class="text-center space-y-6">
                <h2 class="text-3xl font-display font-semibold text-secondary-800">Thank you!</h2>
                <p class="text-lg text-secondary-600">Your responses have been submitted successfully.</p>
                <button class="px-8 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium" onclick="window.location.reload()">
                    Start Over
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.currentIndex < this.questions.length - 1) {
                this.nextQuestion();
            } else if (e.key === 'Enter' && this.currentIndex === this.questions.length - 1) {
                this.submitForm();
            }
        });
    }
}

// Initialize the form with questions
const questions = [
    {
        text: "What is your name?",
        type: "text",
        placeholder: "Enter your full name"
    },
    {
        text: "What is your role?",
        type: "select",
        options: ["Healthcare Provider", "Administrator", "Other"]
    },
    {
        text: "How did you hear about ApprovalStream?",
        type: "radio",
        options: ["Google Search", "Referral", "Social Media", "Other"]
    },
    {
        text: "What is your primary use case?",
        type: "text",
        placeholder: "Tell us about your needs"
    }
];

const form = new TypeformStyleForm(questions); 