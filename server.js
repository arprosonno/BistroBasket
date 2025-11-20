// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve index.html, styles.css, script.js

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bistro'
});

db.connect(err => {
  if (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});

// ===== API =====

// Get menu with aggregated food details
app.get('/api/menu', (req, res) => {
  const query = `
    SELECT m.Item, m.Name AS MenuName, m.Price,
           GROUP_CONCAT(f.Name SEPARATOR '||') AS FoodNames,
           GROUP_CONCAT(f.Description SEPARATOR '||') AS Descriptions,
           GROUP_CONCAT(f.Ingredients SEPARATOR '||') AS IngredientsList
    FROM Menu m
    LEFT JOIN Food_Details_has_Menu fm ON m.Item = fm.Menu_Item
    LEFT JOIN Food_Details f ON f.Id = fm.Food_Details_Id
    GROUP BY m.Item, m.Name, m.Price
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    // Convert concatenated strings into arrays
    const menu = results.map(item => ({
      Item: item.Item,
      MenuName: item.MenuName,
      Price: item.Price,
      FoodNames: item.FoodNames ? item.FoodNames.split('||') : [],
      Descriptions: item.Descriptions ? item.Descriptions.split('||') : [],
      Ingredients: item.IngredientsList ? item.IngredientsList.split('||') : []
    }));
    res.json(menu);
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const query = `SELECT Cus_Id, Cus_Name FROM Cus_Details WHERE Cus_Phone=? AND Cus_Password=?`;
  db.query(query, [phone, password], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.json({ success: false, msg: 'Invalid credentials' });
    res.json({ success: true, user: results[0] });
  });
});

// Signup
app.post('/api/signup', (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, msg: 'Missing required fields' });
  }

  const checkQuery = `SELECT * FROM Cus_Details WHERE Cus_Phone = ?`;
  db.query(checkQuery, [phone], (err, results) => {
    if (err) {
      console.error('Error checking phone:', err);
      return res.status(500).json({ error: err });
    }

    if (results.length > 0) {
      return res.json({ success: false, msg: 'Phone already registered' });
    }

    const insertQuery = `
      INSERT INTO Cus_Details (Cus_Name, Cus_Email, Cus_Phone, Cus_Password)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [name, email || '', phone, password], (err2, result2) => {
      if (err2) {
        console.error('Insert error:', err2);
        return res.status(500).json({ error: err2 });
      }

      res.json({
        success: true,
        user: { Cus_Id: result2.insertId, Cus_Name: name }
      });
    });
  });
});

app.post('/api/checkout', (req, res) => {
  const { Amount, Cus_Details_Cus_Id, Date } = req.body;
  console.log(req.body);

  const insertQuery = `
    INSERT INTO Billing (Amount, Cus_Details_Cus_Id, \`Date\`)
    VALUES (?, ?, ?)
  `;

  db.query(insertQuery, [Amount, Cus_Details_Cus_Id, Date], (err2) => {
    if (err2) {
      console.error('Insert error:', err2);
      return res.status(500).json({ error: err2 });
    }

    res.json({ success: true });
  });
});



// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
