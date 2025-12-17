import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCSTTimestamp } from '@/lib/utils';
import { OrderInfo } from '@/lib/types';
import { createOrder } from '@/app/services/orderService';

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing session_id parameter' },
                { status: 400 }
            );
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Verify payment was successful
        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 }
            );
        }

        // Extract order data from metadata
        const metadata = session.metadata;
        if (!metadata || !metadata.orderData) {
            return NextResponse.json(
                { error: 'Missing order data in metadata' },
                { status: 400 }
            );
        }

        // Parse order data from JSON string
        let orderData;
        try {
            orderData = JSON.parse(metadata.orderData);
        } catch (parseError) {
            console.error('Error parsing order data from metadata:', parseError);
            return NextResponse.json(
                { error: 'Invalid order data in metadata' },
                { status: 400 }
            );
        }

        // Create order in database now that payment is successful
        const orderInfo: OrderInfo = {
            meals: orderData.meals,
            individualItems: orderData.individualItems,
        };

        const orderTime = getCSTTimestamp();
        const cashierId = 2; // Default cashier ID for customer orders

        console.log(`[CHECKOUT_SUCCESS] Creating order after successful payment...`);
        try {
            const order = await createOrder({
                tax: orderData.tax,
                totalCost: orderData.total,
                orderTime: orderTime,
                cashierId: cashierId,
                orderInfo: orderInfo,
                isCompleted: false,
                customerEmail: orderData.customerEmail,
            });

            const orderId = order.id;
            console.log(`[CHECKOUT_SUCCESS] Order created successfully - ID: ${orderId}`);

            // Get base URL for redirect - use same logic as checkout/create
            // Priority: NEXTAUTH_URL > request origin > fallback
            let baseUrl = process.env.NEXTAUTH_URL;
            
            // If NEXTAUTH_URL is not set, use the request origin
            if (!baseUrl) {
                const origin = request.headers.get('origin') || request.nextUrl.origin;
                baseUrl = origin;
            }
            
            // Ensure we have a valid URL
            if (!baseUrl) {
                baseUrl = 'https://project-3-team-41-zbyt.onrender.com/'; // Fallback to production URL
            }
            
            // Ensure the URL doesn't have a trailing slash
            baseUrl = baseUrl.replace(/\/$/, '');

            // Redirect to logout page with order ID
            return NextResponse.redirect(new URL(`/logout/${orderId}`, baseUrl));
        } catch (orderError) {
            const errorMessage = orderError instanceof Error ? orderError.message : 'Unknown error';
            console.error('[CHECKOUT_SUCCESS] ERROR: Failed to create order after payment:', errorMessage);
            return NextResponse.json(
                { error: 'Payment successful but failed to create order', details: errorMessage },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error processing successful payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to process payment', details: errorMessage },
            { status: 500 }
        );
    }
}
