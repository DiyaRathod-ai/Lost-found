// EmailJS Configuration for Lost & Found Website
// Get these from https://www.emailjs.com/ (free account)

// SETUP INSTRUCTIONS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Go to Email Services and connect your email (Gmail, Yahoo, etc.)
// 3. Create an email template with these variables: {{to_email}}, {{from_name}}, {{from_email}}, {{subject}}, {{message}}, {{item_title}}, {{item_type}}
// 4. Get your Public Key, Service ID, and Template ID
// 5. Replace the values below with your actual IDs

const EMAIL_CONFIG = {
    // Your EmailJS Public Key (get from Account -> API Keys)
    PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY', // Replace with your public key
    
    // Your Service ID (get from Email Services)
    SERVICE_ID: 'YOUR_EMAIL_SERVICE_ID', // Replace with your service ID
    
    // Your Template ID (get from Email Templates)
    TEMPLATE_ID: 'YOUR_EMAIL_TEMPLATE_ID', // Replace with your template ID
    
    // Whether EmailJS is configured (change to true after setup)
    CONFIGURED: false
};

class EmailService {
    constructor() {
        this.initialized = false;
        this.init();
    }
    
    init() {
        if (EMAIL_CONFIG.CONFIGURED && EMAIL_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
            try {
                emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
                this.initialized = true;
                console.log('✅ EmailJS initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize EmailJS:', error);
                this.showSetupInstructions();
            }
        } else {
            console.warn('⚠️ EmailJS not configured');
            this.showSetupInstructions();
        }
    }
    
    showSetupInstructions() {
        const instructions = `
        📧 EMAIL SETUP INSTRUCTIONS:
        
        To enable real email sending, follow these steps:
        
        1. Go to https://www.emailjs.com/ and create a FREE account
        
        2. Connect your email service:
           - Go to "Email Services" 
           - Click "Add New Service"
           - Choose Gmail, Yahoo, Outlook, etc.
           - Follow the connection steps
        
        3. Create an email template:
           - Go to "Email Templates"
           - Click "Create New Template"
           - Use these template variables in your email:
             * {{to_email}} - Recipient's email
             * {{from_name}} - Sender's name
             * {{from_email}} - Sender's email
             * {{subject}} - Email subject
             * {{message}} - Email message
             * {{item_title}} - Lost/Found item title
             * {{item_type}} - "Lost" or "Found"
        
        4. Get your credentials:
           - Public Key: Account -> API Keys
           - Service ID: Email Services -> Your service
           - Template ID: Email Templates -> Your template
        
        5. Update js/email-config.js with your credentials
        
        6. Set CONFIGURED: true in the config
        
        Until then, contact form will show instructions to users.
        `;
        
        console.log(instructions);
    }
    
    async sendContactEmail(contactData) {
        if (!this.initialized) {
            console.log('📧 EmailJS not configured, showing fallback message');
            return this.showFallbackMessage(contactData);
        }
        
        try {
            console.log('📧 Sending email via EmailJS...', contactData);
            
            const templateParams = {
                to_email: contactData.recipientEmail,
                from_name: contactData.senderName || 'Lost & Found User',
                from_email: contactData.senderEmail,
                subject: contactData.subject,
                message: contactData.message,
                item_title: contactData.itemTitle,
                item_type: contactData.itemType
            };
            
            const result = await emailjs.send(
                EMAIL_CONFIG.SERVICE_ID,
                EMAIL_CONFIG.TEMPLATE_ID,
                templateParams
            );
            
            console.log('✅ Email sent successfully:', result);
            return { success: true, message: 'Email sent successfully!' };
            
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            return { success: false, message: 'Failed to send email. Please try again or contact directly.' };
        }
    }
    
    showFallbackMessage(contactData) {
        // Create a fallback that opens the user's email client
        const subject = encodeURIComponent(contactData.subject);
        const body = encodeURIComponent(`From: ${contactData.senderEmail}\n\n${contactData.message}`);
        const mailtoUrl = `mailto:${contactData.recipientEmail}?subject=${subject}&body=${body}`;
        
        // Show modal with instructions
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 15px;
                padding: 2rem;
                max-width: 500px;
                margin: 2rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            ">
                <h3 style="color: #1f2937; margin-bottom: 1rem;">📧 Contact Owner</h3>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">
                    Email functionality is not yet configured. You can:
                </p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="${mailtoUrl}" 
                       style="
                           background: #667eea;
                           color: white;
                           padding: 0.75rem 1.5rem;
                           border-radius: 8px;
                           text-decoration: none;
                           text-align: center;
                           font-weight: 500;
                       ">
                        📬 Open Email Client
                    </a>
                    <button onclick="navigator.clipboard.writeText('${contactData.recipientEmail}').then(() => alert('Email copied!'))" 
                            style="
                                background: #10b981;
                                color: white;
                                padding: 0.75rem 1.5rem;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 500;
                            ">
                        📋 Copy Email: ${contactData.recipientEmail}
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="
                                background: #6b7280;
                                color: white;
                                padding: 0.75rem 1.5rem;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 500;
                            ">
                        ✕ Close
                    </button>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 8px; font-size: 0.875rem; color: #4b5563;">
                    <strong>Subject:</strong> ${contactData.subject}<br>
                    <strong>Your Email:</strong> ${contactData.senderEmail}<br>
                    <strong>Message:</strong><br>
                    <div style="white-space: pre-wrap; margin-top: 0.5rem;">${contactData.message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        return { success: true, message: 'Contact options displayed' };
    }
}

// Create global email service instance
window.emailService = new EmailService();