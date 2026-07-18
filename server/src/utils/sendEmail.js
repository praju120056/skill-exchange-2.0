import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // If EMAIL_APP_PASSWORD is provided, send the real email. Otherwise, log to console.
    if (process.env.EMAIL_APP_PASSWORD) {
        try {
            // 1. Configure the SMTP Post Office (Google)
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Nodemailer automatically knows the host/port for Gmail
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD
                }
            });

            // 2. Define the email package
            const mailOptions = {
                from: `"${process.env.FROM_NAME || 'Skill Exchange'}" <${process.env.EMAIL_USER}>`,
                to: options.email,
                subject: options.subject,
                html: options.html
            };

            // 3. Send it
            const info = await transporter.sendMail(mailOptions);
            console.log('Message sent: %s', info.messageId);

        } catch (error) {
            console.error('Error sending email:', error);
        }
    } else {
        // Fallback for local development
        console.log('\n=======================================');
        console.log('EMAIL INTERCEPTED (No EMAIL_APP_PASSWORD)');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body:\n${options.html.replace(/<[^>]+>/g, '')}`); // Strip HTML for console
        console.log('=======================================\n');
    }
};

export default sendEmail;