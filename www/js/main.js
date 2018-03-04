var SERVER_URL = 'https://ShoufhomNode-iam688687.codeanyapp.com';

// Dump all localStorage

var output = "LOCALSTORAGE DATA:\n------------------------------------\n";
if (localStorage.length) {
   for (var i = 0; i < localStorage.length; i++) {
       output += localStorage.key(i) + ': ' + localStorage.getItem(localStorage.key(i)) + '\n';
   }
} else {
   output += 'There is no data stored for this domain.';
}
console.log(output);


// This is executed when the signIn page initializes

document.addEventListener('init', function(event) {
  var page = event.target;
  if (page.matches('#signIn')) {
    if (localStorage.getItem('isSignedIn') == "yes") {
    	document.getElementById('signIn_civilID').value = localStorage.getItem('civilID');
    	document.getElementById('signIn_password').value = localStorage.getItem('password');
    	signIn();
    }
  }
});

var goToHome = function() {
	var userRole = localStorage.getItem('userRole');
        
        switch (userRole) {
        	case 'Guardian':
        		fn.load('guardianHome.html');
        		break;
        
        	case 'Teacher':
        		fn.load('teacherHome.html');
        		break;
        		
        	case 'Counsellor':
        		fn.load('counsellorHome.html');
        		break;
        }
}

var signOut = function() {
	localStorage.clear();
	fn.load('signIn.html');
	ons.notification.toast('Signed out', {timeout: 4000});
}

var signIn = function() {  
  var loginCredentials = {
    civilID: document.getElementById('signIn_civilID').value,
    password: document.getElementById('signIn_password').value
  };
  
  $.post(SERVER_URL + '/login', loginCredentials,
    function (data) {
      if (data.userRole) {
      	console.log(data.userRole);
      	
      	localStorage.setItem('civilID', loginCredentials.civilID);
      	localStorage.setItem('password', loginCredentials.password);
      	localStorage.setItem('userRole', data.userRole);
      	localStorage.setItem('userID', data.userID);
      	localStorage.setItem('isSignedIn', "yes");
      	
        ons.notification.toast('Login success, welcome ' + data.fName + '!', {timeout: 4000});
        
        var userRole = localStorage.getItem('userRole');
        
        switch (userRole) {
        	case 'Guardian':
        		fn.load('guardianHome.html');
        		break;
        
        	case 'Teacher':
        		fn.load('teacherHome.html');
        		break;
        		
        	case 'Counsellor':
        		fn.load('counsellorHome.html');
        		break;
        }
        
      } else {
        ons.notification.alert('Incorrect login information');
      }
    }).fail(function (error) {
    ons.notification.alert('Connection error');
  });
};

var signUp = function() {
	
  var password = document.getElementById('signUp_password').value;
  var cpassword = document.getElementById('signUp_cpassword').value;
  
  if (password != cpassword){
  	ons.notification.alert("The passwords don't match.");
  	return;
  }
	
  var newInfo = {
    fName: document.getElementById('signUp_fName').value,
    mName: document.getElementById('signUp_mName').value,
    lName: document.getElementById('signUp_lName').value,
    civilID: document.getElementById('signUp_civilID').value,
    phone: document.getElementById('signUp_phone').value,
    mobile: document.getElementById('signUp_mobile').value,
    email: document.getElementById('signUp_email').value,
    password: document.getElementById('signUp_password').value
  };
  
  $.post(SERVER_URL + '/signup', newInfo,
    function (data) {
      if (data.userRole) {
      	console.log(data.userRole);
      	
      	localStorage.setItem('civilID', newInfo.civilID);
      	localStorage.setItem('password', newInfo.password);
      	localStorage.setItem('userRole', data.userRole);
      	localStorage.setItem('userID', data.userID);
      	localStorage.setItem('isSignedIn', "yes");
      	
        ons.notification.toast('Signup success, welcome ' + data.fName + '!', {timeout: 4000});
        
        var userRole = localStorage.getItem('userRole');
        
        switch (userRole) {
        	case 'Guardian':
        		fn.load('guardianHome.html');
        		break;
        
        	case 'Teacher':
        		fn.load('teacherHome.html');
        		break;
        		
        	case 'Counsellor':
        		fn.load('counsellorHome.html');
        		break;
        }
        
      } else {
        ons.notification.alert('Incorrect login information');
      }
    }).fail(function (error) {
    ons.notification.alert('Connection error');
  });
};

var fillTimeTable = function() {
	var table = document.getElementById('examTimeTable');
	
	var examTimesRequest {
		userID: localStorage.getItem('userID'),
		userRole: localStorage.getItem('userRole')
	}
	
	$.post(SERVER_URL + '/examtimes', newInfo,
    	function (data) {
    		//if (examTimesRequest.userRole == )
    	
    }).fail(function (error) {
    ons.notification.alert('Connection error');
  });
	
	table.innerHTML += 
		'<ons-row>' + 
			'<ons-col>' +
				'test' +
			'</ons-col>' +
			'<ons-col>' +
				'123' +
			'</ons-col>' +
		'</ons-row>';
		
	//console.log(table.innerHTML);
}