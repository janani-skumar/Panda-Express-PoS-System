/**
 * Manager Dashboard - Overview
 */

function managerOverview(createPage, { description, title, navigateTo, screenshot, pageBreak }) {

  createPage(() => {
    title('Manager Dashboard');

    description(`
The manager dashboard provides administrative tools for inventory management, employee management, recipe management, and reporting.
    `);

    pageBreak();

    title(2, 'Accessing Manager Tools');

    navigateTo('/employee/manager');

    description(`
Managers can access the administrative dashboard after logging in with manager credentials. The dashboard is organized into tabs:
- **Inventory** - Stock management
- **Employees** - Staff management
- **Recipes** - Menu item configuration
- **Reports** - Business analytics
    `);

    screenshot('manager-dashboard');

    pageBreak();

    title(2, 'Inventory Management');

    description(`
The inventory tab allows managers to:
- View current stock levels
- Add/remove inventory items
- Set reorder thresholds
- Track ingredient usage
- Generate restock reports
    `);

    screenshot('inventory-management');

    pageBreak();

    title(2, 'Employee Management');

    description(`
The employees tab provides:
- View all staff members
- Add new employees
- Edit employee information
- Assign roles and permissions
- Deactivate employee accounts
    `);

    screenshot('employee-management');

    pageBreak();

    title(2, 'Reports');

    description(`
Available reports include:
- **X-Report** - Current shift sales summary
- **Z-Report** - End-of-day sales report
- **Product Usage** - Ingredient consumption tracking
- **Sales by Item** - Item popularity analysis
- **Restock Report** - Inventory reorder suggestions
    `);

    screenshot('reports-tab');
  }, 'http://localhost:3000');

}

module.exports = managerOverview;
