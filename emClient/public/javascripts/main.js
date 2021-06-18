
/**
 * @title registrationDepartment
 * @notice A Function to register the details of the Event's in Event managment App
 * @dev Function to Handle the submit button Of Event Registration Page Form
 * @dev Private key of Registering User,Name of Event,Date of Event,
 * location and information regarding event is inputed by the user 
 * is assigned to data1,data2,data3,data4 and data5 correspondingly  
 */
// function registration(event) {
//     event.preventDefault();
//     const private = 'f3a1481d1070fef4acc125c9830d1a0c34423fcc3ad4fd2a93f09f45625f6347'
//     const data1 = private
//     const data2 = document.getElementById('name1').value
//     const data3 = document.getElementById('date1').value
//     const data4 = document.getElementById('packed1').value
//     const data5 = document.getElementById('location1').value
//     const data6 = document.getElementById('info1').value
//     const data7 = document.getElementById('category').value
//     const data8 = document.getElementById('quantity1').value
//     console.log(data1);
//     console.log(data2);
//     console.log(data3);
//     console.log(data4);
//     console.log(data5);
//     console.log(data6);
//     console.log(data7);
//     console.log(data8);
//     if (data1.length == 0 || data2.length == 0 || data3.length == 0 || data4.length == 0 || data5.length == 0 || data6.length == 0 || data7.length == 0 || data8.length == 0 ) {
//         alert("Please Fill The Form Completely");
//     }
//     else {
//         $.post('/registration', { write1: data1, write2: data2, write3: data3, write4: data4, write5: data5, write6: data6, write7: data7, write8: data8}, function (data) {
//             if (data.status != 202) {
//                 alert(data.message);
//             }
//         }, 'json');
//     }
// }

// function viewData(event) {
//     event.preventDefault();
//     const data1 = document.getElementById('date2').value
//     console.log(data1);
//         if (data1.length == 0) {
//         alert("Please Fill The Form Completely")
//     }
//     else {
//         $.post('/state', { write1: data1}, function (data) {
            
//             if (data.status != 202)
//                 alert("Event Data on " + data1 + " Viewed:");

              
            
//             // document.getElementById("result1").value = data.balance[0];
//             // document.getElementById("result2").value = data.balance[1];
//             // document.getElementById("result3").value = data.balance[2];
//             // document.getElementById("result4").value = data.balance[3];
//             // document.getElementById("result5").value = data.balance[4];
//             // document.getElementById("result6").value = data.balance[5];
//             // document.getElementById("result7").value = data.balance[6];
           
//         }, 'json');
//     }
// }

/**
 * @title viewData
 * @notice A Function to View the details of Event under 
 * Transaction Family "Event_Managment_App", When a date is given
 * @dev Function to Handle the submit button Of Event Details Page Form
 * @dev Date inputed by User and is assigned to data1 
 */
// function viewData(event) {
//     event.preventDefault();
//     const data1 = document.getElementById('date2').value
//     console.log(data1);
//         if (data1.length == 0) {
//         alert("Please Fill The Form Completely")
//     }
//     else {
//         $.post('/state', { write1: data1}, function (data) {
            
//             if (data.status != 202)
//                 alert("Event Data on " + data1 + " Viewed:")
//             document.getElementById("result1").value = data.balance[0];
//             document.getElementById("result2").value = data.balance[1];
//             document.getElementById("result3").value = data.balance[2];
//             document.getElementById("result4").value = data.balance[3];
//             document.getElementById("result5").value = data.balance[4];
//             document.getElementById("result6").value = data.balance[5];
//             document.getElementById("result7").value = data.balance[6];
           
//         }, 'json');
//     }
// }

/**
 * @title deleteData
 * @notice A Function to Delete the details of Event Under 
 * Transaction Family "Event_Managment_App", When Private Key Of User and Date of Event is Given
 * @dev Function to Handle the submit button Of Event Deletion Page Form
 * @dev Private key of User and Date is inputed by User and  
 * is assigned to data1,data2 correspondingly  
 */

function add(){
    
    Swal.fire({
        title: 'Item added to cart',
        icon: 'success',
       
        timer: 1000,
        showCancelButton: false,
        showConfirmButton: false
        
      }).then(function() {
        window.location = "/cart";
    });
 
}
function rem(){
    
    Swal.fire({
        title: 'Item removed from cart',
        icon: 'success',
       
        timer: 1000,
        showCancelButton: false,
        showConfirmButton: false
        
      }).then(function() {
        window.location = "/home";
    });
 
}
function addwish(){
    
    Swal.fire({
        title: 'Item added to wishlist',
        icon: 'success',
       
        timer: 1000,
        showCancelButton: false,
        showConfirmButton: false
        
      }).then(function() {
        window.location = "/home";
    });
 
}
function remwish(){
    
    Swal.fire({
        title: 'Item removed from wishlist',
        icon: 'success',
       
        timer: 1000,
        showCancelButton: false,
        showConfirmButton: false
        
      }).then(function() {
        window.location = "/home";
    });
 
}

function deleteData(event) {
    event.preventDefault();
    const data1 = document.getElementById('private3').value
    const data2 = document.getElementById('date3').value
    console.log(data1);
    console.log(data2);
    if (data1.length == 0 || data2.length == 0) {
        alert("Please Fill The Form Completely")
    }
    else {
        $.post('/delete', { write1: data1, write2: data2 }, function (data) {
            if (data.status != 202)
                alert(data.message);
        }, 'json');
    }
}

/**
 * @title transactionReceiptData
 * @notice A Function to View the details of Transaction Receipt Data For Each Transaction 
 * When Transaction ID is Given.
 * @dev Function to Handle the submit button Of Transaction Receipt Page Form
 * @dev Transaction ID inputed by User is assigned to data1  
 */
function transactionReceiptData(event) {
    event.preventDefault();
    const data1 = document.getElementById('transactionId').value
    console.log(data1);
    if (data1.length == 0) {
        alert("Please enter the  Transaction ID")
    }
    else {
        $.post('/transactionReceipts', { write1: data1 }, function (data) {
            if (data.status != 202)
                alert("Transaction Receipt Data viewed of Transaction ID :" + data1)
            document.getElementById("result2").value = data.balance;
        }, 'json');
    }
}

/**
 * @title transactionIdData
 * @notice A Function to Display The Latest Transaction's ID 
 */
function transactionIdData(event) {
    event.preventDefault();
    $.post('/transactionID', {}, function (data) {
        if (data.status != 202)
            alert("Transaction Id viewed");
        document.getElementById("result3").value = data.balance;
    }, 'json');
}

/**
 * @title registrationEvent
 * @notice A Function to Handle The Custom Event Emitted and Alert It On Page
 * Events From Transaction Family "Event_Managment_App" 
 */
function registrationEvent(x) {
    if (x == 0) {
        alert("Event Registration is Done in Singapore");
        // location.reload();
    }
}

/**
 * @notice Handling the Event recieved via Socket in Event Registration Page
 */
if (location.pathname == '/registration') {
    var socket = io("http://localhost:3000");
    var x=0;
    socket.on('Word-Match-Event', () => {
        console.log("socket message recieved");
        registrationEvent(x);
        x=x+1;
    })
}

