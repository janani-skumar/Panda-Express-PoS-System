/**
 * Cashier Operations - Overview
 */

function cashierOverview(createPage, { description, title, navigateTo, screenshot, pageBreak }) {

  createPage(() => {
    title('Cashier Operations');

    description(`
The cashier interface is designed for employees to efficiently process customer orders. This section covers the main features available to cashier staff.
    `);

    pageBreak();

    title(2, 'Employee Login');

    navigateTo('/login');

    description(`
Employees must log in with their credentials to access the cashier system. The login page supports both traditional login and OAuth authentication.
    `);

    screenshot('employee-login');

    pageBreak();

    title(2, 'Cashier Dashboard');

    navigateTo('/employee/cashier');

    description(`
The cashier dashboard provides:
- Quick menu item selection
- Order building interface
- Payment processing
- Receipt generation
- Order history access
    `);

    screenshot('cashier-dashboard');

    pageBreak();

    title(2, 'Processing Orders');

    description(`
To process an order:
1. Select items from the menu categories
2. Specify quantities and customizations
3. Review the order total
4. Process payment
5. Complete the transaction

The interface is optimized for speed and accuracy during busy periods.
    `);

    screenshot('order-processing');
  }, 'http://localhost:3000');

}

module.exports = cashierOverview;
