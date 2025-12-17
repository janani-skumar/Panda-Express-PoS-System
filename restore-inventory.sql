-- Restore inventory items for all menu items
-- Organized by category with reasonable default values

INSERT INTO inventory ("name", "batchPurchaseCost", "currentStock", "estimatedUsedPerDay")
VALUES
  -- Drink Supplies (High-volume items)
  ('Cups', 35.00, 300, 75),
  ('Lids', 25.00, 350, 75),
  ('Straws', 15.00, 500, 75),
  ('Ice', 20.00, 400, 100),
  
  -- Proteins
  ('Chicken Breast', 35.00, 75, 25),
  ('Beef', 40.00, 60, 20),
  ('Shrimp', 38.00, 50, 15),
  
  -- Vegetables
  ('Broccoli', 18.00, 80, 20),
  ('String Beans', 15.00, 70, 18),
  ('Mushrooms', 20.00, 60, 15),
  ('Bell Peppers', 16.00, 65, 15),
  ('Carrots', 12.00, 90, 22),
  ('Mixed Greens', 14.00, 75, 20),
  
  -- Sauces & Seasonings
  ('Orange Sauce', 25.00, 50, 15),
  ('Honey Sesame Sauce', 28.00, 45, 12),
  ('Teriyaki Sauce', 22.00, 55, 18),
  ('Kung Pao Sauce', 24.00, 48, 14),
  ('Black Pepper Sauce', 26.00, 52, 16),
  ('Garlic', 18.00, 60, 20),
  ('Ginger', 20.00, 40, 12),
  ('Onions', 14.00, 70, 20),
  
  -- Staples & Grains
  ('White Rice', 30.00, 250, 80),
  ('Chow Mein Noodles', 28.00, 150, 40),
  ('Flour', 22.00, 100, 25),
  ('Cooking Oil', 35.00, 80, 20),
  
  -- Appetizer Ingredients
  ('Spring Roll Wrappers', 25.00, 150, 35),
  ('Egg Roll Wrappers', 25.00, 150, 35),
  ('Wonton Wrappers', 24.00, 140, 30),
  ('Cream Cheese', 28.00, 60, 20),
  
  -- Specialty Items
  ('Walnuts', 22.00, 35, 10),
  ('Sesame Seeds', 18.00, 45, 12)
ON CONFLICT ("name") DO UPDATE
SET "batchPurchaseCost" = EXCLUDED."batchPurchaseCost",
    "currentStock" = EXCLUDED."currentStock",
    "estimatedUsedPerDay" = EXCLUDED."estimatedUsedPerDay";
