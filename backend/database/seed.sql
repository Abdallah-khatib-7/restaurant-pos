USE restaurant_pos;

-- Tables
INSERT INTO tables (number, capacity) VALUES
(1, 2), (2, 2), (3, 4), (4, 4), (5, 4),
(6, 6), (7, 6), (8, 8), (9, 8), (10, 10);

-- Mezze (category_id = 1)
INSERT INTO menu_items (category_id, name, description, price) VALUES
(1, 'Hummus', 'Classic Lebanese hummus with olive oil', 8.00),
(1, 'Fattoush', 'Fresh Lebanese salad with pomegranate', 7.00),
(1, 'Tabbouleh', 'Parsley, tomato and bulgur salad', 7.00),
(1, 'Moutabal', 'Smoky eggplant dip with tahini', 8.00),
(1, 'Kibbeh Nayeh', 'Raw minced lamb with spices', 12.00),
(1, 'Warak Enab', 'Stuffed grape leaves with rice and meat', 9.00),
(1, 'Labneh', 'Strained yogurt with olive oil and mint', 6.00),
(1, 'Shanklish', 'Aged cheese with tomato and onion', 8.00),
(1, 'Batata Harra', 'Spicy fried potatoes with peppers', 7.00),
(1, 'Makanek', 'Lebanese spiced sausages', 9.00);

-- Grills (category_id = 2)
INSERT INTO menu_items (category_id, name, description, price) VALUES
(2, 'Mixed Grill', 'Assorted grilled meats platter', 25.00),
(2, 'Shish Tawook', 'Marinated chicken skewers', 16.00),
(2, 'Kafta', 'Grilled minced meat with parsley', 15.00),
(2, 'Lamb Chops', 'Grilled lamb chops with herbs', 28.00),
(2, 'Shish Kebab', 'Beef skewers with vegetables', 18.00),
(2, 'Grilled Chicken', 'Half chicken with garlic sauce', 14.00),
(2, 'Liver & Onions', 'Spiced chicken liver', 13.00),
(2, 'Quail', 'Grilled marinated quail', 20.00),
(2, 'Grilled Hammour', 'Fresh fish fillet grilled', 22.00),
(2, 'Grilled Vegetables', 'Seasonal vegetables on the grill', 10.00);

-- Drinks (category_id = 3)
INSERT INTO menu_items (category_id, name, description, price) VALUES
(3, 'Jallab', 'Grape, rose water and pine nuts', 4.00),
(3, 'Ayran', 'Cold salted yogurt drink', 3.00),
(3, 'Lemonade', 'Fresh squeezed with mint', 4.00),
(3, 'Tamarind', 'Sweet tamarind juice', 4.00),
(3, 'Soft Drink', 'Pepsi, 7UP, Miranda', 2.50),
(3, 'Water', 'Still or sparkling', 1.50),
(3, 'Almaza Beer', 'Lebanese local beer', 5.00),
(3, 'Arak', 'Lebanese anise spirit', 6.00),
(3, 'Fresh OJ', 'Freshly squeezed orange juice', 5.00),
(3, 'Turkish Coffee', 'Traditional Lebanese coffee', 3.00);

-- Desserts (category_id = 4)
INSERT INTO menu_items (category_id, name, description, price) VALUES
(4, 'Baklava', 'Layered pastry with nuts and honey', 6.00),
(4, 'Knafeh', 'Sweet cheese pastry with syrup', 8.00),
(4, 'Maamoul', 'Semolina cookies with dates', 5.00),
(4, 'Mouhalabieh', 'Lebanese milk pudding with rose water', 5.00),
(4, 'Awamat', 'Lebanese doughnuts with syrup', 6.00),
(4, 'Sfouf', 'Turmeric semolina cake', 4.00),
(4, 'Ice Cream', 'Two scoops of your choice', 5.00),
(4, 'Creme Brulee', 'Classic French dessert', 7.00),
(4, 'Chocolate Fondant', 'Warm chocolate cake', 8.00),
(4, 'Fruit Platter', 'Seasonal fresh fruits', 7.00);

-- Shisha (category_id = 5)
INSERT INTO menu_items (category_id, name, description, price) VALUES
(5, 'Double Apple', 'Classic double apple flavor', 12.00),
(5, 'Grape Mint', 'Fresh grape with mint', 12.00),
(5, 'Watermelon', 'Fresh watermelon flavor', 12.00),
(5, 'Lemon Mint', 'Tangy lemon with cool mint', 12.00),
(5, 'Blueberry', 'Sweet blueberry blend', 13.00),
(5, 'Peach', 'Sweet peach flavor', 12.00),
(5, 'Cola', 'Cola flavored shisha', 12.00),
(5, 'Mixed Fruit', 'Assorted fruit blend', 13.00),
(5, 'Gum', 'Bubblegum flavor', 12.00),
(5, 'Rose', 'Delicate rose flavor', 13.00);

-- Burgers (category_id = 6)
INSERT INTO menu_items (category_id, name, description, price) VALUES
(6, 'Classic Burger', 'Beef patty with lettuce and tomato', 12.00),
(6, 'Cheese Burger', 'Classic with cheddar cheese', 13.00),
(6, 'Double Burger', 'Two beef patties', 16.00),
(6, 'Mushroom Burger', 'With sauteed mushrooms', 14.00),
(6, 'Crispy Chicken', 'Fried chicken fillet burger', 12.00),
(6, 'BBQ Burger', 'With BBQ sauce and onion rings', 15.00),
(6, 'Veggie Burger', 'Plant based patty', 11.00),
(6, 'Truffle Burger', 'With truffle mayo and parmesan', 18.00),
(6, 'Spicy Burger', 'With jalapenos and hot sauce', 13.00),
(6, 'Lebanese Burger', 'With garlic sauce and pickles', 13.00);

-- Sandwiches (category_id = 7)
INSERT INTO menu_items (category_id, name, description, price) VALUES
(7, 'Shawarma Chicken', 'Classic chicken shawarma wrap', 7.00),
(7, 'Shawarma Meat', 'Beef and lamb shawarma', 8.00),
(7, 'Falafel', 'Crispy falafel with veggies', 5.00),
(7, 'Kafta Sandwich', 'Grilled kafta in bread', 7.00),
(7, 'Shish Tawook Sandwich', 'Chicken with garlic sauce', 7.00),
(7, 'Arayes', 'Grilled bread stuffed with meat', 8.00),
(7, 'Manakeesh Zaatar', 'Flatbread with zaatar and oil', 4.00),
(7, 'Manakeesh Cheese', 'Flatbread with akkawi cheese', 5.00),
(7, 'Club Sandwich', 'Triple decker with chicken', 9.00),
(7, 'Vegetarian Wrap', 'Grilled veggies with hummus', 6.00);