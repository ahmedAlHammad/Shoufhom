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
    else if (page.matches('#requestMeeting_guardian_subjectPage'))
        meeting_guardian_fillSubjectList();
    else if (page.matches('#requestMeeting_teacher_studentPage'))
        meeting_teacher_fillStudentList();
    else if (page.matches('#timeWindows'))
        timeWindows_fillInputs();
    else if (page.matches('#switchActiveStudent'))
        switchActiveStudent_getStudents();
    else if (page.matches('#switchActiveClass'))
        switchActiveClass_getClasses();

});

function goToHome() {
    var userRole = localStorage.getItem('userRole');

    switch (userRole) {
        case 'Guardian':
            fn.reset('guardianHome.html');
            break;

        case 'Teacher':
            fn.reset('teacherHome.html');
            break;

        case 'Counsellor':
            fn.reset('counsellorHome.html');
            break;
    }
}

function signOut() {
    localStorage.clear();
    fn.reset('signIn.html');
    ons.notification.toast('Signed out', {
        timeout: 4000, force: true
    });
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
        function(data) {
            if (data.userRole) {
                console.log(data.userRole);

                localStorage.setItem('civilID', loginCredentials.civilID);
                localStorage.setItem('password', loginCredentials.password);
                localStorage.setItem('userRole', data.userRole);
                localStorage.setItem('userID', data.userID);
                localStorage.setItem('isSignedIn', "yes");

                ons.notification.toast('Login success, welcome ' + data.fName + '!', {timeout: 4000, force: true});

                var userRole = localStorage.getItem('userRole');
                checkCloseAppointments()

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
        }).fail(function(error) {
        ons.notification.alert('Connection error');
        progressBar.innerHTML = "";
    });
};

