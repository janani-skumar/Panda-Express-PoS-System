/**
 * Kitchen Display - Overview
 */

function kitchenOverview(createPage, { description, title, navigateTo, screenshot, pageBreak }) {

  createPage(() => {
    title('Kitchen Display System');

    description(`
The kitchen display system (KDS) shows real-time orders to kitchen staff, enabling efficient preparation and order fulfillment.
    `);

    pageBreak();

    title(2, 'Kitchen View');

    navigateTo('/employee/kitchen');

    description(`
The kitchen display shows:
- **Pending Orders** - Orders waiting to be prepared
- **Order Details** - Items in each order with special instructions
- **Order Timing** - Time since order was placed
- **Completion Controls** - Mark items/orders as complete
    `);

    screenshot('kitchen-display');

    pageBreak();

    title(2, 'Order Management');

    description(`
Kitchen staff can:
- View all active orders in a carousel format
- See individual items within each order
- Mark items as cooked/complete
- Track order timestamps for preparation timing
- Handle multiple orders simultaneously

The display automatically updates as new orders come in.
    `);

    screenshot('kitchen-orders');

    pageBreak();

    title(2, 'Completing Orders');

    description(`
To complete an order:
1. Prepare all items listed
2. Click on individual items to mark as complete
3. Once all items are ready, mark the entire order complete
4. The order moves to the completed queue

The system tracks cooking times for performance monitoring.
    `);
  }, 'http://localhost:3000');

}

module.exports = kitchenOverview;
