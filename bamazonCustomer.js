var mysql = require("mysql");
var inquirer = require("inquirer");

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
    for (var i = 0; i < res.length; i++) {
      console.log(
        res[i].item_id +
          " | " +
          res[i].product_name +
          " | " +
          "$" +
          res[i].price +
          " | " +
          res[i].stock_quantity
      );
    }
    console.log("-----------------------------------");
    inquirer
      .prompt([
        {
          type: "input",
          name: "item_id",
          message: "What is the ID # of the item you would like to purchase?"
        },
        {
          type: "input",
          name: "quantity",
          message: "How many would you like to purchse?"
        }
      ])
      .then(function(itemRequest) {
        var index = res.findIndex(function(item) {
          return item.item_id == itemRequest.item_id;
        });
        var customerTotalPrice = itemRequest.quantity * res[index].price;
        if (itemRequest.quantity < res[index].stock_quantity) {
          console.log(itemRequest.item_id);
          console.log(
            "Congradulations! We have " +
              res[index].stock_quantity +
              " in stock."
          );
          console.log("Your total price is: $" + customerTotalPrice);
          var newQuantity = res[index].stock_quantity - itemRequest.quantity;
          updateStockQuantity(itemRequest.item_id, newQuantity);
        } else {
          console.log("Insufficient quantity!");
          connection.end();
        }
      });
  });
}

function updateStockQuantity(id, quantity) {
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      { stock_quantity: quantity },
      {
        item_id: id
      }
    ],
    function(err, res) {
      connection.end();
    }
  );
}
