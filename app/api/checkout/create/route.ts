import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

// Detect and log Stripe mode (test vs live)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const isTestMode = stripeKey.startsWith('sk_test_');
const isLiveMode = stripeKey.startsWith('sk_live_');
console.log(`[STRIPE] Mode: ${isTestMode ? 'TEST MODE' : isLiveMode ? 'LIVE MODE' : 'UNKNOWN'} (key prefix: ${stripeKey.substring(0, 8)}...)`);

const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-11-17.clover',
});
export async function POST(request: NextRequest) {
    const requestId = Date.now().toString(36);
    console.log(`[${requestId}] [CHECKOUT] Starting checkout session creation`);
    
    try {
        // Validate Stripe secret key is available
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            console.error(`[${requestId}] [CHECKOUT] ERROR: STRIPE_SECRET_KEY environment variable is not set`);
            return NextResponse.json(
                { error: 'Stripe configuration error: Missing STRIPE_SECRET_KEY' },
                { status: 500 }
            );
        }
        const keyMode = stripeSecretKey.startsWith('sk_test_') ? 'TEST' : stripeSecretKey.startsWith('sk_live_') ? 'LIVE' : 'UNKNOWN';
        console.log(`[${requestId}] [CHECKOUT] Stripe key validated - Mode: ${keyMode}, Key exists: ${stripeSecretKey ? 'yes' : 'no'}`);

        const body = await request.json();
        const { meals, individualItems, subtotal, tax, total, customerEmail } = body;
        console.log(`[${requestId}] [CHECKOUT] Request body received - meals: ${meals?.length || 0}, items: ${individualItems?.length || 0}, total: $${total}`);

        // Validate required fields
        if (!meals || !individualItems || subtotal === undefined || tax === undefined || total === undefined) {
            console.error(`[${requestId}] [CHECKOUT] ERROR: Missing required fields`);
            return NextResponse.json(
                { error: 'Missing required fields: meals, individualItems, subtotal, tax, total' },
                { status: 400 }
            );
        }
        console.log(`[${requestId}] [CHECKOUT] Request validation passed`);

        // Build line items for Stripe
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        // Add meals to line items
        meals.forEach((meal: any) => {
            const mealDescription = [
                ...meal.selections.entrees.map((e: any) => e.recipeName),
                ...meal.selections.sides.map((s: any) => s.recipeName),
                ...meal.selections.drinks.map((d: any) => d.recipeName),
            ].join(', ');

            for (let i = 0; i < meal.quantity; i++) {
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: meal.mealType,
                            description: mealDescription || 'Meal',
                        },
                        unit_amount: Math.round(meal.price * 100), // Convert to cents
                    },
                    quantity: 1,
                });
            }
        });

        // Add individual items to line items
        individualItems.forEach((item: any) => {
            for (let i = 0; i < item.quantity; i++) {
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.recipeName,
                            description: `${item.recipeType} - A la carte`,
                        },
                        unit_amount: Math.round(item.price * 100), // Convert to cents
                    },
                    quantity: 1,
                });
            }
        });

        // Add tax as a line item
        if (tax > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Tax',
                        description: 'Sales tax',
                    },
                    unit_amount: Math.round(tax * 100), // Convert to cents
                },
                quantity: 1,
            });
        }

        // Prepare order data to store in Stripe metadata
        // We'll create the order only after successful payment
        const orderData = {
            meals: meals,
            individualItems: individualItems,
            tax: tax,
            total: total,
            customerEmail: customerEmail || undefined,
        };

        // Store order data as JSON string in Stripe metadata
        // Stripe metadata has a 500 character limit per key, so we'll use a single key
        const orderDataJson = JSON.stringify(orderData);
        
        // Check if order data exceeds Stripe metadata limits
        if (orderDataJson.length > 500) {
            console.error(`[${requestId}] [CHECKOUT] ERROR: Order data too large for Stripe metadata (${orderDataJson.length} chars, max 500)`);
            return NextResponse.json(
                { error: 'Order data too large. Please reduce the number of items.' },
                { status: 400 }
            );
        }

        // Get base URL for callbacks
        // Priority: NEXTAUTH_URL > request origin > fallback
        // In production, we need to ensure we use HTTPS and the correct domain
        let baseUrl = process.env.NEXTAUTH_URL;
        
        // If NEXTAUTH_URL is not set, use the request origin
        if (!baseUrl) {
            const origin = request.headers.get('origin') || request.nextUrl.origin;
            baseUrl = origin;
            console.log(`[${requestId}] [CHECKOUT] WARNING: NEXTAUTH_URL not set, using request origin: ${baseUrl}`);
        }
        
        // Ensure we have a valid URL (should never be undefined at this point)
        if (!baseUrl) {
            throw new Error('Unable to determine base URL for Stripe callbacks. Please set NEXTAUTH_URL environment variable.');
        }
        
        // Ensure the URL doesn't have a trailing slash
        baseUrl = baseUrl.replace(/\/$/, '');
        
        // Validate that we're not using localhost in production
        if (baseUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
            console.error(`[${requestId}] [CHECKOUT] ERROR: Base URL is localhost in production! This will cause Stripe redirect issues.`);
            console.error(`[${requestId}] [CHECKOUT] Please set NEXTAUTH_URL to your production URL: https://panda-pos-nrtf.onrender.com`);
        }
        
        const successUrl = `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/api/checkout/cancel`;
        
        console.log(`[${requestId}] [CHECKOUT] Base URL resolved: ${baseUrl}`);
        console.log(`[${requestId}] [CHECKOUT] Success URL: ${successUrl}`);
        console.log(`[${requestId}] [CHECKOUT] Cancel URL: ${cancelUrl}`);
        console.log(`[${requestId}] [CHECKOUT] Creating Stripe checkout session with ${lineItems.length} line items...`);

        // Create Stripe checkout session with order data in metadata
        // Order will be created only after successful payment
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                orderData: orderDataJson,
            },
        });

        console.log(`[${requestId}] [CHECKOUT] Stripe session created successfully - Session ID: ${session.id}`);
        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : 'No stack trace';
        
        console.error(`[${requestId}] [CHECKOUT] ERROR: Failed to create Stripe checkout session:`, {
            message: errorMessage,
            stack: errorStack,
            error: error
        });
        
        // Provide more helpful error messages
        let userMessage = 'Failed to create checkout session';
        if (errorMessage.includes('STRIPE_SECRET_KEY')) {
            userMessage = 'Stripe configuration error: Missing API key. Please check environment variables.';
        } else if (errorMessage.includes('Invalid API Key')) {
            userMessage = 'Stripe configuration error: Invalid API key. Please verify your Stripe secret key.';
        } else if (errorMessage.includes('SSL') || errorMessage.includes('wrong version number')) {
            userMessage = 'Network error: SSL/TLS protocol issue. This may indicate a configuration problem.';
        }
        
        return NextResponse.json(
            { error: userMessage, details: errorMessage },
            { status: 500 }
        );
    }
}
