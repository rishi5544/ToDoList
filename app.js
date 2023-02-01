//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://red:ilimaspahat@todolistcluster.cscaau0.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String,
  priorityIndex: Number,
  status:String

};

const Item = mongoose.model("Item", itemsSchema);

const userSchema = {
  name: String,
  email: String,
  password: String,
  state: Boolean,
  items: [itemsSchema]


};

const User = mongoose.model("User", userSchema);


const item1 = new Item({
  name: "Welcome to your todolist!",
  priorityIndex: -5,
  status:"pending"
});

const item2 = new Item({
  name: "Hit the + button to add a task.",
  priorityIndex: -4,
  status:"pending"
});

const item3 = new Item({
  name: "Hit trash icon to delete the task.",
  priorityIndex: -3,
  status:"pending"
});

const item4 = new Item({
  name: "Hit close icon to cancel the task.",
  priorityIndex: -2,
  status:"pending"
});

const item5 = new Item({
  name: "<-- Check box after completion of task the task.",
  priorityIndex: -1,
  status:"pending"
});
const defaultItems = [item1, item2, item3,item4,item5];




///////////////////////////   home   /////////////////////////
app.route("/list")
  .get(function (req, res) {
   
    const username = req.query.user
    User.findOne({ name: username }, function (err, foundUser) {
      if (!err) {
        if(!foundUser){
          res.redirect("/")
        }
        else{
          if(foundUser.state){
            // console.log(foundUser.items)
            var pendingItems=foundUser.items.filter(function(obj){return obj["status"]=="pending"})
            pendingItems.sort(function(a,b){return parseInt(b["priorityIndex"])-parseInt(a["priorityIndex"])})
            var closedItems=foundUser.items.filter(function(obj){return obj["status"]=="closed"})
            var completedItems=foundUser.items.filter(function(obj){return obj["status"]=="completed"})
            res.render("list", { listTitle: "Today", newCompletedListItems:completedItems,newPendingListItems: pendingItems,logoutLink:"/logout/"+username,user:username,newClosedListItems:closedItems})
          }
          else{res.redirect("/")}
          
        }
        
      }
    });

  })
  .post(function (req, res) {

    const itemName = req.body.newItem;
    const username = req.query.user
    const priority=req.body.priorityNumber
    

    

    User.findOne({ name: username }, function (err, foundUser) {
      if (!err) {
        if(foundUser){
          const item = new Item({
            name: itemName,
            priorityIndex:priority,
            status:"pending"
          });
          foundUser.items.push(item)
          foundUser.save(function(err,result){
            if(!err){
              res.redirect("/list/?user=" + username);
            }
          })
          
        }
      }
    });

  });


///////////////////////////   register   /////////////////////////
app.route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const confirmedPassword = req.body.confirmedPassword

    if (password == confirmedPassword) {
      User.findOne({ name: username }, function (err, foundUser) {
        if (!err) {
          if (!foundUser) {
            //Create a new list
            const user = new User({
              name: username,
              email: email,
              password: password,
              state:true,
              items: defaultItems
            });
            user.save(function(err,result){
              if(!err){
                res.redirect("/list/?user=" + username);
              }
            });
             
            
          } else {
            //Show an existing list
  
            res.redirect("/list/?user=" + username);
          }
        }
      });
       
    }
    else{
      res.redirect("/register")
    }
    


    


  })

///////////////////////////   login   /////////////////////////
app.route("/")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const username = req.body.username
    const password = req.body.password

    
     

    User.findOneAndUpdate({name: username}, {state:true},function(err, foundUser){
      if (!err){
        if (!foundUser){
          res.redirect("/");
        } else {
          if(password==foundUser.password){

            res.redirect("/list/?user="+username)
          }
          else{
            res.redirect("/");
          }

          
        }
      }
    });


  })

///////////////////////////   logout   /////////////////////////
app.route("/logout/:user?")
  .get(function (req, res) {
    const username=req.params.user
 
    User.findOneAndUpdate({name: username}, {state:false},function(err,foundUser){
      if(!err){
        if(foundUser){
          
          res.redirect("/")
        }
        
      }
    });
  })

///////////////////////////   delete   /////////////////////////
app.post("/delete", function (req, res) {
   
  const objectId = req.body.objectId;
  const username=req.body.username
  
  User.findOneAndUpdate({name: username}, {$pull: {items: {_id: objectId}}}, function(err, foundUser){
    if (!err){

      res.redirect("/list/?user=" + username);
    }
  });

}

);

///////////////////////////   close   /////////////////////////
app.post("/close", function (req, res) {
   
  const objectId = req.body.objectId;
  const username=req.body.username
  
  User.findOne({name:username}, function(err, foundUser){
    if (!err){
      var items=foundUser.items
      var status=items[items.findIndex(function(item){return item["_id"]==objectId})]["status"]
      if (status=="closed"){
        items[items.findIndex(function(item){return item["_id"]==objectId})]["status"]="pending"
      } 
      else{
        items[items.findIndex(function(item){return item["_id"]==objectId})]["status"]="closed"
      }
      foundUser.save(function(err,result){
        if(!err){
          res.redirect("/list/?user=" + username);
        }
      })
     
    }
    else{
      console.log(err)
    }
  });

}

);

///////////////////////////   complete  /////////////////////////
app.post("/complete", function (req, res) {
  // console.log("completed called")
  const objectId = req.body.objectId;
  const username=req.body.username
  
  User.findOne({name:username}, function(err, foundUser){
    if (!err){
      var items=foundUser.items
      items[items.findIndex(function(item){return item["_id"]==objectId})]["status"]="completed"
      foundUser.save(function(err,result){
        if(!err){
          res.redirect("/list/?user=" + username);
        }
      })
     
    }
    else{
      console.log(err)
    }
  });

}

);

// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
