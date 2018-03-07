var SERVER_URL = 'http://ShoufhomNode-iam688687.codeanyapp.com:3000';

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


// This is executed whenever a page initializes

document.addEventListener('init', function(event) {
  var page = event.target;
  if (page.matches('#signIn')) {
    if (localStorage.getItem('isSignedIn') == "yes") {
    	document.getElementById('signIn_civilID').value = localStorage.getItem('civilID');
    	document.getElementById('signIn_password').value = localStorage.getItem('password');
    	signIn();
    }
  }
  else if (page.matches('#examTimes'))
  	fillExamTimeTable();
  	
  else if (page.matches('#checkUpcomingAppointments'))
  	fillUpcomingAppointmentsTable();
});

function goToHome() {
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

function signOut() {
	localStorage.clear();
	fn.load('signIn.html');
	ons.notification.toast('Signed out', {timeout: 4000});
}

function signIn() {
	
  var civilIDInput = document.getElementById('signIn_civilID');
  var passwordInput = document.getElementById('signIn_password');
  
  if (!civilIDInput.value || !passwordInput.value) {
  	ons.notification.alert('Please complete the form');
  	return;
  }
  
  var loginCredentials = {
    civilID: civilIDInput.value,
    password: passwordInput.value
  };
  
  var progressBar = document.getElementById('signInProgress');
  
  progressBar.innerHTML += '<ons-progress-bar indeterminate></ons-progress-bar>';
  
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
        progressBar.innerHTML = "";
      }
    }).fail(function (error) {
    ons.notification.alert('Connection error');
    progressBar.innerHTML = "";
  });
};

function signUp() {
	
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

function parseDateTime(sqlDateTime) {
	var dateTime = String(sqlDateTime).substr(0, 19);
    dateTime = dateTime.replace(/T|Z/gi, ' ');  
    dateTime = dateTime.split(/[- :]/);
    var utcDate = new Date(Date.UTC(dateTime[0], dateTime[1]-1, dateTime[2], dateTime[3], dateTime[4], dateTime[5]));
	return utcDate;
};

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function fillExamTimeTable() {
	var table = document.getElementById('examTimeTable');
	
	var request = {
		userID: localStorage.getItem('userID'),
		userRole: localStorage.getItem('userRole')
	};
	
	$.post(SERVER_URL + '/examtimes', request,
    	function (data) {		
    		if (request.userRole == 'Guardian') {
    			
    			for (var i = 0; i < data.length; i++) {
                    
                    var date = parseDateTime(data[i].examTime1);

    				table.innerHTML += '<ons-row><ons-col>' + data[i].subjectName +
    				'</ons-col><ons-col>' + date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() +
    				'</ons-col><ons-col>' + date.getHours() + ':' + pad(date.getMinutes(), 2) +
    				'</ons-col></ons-row>';
    			}
    			
    		}
    		else {
    			
    			table.innerHTML = '<ons-row>' + 
								  	'<ons-col class="tableHead">' +
										 'Exam'+
									'</ons-col>' +
									'<ons-col class="tableHead">' +
										 'Class'+
									'</ons-col>' +
									'<ons-col class="tableHead">' +
										 'Date'+
									'</ons-col>' +
									'<ons-col class="tableHead">' +
										 'Time'+
									'</ons-col>' +
								 '</ons-row>';
								 
				for (var i = 0; i < data.length; i++) {
                    
                    var date = parseDateTime(data[i].examTime1);
                    
    				table.innerHTML += '<ons-row><ons-col>' + data[i].subjectName +
    				'</ons-col><ons-col>' + data[i].gradeLevel + '-' + data[i].classNumber +
    				'</ons-col><ons-col>' + date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() +
    				'</ons-col><ons-col>' + date.getHours() + ':' + pad(date.getMinutes(), 2) +
    				'</ons-col></ons-row>';
    			}
    			
    		}
    	
    }).fail(function (error) {
    ons.notification.alert('Connection error');
  });
};


function fillUpcomingAppointmentsTable() {
	var table = document.getElementById('upcomingAppointmentsTable');
	
	var request = {
		userID: localStorage.getItem('userID'),
		userRole: localStorage.getItem('userRole')
	};
	
	$.post(SERVER_URL + '/checkappointments', request,
    	function (data) {
    		
    		if (!data[0]) {
    			ons.notification.toast('You have no upcoming appointments.', {timeout: 2000});
    			goToHome();
    		}
    			
    		for (var i = 0; i < data.length; i++) {
    			
    			var date = parseDateTime(data[i].meetingTime);
    			
    			table.innerHTML += '<ons-row><ons-col>' + data[i].fName + ' ' + data[i].lName +
    			'</ons-col><ons-col>' + date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() +
    			'</ons-col><ons-col>' + date.getHours() + ':' + pad(date.getMinutes(), 2) +
    			'</ons-col></ons-row>';
    		}
    }).fail(function (error) {
    ons.notification.alert('Connection error');
  });
	
		
	//console.log(table.innerHTML);
};

function openReportsPage() {
	
	userRole = localStorage.getItem('userRole');
	
	if (userRole == 'Guardian') {
		initReportsPage();
	}
	else {
		fn.load('reports_studentID_page.html');
	}
}

function reportStudentID() {
	studentIdInput = document.getElementById('reports_studentID_input');
	student = studentIdInput.value;
	
	console.log(student);
	
	var request = {
		studentID: student
	}
	
	$.post(SERVER_URL + '/checkstudentid', request,
    	function (data) {
    		console.log(data);
    		if (data == 'invalid_student') {
    			ons.notification.alert('Invalid student ID.');
    			studentIdInput.value = "";
    			
    		}
    		else {
    			localStorage.setItem('counsellorStudentID', student);
    			initReportsPage(student);
    		}
    		
    		
    }).fail(function (error) {
    	ons.notification.alert('Connection error');
  	});
}

function initReportsPage(student) {
	fn.load('reports_page.html');
	
  	var request = {
  		userID: localStorage.getItem('userID'),
  		studentID: student
  	}
  	
  	$.post(SERVER_URL + '/getyears', request,
    	function (data) {
    			var select = document.getElementById('reportsYearSelect');

	    		for (var i = 0; i < data.length; i++) {
	    			select.innerHTML += '<option value="' + data[i].termYear + '">' + data[i].termYear +'</option>';
	    		}
	    		fillReportsTable(select.value, student);
	    		
	    	}).fail(function (error) {
	    	ons.notification.alert('Connection error');
  		});
}

function updateReportsTable() {
	var select = document.getElementById('reportsYearSelect');
	var table = document.getElementById('reportsTable');
	
	table.innerHTML = '';
	
	var studentID = localStorage.getItem('counsellorStudentID');
	
	fillReportsTable(select.value, studentID);
}

function fillReportsTable(term, student) {
	var table = document.getElementById('reportsTable');
	
	var request = {
		termYear: term,
		userID: localStorage.getItem('userID'),
		studentID: student
	};
	
	$.post(SERVER_URL + '/gradereports', request,
    	function (data) {
    		for (var i = 0; i < data.length; i++) {

    			table.innerHTML += '<ons-row><ons-col>' + data[i].subjectName +
    			'</ons-col><ons-col>' + data[i].gradeLevel + '-' + data[i].classNumber +
    			'</ons-col><ons-col>' + data[i].fName + ' ' + data[i].lName +
    			'</ons-col><ons-col>' + data[i].grade1 +
    			'</ons-col></ons-row>';
    		}
    }).fail(function (error) {
    ons.notification.alert('Connection error');
  });
	
		
	//console.log(table.innerHTML);
};















