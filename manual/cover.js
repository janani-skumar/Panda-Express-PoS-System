/**
 * Documentation Cover Page
 * Panda Express Point of Sale System
 */

function cover(createPage, { description, img, title, pageBreak, link }) {

  createPage(() => {
    img('Panda Express Logo', '/Panda Express/round_logo.png');
    title('Panda Express PoS System Documentation');
    
    description(`
Welcome to the Panda Express Point of Sale System documentation. This comprehensive guide covers all aspects of the system including:

- **Customer Ordering** - Self-service kiosk interface for customers
- **Cashier Operations** - Employee interface for processing orders
- **Kitchen Display** - Real-time order management for kitchen staff
- **Manager Dashboard** - Administrative tools and reporting

This documentation includes both visual guides with screenshots and detailed API references.
    `);
    
    pageBreak();
    
    title(2, 'Quick Links');
    
    link('Customer Ordering Guide', '#/1-Customer%20Ordering/1-Overview');
    link('Cashier Guide', '#/2-Cashier%20Operations/1-Overview');
    link('Kitchen Display Guide', '#/3-Kitchen%20Display/1-Overview');
    link('Manager Dashboard Guide', '#/4-Manager%20Dashboard/1-Overview');
    link('API Documentation', '/docs/api/index.html');
    
    pageBreak();
    
    title(2, 'System Requirements');
    
    description(`
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- For employees: Valid login credentials
- For kitchen display: Large screen recommended
    `);
  });

}

module.exports = cover;
