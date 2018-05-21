var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
const chalk = require("chalk");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  queryAllProducts();
});

function queryAllProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    inquirer
      .prompt([
        {
          type: "list",
          name: "selection",
          message: "Which option would you like to choose?",
          choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Change Stock Quantity",
            "Add New Product"
          ]
        }
      ])
      .then(function(menuItems) {
        console.log(menuItems.selection);
        switch (menuItems.selection) {
          case "View Products for Sale":
            productsList(res);
            connection.end();
            break;
          case "View Low Inventory":
            lowInventory(res);
            connection.end();
            break;
          case "Change Stock Quantity":
            changeStockQuantity(res);
            break;
          case "Add New Product":
            addNewProduct(res);
            break;

          default:
            console.error("WOOPS!");
            break;
        }
      });
  });
}

// function
// "View Products for Sale",
var productsList = function(productList) {
  var table = new Table({
    head: [
      "item_id",
      "product_name",
      "department_name",
      "price",
      "stock_quantity"
    ],
    colWidths: [10, 30, 30, 10, 20]
  });
  for (var i = 0; i < productList.length; i++) {
    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    table.push([
      productList[i].item_id,
      productList[i].product_name,
      productList[i].department_name,
      productList[i].price,
      productList[i].stock_quantity
    ]);
  }
  console.log(chalk.black.bgWhite(table.toString()));
  //   console.log("-----------------------------------");
};
// "View Low Inventory",
var lowInventory = function(currentStock) {
  var lowInventory = [];
  for (var i = 0; i < currentStock.length; i++) {
    if (currentStock[i].stock_quantity < 5) {
      lowInventory.push(currentStock[i]);
    }
  }
  productsList(lowInventory);
};

// "Add to Inventory",
var changeStockQuantity = function(changeStockQuantity) {
  productsList(changeStockQuantity);
  console.log("-----------------------------------");
  inquirer
    .prompt([
      {
        type: "input",
        name: "item_id",
        message: "What is the ID # of the item you would like to change?"
      },
      {
        type: "input",
        name: "quantity",
        message: "What is the new quantity?"
      }
    ])
    .then(function(response) {
      var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: response.quantity
          },
          {
            item_id: response.item_id
          }
        ],
        function(err, res) {
          connection.query(
            "SELECT * FROM products WHERE ?",
            [
              {
                item_id: response.item_id
              }
            ],
            function(err, res) {
              console.log("Stock quantity updated for:");
              productsList(res);
            }
          );
        }
      );
    });
};

// "Add New Product"
var addNewProduct = function(newProduct) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "product_name",
        message: "What is the name of the product?"
      },
      {
        type: "input",
        name: "department_name",
        message: "What is the name of the department?"
      },
      {
        type: "input",
        name: "price",
        message: "What is the price?"
      },
      {
        type: "input",
        name: "stock_quantity",
        message: "What is the stock quantity?"
      }
    ])
    .then(function({ product_name, department_name, price, stock_quantity }) {
      var query = connection.query(
        "INSERT INTO products SET ?",
        {
          product_name,
          department_name,
          price,
          stock_quantity
        },
        function(err, res) {
          console.log(res.affectedRows + " new item added\n");
          connection.query("SELECT * FROM products", function(err, res) {
            productsList(res);
          });
        }
      );
    });
};
