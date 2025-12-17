const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
const FROM_NAME = process.env.FROM_NAME || 'Panda Express';

/**
 * Send order ready email notification when kitchen completes order
 */
export async function sendOrderReadyNotification(
    email: string,
    orderId: number
): Promise<boolean> {
    try {
        if (!MAILERSEND_API_KEY) {
            console.error('MailerSend API key not configured');
            return false;
        }

        const response = await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: {
                    email: FROM_EMAIL,
                    name: FROM_NAME,
                },
                to: [
                    {
                        email: email,
                    },
                ],
                subject: `Your Order #${orderId} is Ready for Pickup!`,
                text: `Your order #${orderId} is READY for pickup! Come grab it while it's hot!`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #C41230; padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">Panda Express</h1>
                        </div>
                        <div style="padding: 30px; background-color: #f9f9f9;">
                            <h2 style="color: #333;">Your Order is Ready! 🥡</h2>
                            <p style="font-size: 18px; color: #555;">
                                Great news! Your order <strong>#${orderId}</strong> is now ready for pickup.
                            </p>
                            <p style="font-size: 16px; color: #555;">
                                Come grab it while it's hot! 🔥
                            </p>
                        </div>
                        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                            <p style="margin: 0;">Thank you for choosing Panda Express!</p>
                        </div>
                    </div>
                `,
            }),
        });

        if (response.ok) {
            console.log(`Order ready email sent to ${email} for order #${orderId}`);
            return true;
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('MailerSend API error:', response.status, errorData);
            return false;
        }
    } catch (error) {
        console.error('Failed to send order ready email:', error);
        return false;
    }
}

