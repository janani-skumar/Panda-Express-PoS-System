# Cashier Operations

The cashier interface is designed for employees to efficiently process customer orders. This section covers the main features available to cashier staff.

---

## Employee Login

Employees must log in with their credentials to access the cashier system.

**Navigate to:** `/login`

The login page supports:
- Traditional username/password login
- OAuth authentication (Google Sign-In)

> **Note:** Contact your manager if you need login credentials or password reset.

---

## Cashier Dashboard

**Navigate to:** `/employee/cashier`

The cashier dashboard provides:

- **Quick Menu Selection** - Fast access to all menu items
- **Order Building Interface** - Add items to the current order
- **Payment Processing** - Handle cash and card payments
- **Receipt Generation** - Print or email receipts
- **Order History** - View past orders

---

## Processing Orders

### Step-by-Step Order Process:

1. **Start New Order**
   - Click "New Order" or the current order is automatically active

2. **Select Items**
   - Choose meal type (Bowl, Plate, Bigger Plate, A La Carte)
   - Select sides and entrees
   - Add appetizers or drinks as needed

3. **Review Order**
   - Verify all items are correct
   - Make modifications if needed
   - Apply any discounts or promotions

4. **Process Payment**
   - Accept cash, credit, or debit
   - Process through Stripe payment gateway
   - Provide receipt

5. **Complete Transaction**
   - Order is sent to kitchen display
   - Receipt is printed/emailed

---

## Quick Actions

| Action | Description |
|--------|-------------|
| **Void Item** | Remove an item from the current order |
| **Void Order** | Cancel the entire order |
| **Apply Discount** | Add promotional discounts |
| **Split Payment** | Accept multiple payment methods |

---

## Tips for Efficiency

- Memorize menu item locations for faster selection
- Use keyboard shortcuts when available
- Keep the cash drawer organized
- Verify orders before processing payment

---

[← Customer Ordering](../1-Customer%20Ordering/1-Overview.md) | [Next: Kitchen Display →](../3-Kitchen%20Display/1-Overview.md)

