 

var numberOfDeleteButtons = document.querySelectorAll(".delete-btn").length;

for (var i = 0; i < numberOfDeleteButtons; i++) {

  document.querySelectorAll(".delete-btn")[i].addEventListener("click", function() {

    // var form = document.getElementById("form-id");
    this.form.action="/delete"

  });

}

var numberOfCloseButtons = document.querySelectorAll(".close-btn").length;

for (var i = 0; i < numberOfCloseButtons; i++) {

  document.querySelectorAll(".close-btn")[i].addEventListener("click", function() {

    // var form = document.getElementById("form-id");
    this.form.action="/close"


  });

}

var numberOfCompleteBox = document.querySelectorAll(".complete-checkbox").length;
console.log(numberOfCompleteBox)
console.log(numberOfCloseButtons)
for (var i = 0; i < numberOfCompleteBox; i++) {

  document.querySelectorAll(".complete-checkbox")[i].addEventListener("change", function() {

    // var form = document.getElementById("form-id");
    console.log("something")
     
    this.form.action="/complete"
    this.form.submit()


  });

}