/**
 * Customer Ordering - Overview
 */

function customerOverview(createPage, { description, title, navigateTo, screenshot, pageBreak, link }) {

  createPage(() => {
    title('Customer Ordering System');

    description(`
The customer ordering interface allows guests to browse the menu and place orders through a self-service kiosk or their personal devices.
    `);

    pageBreak();

    title(2, 'Accessing the Menu');

    navigateTo('/');

    description(`
The home page provides quick access to the ordering system. Customers can browse available meal options and build their orders.
    `);

    screenshot('home-page');

    pageBreak();

    title(2, 'Menu Categories');

    navigateTo('/menu');

    description(`
The menu displays all available items organized by category:
- **Entrees** - Main dishes like Orange Chicken, Beijing Beef, etc.
- **Sides** - Fried Rice, Chow Mein, Super Greens
- **Appetizers** - Egg Rolls, Rangoons
- **Drinks** - Beverages and refreshments
    `);

    screenshot('menu-page');

    pageBreak();

    title(2, 'Building Your Meal');

    navigateTo('/home');

    description(`
Customers can select from various meal sizes:
- **Bowl** - 1 Entree + 1 Side
- **Plate** - 2 Entrees + 1 Side
- **Bigger Plate** - 3 Entrees + 1 Side
- **A La Carte** - Individual items
    `);

    screenshot('meal-builder');
  }, 'http://localhost:3000');

}

module.exports = customerOverview;
