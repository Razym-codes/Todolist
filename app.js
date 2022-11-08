//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const  _ = require('lodash');
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

// using new Date() method to get the date in JavaScript
var today = new Date()
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var day = today.toLocaleDateString("en-US", options)

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-razym:<password>@cluster0.7vfhvyp.mongodb.net/todoListDb");

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema)

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1 = new Item({ name: 'Welcome to todolist' });
const item2 = new Item({ name: '<-- press this to strike off an item' });
const item3 = new Item({ name: 'Press + to add an item to the list' });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }
        else{
          console.log("successfully saved dafault items to DB");
        }
      })
      res.redirect("/")
    }
    else {
      res.render("list", {listTitle: day, newListItems: foundItems});
    }

  })

// const day = date.getDate();


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === day){
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkboxx;
  const listName = req.body.list;

  if (listName === day){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err){
        console.log("successfully removed!");
        res.redirect("/")
      }
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName)
      }
    })
  }


})

app.get('/:customlistName', (req, res) => {
  const customlistName = _.capitalize(req.params.customlistName);

  List.findOne({ name: customlistName }, function (err, foundList) {
    if (!err){
      if (!foundList){
        // create a new list
        const list = new List({
          name: customlistName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customlistName)
      }
      else{
      // shows existig list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items} )
      }
    }
  });


})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