function signUp() {

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

    var password = document.getElementById('signUp_password').value;
    var cpassword = document.getElementById('signUp_cpassword').value;

    if (!newInfo.fName || !newInfo.mName || !newInfo.lName || !newInfo.civilID || !newInfo.phone || !newInfo.mobile || !newInfo.email || !newInfo.password) {
        ons.notification.alert("Please complete the form.");
        return;
    }

    if (password != cpassword) {
        ons.notification.alert("The passwords don't match.");
        return;
    }

    $.post(SERVER_URL + '/signup', newInfo,
        function(data) {
            if (data.userRole) {
                console.log(data.userRole);

                localStorage.setItem('civilID', newInfo.civilID);
                localStorage.setItem('password', newInfo.password);
                localStorage.setItem('userRole', data.userRole);
                localStorage.setItem('userID', data.userID);
                localStorage.setItem('isSignedIn', "yes");

                ons.notification.toast('Signup success, welcome ' + data.fName + '!', {
                    timeout: 4000, force: true
                });

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
        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
};

function parseDateTime(sqlDateTime) {
    var dateTime = String(sqlDateTime).substr(0, 19);
    dateTime = dateTime.replace(/T|Z/gi, ' ');
    dateTime = dateTime.split(/[- :]/);
    var date = new Date(dateTime[0], dateTime[1], dateTime[2], dateTime[3] - 4, dateTime[4], dateTime[5], 0);
    return date;
};

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function initExamTimes() {
    var userRole = localStorage.getItem('userRole');
    
    if (userRole = 'Guardian') {
        var activeStudent = JSON.parse(localStorage.getItem('activeStudent'));
    
        if (!activeStudent) {
            ons.notification.toast('Please a student under "Switch active student"', {timeout: 4000, force: true});
            return;
        }
    }
    
    fn.load('examTimes.html');
}

function fillExamTimeTable() {
    var table = document.getElementById('examTimeTable');
    
    var activeStudent = JSON.parse(localStorage.getItem('activeStudent'));

    var request = {
        userID: localStorage.getItem('userID'),
        userRole: localStorage.getItem('userRole'),
        studentID: (activeStudent ? activeStudent.studentID : "")
    };
    
    console.log(request.studentID);

    $.post(SERVER_URL + '/examtimes', request,
        function(data) {
            if (request.userRole == 'Guardian') {

                for (var i = 0; i < data.length; i++) {

                    var date = parseDateTime(data[i].examTime1);

                    table.innerHTML += '<ons-row><ons-col>' + data[i].subjectName +
                        '</ons-col><ons-col>' + date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() +
                        '</ons-col><ons-col>' + date.getHours() + ':' + pad(date.getMinutes(), 2) +
                        '</ons-col></ons-row>';
                }

            } else {

                table.innerHTML = '<ons-row>' +
                    '<ons-col class="tableHead">' +
                    'Exam' +
                    '</ons-col>' +
                    '<ons-col class="tableHead">' +
                    'Class' +
                    '</ons-col>' +
                    '<ons-col class="tableHead">' +
                    'Date' +
                    '</ons-col>' +
                    '<ons-col class="tableHead">' +
                    'Time' +
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

        }).fail(function(error) {
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
        function(data) {

            if (!data[0]) {
                ons.notification.toast('You have no upcoming appointments.', {
                    timeout: 2000
                });
                goToHome();
            }

            for (var i = 0; i < data.length; i++) {

                var date = parseDateTime(data[i].meetingTime);

                table.innerHTML +=
                    '<ons-row><ons-col>' + data[i].fName + ' ' + data[i].lName +
                    '</ons-col><ons-col>' + date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() +
                    '</ons-col><ons-col>' + date.getHours() + ':' + pad(date.getMinutes(), 2) +
                    '</ons-col></ons-row>';
            }
        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });


    //console.log(table.innerHTML);
};

function openReportsPage() {

    userRole = localStorage.getItem('userRole');
    var activeStudent = JSON.parse(localStorage.getItem('activeStudent'));
    
    if (!activeStudent) {
        ons.notification.toast('Please a student under "Switch active student"', {timeout: 4000, force: true});
        return;
    }

    if (userRole == 'Guardian') {
        if (!activeStudent) {
            ons.notification.toast('Please a student under "Switch active student"', {timeout: 4000, force: true});
            return;
        }
        initReportsPage();
    } else {
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
        function(data) {
            console.log(data);
            if (data == 'invalid_student') {
                ons.notification.alert('Invalid student ID.');
                studentIdInput.value = "";

            } else {
                localStorage.setItem('counsellorStudentID', student);
                initReportsPage(student);
            }


        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
}

function initReportsPage(student) {
    fn.load('reports_page.html');
    
    var activeStudent = JSON.parse(localStorage.getItem('activeStudent'));

    var request = {
        userID: localStorage.getItem('userID'),
        studentID: (student ? student : activeStudent.studentID)
    }

    $.post(SERVER_URL + '/getyears', request,
        function(data) {
            var select = document.getElementById('reportsYearSelect');

            for (var i = 0; i < data.length; i++) {
                select.innerHTML += '<option value="' + data[i].termYear + '">' + data[i].termYear + '</option>';
            }
            fillReportsTable(select.value, request.studentID);

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
}

function updateReportsTable() {
    var select = document.getElementById('reportsYearSelect');
    var table = document.getElementById('reportsTable');
    var activeStudent = JSON.parse(localStorage.getItem('activeStudent'));
    var userRole = localStorage.getItem('userRole');

    table.innerHTML = '';

    if (userRole != 'Guardian')
        var studentID = localStorage.getItem('counsellorStudentID');
    else
        var studentID = activeStudent.studentID;

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
        function(data) {
            for (var i = 0; i < data.length; i++) {

                table.innerHTML +=
                    '<ons-row><ons-col>' + data[i].subjectName +
                    '</ons-col><ons-col>' + data[i].gradeLevel + '-' + data[i].classNumber +
                    '</ons-col><ons-col>' + data[i].fName + ' ' + data[i].lName +
                    '</ons-col><ons-col>' + data[i].grade1 +
                    '</ons-col></ons-row>';
            }
        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });


    //console.log(table.innerHTML);
};

function meeting_guardian_init() {
    
    var activeStudent = JSON.parse(localStorage.getItem('activeStudent'));
    
    if (!activeStudent) {
        ons.notification.toast('Please a student under "Switch active student"', {timeout: 4000, force: true});
        return;
    }
    
    fn.load('requestMeeting_guardian_subjectPage.html');
}

function meeting_guardian_fillSubjectList() {
    var list = document.getElementById('requestMeeting_guardian_subjectList');
    
    var activeStudent = JSON.parse(localStorage.getItem('activeStudent'));

    var request = {
        studentID: activeStudent.studentID,
        userID: localStorage.getItem('userID')
    };

    $.post(SERVER_URL + '/getstudentsubjects', request,
        function(data) {
            
            list.innerHTML = '<ons-row class="listHead"><ons-col>Teacher name</ons-col><ons-col>Subject</ons-col></ons-row>';
            
            for (var i = 0; i < data.length; i++) {
                list.innerHTML +=
                    '<ons-list-item onclick="meeting_guardian_goToTimePage(' +
                    data[i].userID + ',\'' + data[i].fName + '\',\'' + data[i].lName + '\',\'' + data[i].subjectName +
                    '\')" tappable><ons-row class="listItem"><ons-col>' +
                    data[i].fName + ' ' + data[i].lName +
                    '</ons-col><ons-col>' +
                    data[i].subjectName +
                    '</ons-col></ons-row></ons-list-item>';
            }
        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });


    //console.log(table.innerHTML);
};

function meeting_guardian_goToTimePage(teacherID, teacherFName, teacherLName, teacherSubjectName) {

    var teacher = {
        userID: teacherID,
        fName: teacherFName,
        lName: teacherLName,
        subjectName: teacherSubjectName
    };

    localStorage.setItem('meetingTeacher', JSON.stringify(teacher));
    fn.load('requestMeeting_timePage.html');
};

function meeting_teacher_init() {
    
    var activeClass = JSON.parse(localStorage.getItem('activeClass'));
    
    if (!activeClass) {
        ons.notification.toast('Please a class under "Switch active class"', {timeout: 4000, force: true});
        return;
    }
    
    fn.load('requestMeeting_teacher_studentPage.html');
}


function meeting_teacher_fillStudentList() {
    var list = document.getElementById('requestMeeting_teacher_studentList');
    
    var activeClass = JSON.parse(localStorage.getItem('activeClass'));

    var request = {
        subjectID: activeClass.subjectID
    };
    
    console.log(request.subjectID);

    $.post(SERVER_URL + '/getactivesubjectstudents', request,
        function(data) {
            
            list.innerHTML = '<ons-row class="listHead"><ons-col>Student name</ons-col><ons-col>Guardian name</ons-col></ons-row>';
            
            for (var i = 0; i < data.length; i++) {
                list.innerHTML +=
                    '<ons-list-item onclick="meeting_teacher_goToTimePage(\'' +
                    data[i].guardianID + '\',\'' + data[i].guardianfName + '\',\'' + data[i].guardianlName + '\',\'' + data[i].studentfName + '\',\'' + data[i].studentlName +
                    '\')" tappable>' + 
                    '<ons-row class="listItem"><ons-col>' +
                    data[i].studentfName + ' ' + data[i].studentlName +
                    '</ons-col><ons-col>' +
                    data[i].guardianfName + ' ' + data[i].guardianlName +
                    '</ons-col></ons-row></ons-list-item>';
            }
        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });


    //console.log(table.innerHTML);
};

function meeting_teacher_goToTimePage(guardianID, guardianfName, guardianlName, studentfName, studentlName) {

    var guardianStudent = {
        userID: guardianID,
        guardianfName: guardianfName,
        guardianlName: guardianlName,
        studentfName: studentfName,
        studentlName: studentlName
    };

    localStorage.setItem('meetingGuardian', JSON.stringify(guardianStudent));
    fn.load('requestMeeting_timePage.html');
};

function meeting_checkDate() {

    dateString = document.getElementById('requestMeeting_guardian_dateInput').value;
    timeContainer = document.getElementById('requestMeeting_timeContainer');
    var teacher = JSON.parse(localStorage.getItem('meetingTeacher'));
    if (teacher) var teacherName = teacher.fName + ' ' + teacher.lName;
    var guardian = JSON.parse(localStorage.getItem('meetingGuardian'));
    if (guardian) var guardianName = guardian.guardianfName + ' ' + guardian.guardianlName;
    var userID = localStorage.getItem('userID');
    var userRole = localStorage.getItem('userRole');

    var request = {
        selectedDate: dateString,
        teacherID: (userRole == 'Guardian') ? teacher.userID : userID
    };

    $.post(SERVER_URL + '/getavailablewindows', request,
        function(data) {
            
            console.log(data);
            
            if (data == 'unavailable') {
                if (userRole == 'Guardian')
                    timeContainer.innerHTML = '<h3 style="margin-top: 70px;">' + teacherName + ' will not be available on that day, please select another.' +
                                              '<br><br><ons-button style="width: 50%;" onclick="meeting_checkDate()">Check date</ons-button></p>';
                else
                    timeContainer.innerHTML = '<h3 style="margin-top: 70px;">You do not have an available time window on that day, please select another.' +
                                              '<br><br><ons-button style="width: 50%;" onclick="meeting_checkDate()">Check date</ons-button></p>';
            } else {
                var appointmentTime = dateString + ' ' + data.availableTime;

                if (userRole == 'Guardian')
                    timeContainer.innerHTML = '<h3 style="margin-top: 70px;">' + teacherName + ' will be available at ' + data.availableTime.substr(0, 5) +
                                              '<br>Create an appointment with them?' +
                                              '<br><br><ons-button style="width: 50%;" onclick="' +
                                              'meeting_createAppointment(\'' + userID + '\',\'' + teacher.userID + '\',\'' + appointmentTime + '\')' + 
                                              '">Confirm</ons-button></p>';
                else
                    timeContainer.innerHTML = '<h3 style="margin-top: 70px;">You have an available time window at ' + data.availableTime.substr(0, 5) +
                                              '<br>Create an appointment with ' + guardianName + '?' +
                                              '<br><br><ons-button style="width: 50%;" onclick="' +
                                              'meeting_createAppointment(\'' + guardian.userID + '\',\'' + userID + '\',\'' + appointmentTime + '\')' + 
                                              '">Confirm</ons-button></p>';
            }

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });


    //console.log(table.innerHTML);
};


function meeting_createAppointment(guardianID, teacherID, dateTime) {

    var request = {
        guardianID: guardianID,
        teacherID: teacherID,
        selectedDateTime: dateTime
    };

    $.post(SERVER_URL + '/bookAppointment', request,
        function(data) {

            if (data == 'success'){
                ons.notification.toast('Appointment successfully created', {timeout: 4000, force: true});
                goToHome();
            }
            else {
                ons.notification.alert('This appointment is already booked');
                meeting_goBack();
            }

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });


    //console.log(table.innerHTML);
};

function meeting_goBack() {
    var userRole = localStorage.getItem('userRole');
    var page = (userRole == 'Guardian') ? "requestMeeting_guardian_subjectPage.html" : "requestMeeting_teacher_studentPage.html";
    
    fn.load(page);
};

function timeWindows_fillInputs() {
    
    var sundayInput = document.getElementById('timeWindows_sunday');
    var mondayInput = document.getElementById('timeWindows_monday');
    var tuesdayInput = document.getElementById('timeWindows_tuesday');
    var wednesdayInput = document.getElementById('timeWindows_wednesday');
    var thursdayInput = document.getElementById('timeWindows_thursday');
    
    var request = {
        teacherID: localStorage.getItem('userID')
    };

    $.post(SERVER_URL + '/getTimeWindows', request,
        function(data) {

            if (data != 'no_timeWindows') {
                console.log(data.sunday);
                sundayInput.value = data.sunday;
                mondayInput.value = data.monday;
                tuesdayInput.value = data.tuesday;
                wednesdayInput.value = data.wednesday;
                thursdayInput.value = data.thursday;
            }
            else {
                ons.notification.toast('You do not have any time windows set.', {timeout: 4000, force: true});
            }

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
};

function timeWindows_update() {
    
    var sundayInput = document.getElementById('timeWindows_sunday');
    var mondayInput = document.getElementById('timeWindows_monday');
    var tuesdayInput = document.getElementById('timeWindows_tuesday');
    var wednesdayInput = document.getElementById('timeWindows_wednesday');
    var thursdayInput = document.getElementById('timeWindows_thursday');
    
    if (!sundayInput.value || !mondayInput.value || !tuesdayInput.value || !wednesdayInput.value || !thursdayInput.value) {
        ons.notification.alert('Please set a time window for every day');
        return;
    }
    
    var request = {
        teacherID: localStorage.getItem('userID'),
        sunday: sundayInput.value + ':00',
        monday: mondayInput.value + ':00',
        tuesday: tuesdayInput.value + ':00',
        wednesday: wednesdayInput.value + ':00',
        thursday: thursdayInput.value + ':00',
    };
    
    $.post(SERVER_URL + '/setTimeWindows', request,
        function(data) {

            if (data == 'success') {
                ons.notification.toast('Time windows successfully updated', {timeout: 4000, force: true});
                goToHome();
            }

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
};

function checkCloseAppointments() {
    
    var request = {
        userID: localStorage.getItem('userID'),
        interval: 10
    };
    
    $.post(SERVER_URL + '/checkAppointmentsWithin', request,
        function(data) {

            if (data != 'none') {
                ons.notification.alert('You have an upcoming appointment within 10 days from now, please check your appointments list.');
            }

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
};

function switchActiveStudent_getStudents() {
    
    var select = document.getElementById('switchActiveStudent_select');
    
    var request = {
        userID: localStorage.getItem('userID'),
    };
    
    $.post(SERVER_URL + '/getGuardianStudents', request,
        function(data) {

            if (data.length == 1) {
                ons.notification.toast('You have only one student.', {timeout: 4000, force: true});
                fn.pop();
            }

            for (var i = 0; i < data.length; i++) {
                select.innerHTML += '<option value="' + data[i].studentID + '">' + data[i].fName + '</option>';
            }

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
};

function switchActiveStudent_switchStudent() {
    
    var select = document.getElementById('switchActiveStudent_select');
    
    var request = {
        studentID: select.value,
    };
    
    $.post(SERVER_URL + '/checkstudentID', request,
        function(data) {

            var student = {
                studentID: data.studentID,
                fName: data.fName,
                mName: data.mName,
                lName: data.lName
            };
            
            localStorage.setItem('activeStudent', JSON.stringify(student));
            
            ons.notification.toast('Switched active student to ' + student.fName + '.', {timeout: 4000, force: true});
            goToHome();

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
};

function switchActiveClass_getClasses() {
    
    var select = document.getElementById('switchActiveClass_select');
    
    var request = {
        userID: localStorage.getItem('userID'),
    };
    
    $.post(SERVER_URL + '/getTeacherSubjects', request,
        function(data) {

            if (data.length == 1) {
                ons.notification.toast('You are teaching only one class', {timeout: 4000, force: true});
                fn.pop();
            }


            for (var i = 0; i < data.length; i++) {
                var classNumber = data[i].gradeLevel + '-' + data[i].classNumber;
                select.innerHTML += '<option value="' + data[i].subjectID + '">' + classNumber + '</option>';
            }

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
};

function switchActiveClass_switchClass() {
    
    var select = document.getElementById('switchActiveClass_select');
    
    var request = {
        subjectID: select.value,
    };
    
    $.post(SERVER_URL + '/getSingleSubject', request,
        function(data) {

            var subject = {
                subjectID: select.value,
                classNumber: data.gradeLevel + '-' + data.classNumber
            };
            
            console.log(select.innerHTML);
            
            localStorage.setItem('activeClass', JSON.stringify(subject));
            
            console.log(localStorage.getItem('activeClass'));
            
            ons.notification.toast('Switched active class to ' + subject.classNumber + '.', {timeout: 4000, force: true});
            goToHome();

        }).fail(function(error) {
        ons.notification.alert('Connection error');
    });
};

