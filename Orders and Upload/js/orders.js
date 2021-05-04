var quoteInfo = document.getElementById("quote-template").innerHTML;
var template = Handlebars.compile(quoteInfo);
var data = template({name: "Tomato", delivery: "12/10/2020", return: "22/10/2020", image: "images/1.jpg", address: "-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------"});
document.getElementById('data').innerHTML += data;

function check()
{

    var price = document.getElementById('p');
    if(isNaN(price.value)){
        alert("Enter a valid price")
    }
   
    
}