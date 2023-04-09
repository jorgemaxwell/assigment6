
 /*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name:  Jorge BarcasnSegras Student ID: 156530214 Date: 25-03-2023
*
*  Online (Cyclic) Link: https://defiant-fox-fez.cyclic.app/
*
********************************************************************************/ 



var express = require("express");
var bodyParser = require('body-parser')
const collegedata = require('./modules/collegeData.js');
const exphdbs = require('express-handlebars');

var app = express();
var HTTP_PORT = process.env.PORT || 8080;


app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
  next();
});


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.hbs',exphdbs.engine({ extname: '.hbs',
helpers:{ navLink:  function(url, options){ return '<li' + ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                     '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
                },
  
  equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
  }
  }
  } 
));
app.set('view engine', '.hbs');

app.get("/", (req, res) => {
  res.render('home');
});

app.get("/about", (req, res) => {
  res.render('about');
});

app.get("/htmlDemo", (req, res) => {
  res.render('htmlDemo');
});

app.get("/studentsadd", (req,res) => {
  res.render(__dirname +'/views/addStudent.hbs');
});

app.get('/students', async (req, res) => {
  try {
    const AllStudents = await collegedata.getAllStudents();
    console.log(`Successfully retrieved ${AllStudents.length} students `);

    if (AllStudents.length > 0) {
      res.render('students', { student: AllStudents });
    } else {
      res.render('students', { message: 'no results' });
    }
  } catch (error) {
    console.error(error);
    res.render('students', { message: 'an error occurred' });
  }
});

app.post('/studentsadd', function (req, res) {

  collegedata
    .addStudent(req.body)
    .then(function () {
      res.redirect("/students");
    })
    .catch(function () {
      console.log("Error while aading student");
    });

});


     app.post("/student/update", (req, res) => {
      console.log(req.body);
      collegedata.updatestudent(req.body)
      .then(
        res.redirect("/students"))
  });
  

app.get('/students/course=:value',(req,res)=>{
   collegedata.getStudentsByCourse(req.params.value)
  .then((filteredStudents)=>{
    console.log(`Successfully retrieved ${filteredStudents.length} students with course ${req.params.value} `) 
    res.render('students',{student:filteredStudents})
  
  })
  
    .catch((error)=>res.send({message:"no results"}))
})

app.get('/courses', (req, res) => {
  collegedata.getCourses()
    .then((courses) => {
      console.log(`Successfully retrieved ${courses.length} number of courses `);
      if (courses.length > 0) {
        res.render('courses', {
          courses: courses,
        });
      } else {
        res.render('courses', { message: "No Results" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.render('error', { error: "Unable to retrieve courses" });
    });
});



app.get("/course/:id",(req,res)=>{
  if(req.params.id<=0){
      res.send("NO results");
  }else{
      collegedata.getCourseById(req.params.id)
      .then((foundCourse)=>{
        res.render('course', {course: foundCourse}); 
  }).catch(()=>{
      res.render('course', {message: "no results"});
  });
  }
});


app.get('/students/:num', (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};

  data.getStudentByNum(req.params.num).then((data) => {
    if (data) {
      viewData.student = data; //store student data in the "viewData" object as "student"
    } else {
      viewData.student = null; // set student to null if none were returned
    }
  }).catch(() => {
    viewData.student = null; // set student to null if there was an error 
  }).then(data.getCourses)
    .then((data) => {
      viewData.courses = data; // store course data in the "viewData" object as "courses"
      // loop through viewData.courses and once we have found the courseId that matches
      // the student's "course" value, add a "selected" property to the matching 
      // viewData.courses object
      for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }

    }).catch(() => {
      viewData.courses = []; // set courses to empty if there was an error
    }).then(() => {
      if (viewData.student == null) { // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData }); // render the "student" view
      }
    });
})



app.get('/courses/add', (req, res) => {
  res.render('addCourse')
})


app.post('/courses/add', (req, res) => {
  collegedata.addCourse(req.body)
    .then(res.redirect('/courses'))
})

app.post('/courses/update', (req, res) => {
  collegedata.updateCourse(req.body)
    .then(
      res.redirect("/courses"))
})



app.get("/course/:id", (req, res) => {
  if (req.params.id <= 0) {
    res.send("No results");
  } else {
    collegedata.getCourseById(req.params.id)
      .then((foundCourse) => {
        if (foundCourse) {
          res.render('course', { course: foundCourse });
        } else {
          res.status(400).send("Course Not Found");
        }
      }).catch(() => {
        res.render('course', { message: "No Results" });
      });
  }
});


app.get("/course/delete/:id", (req, res) => {
  collegedata
    .deleteCourseById(req.params.id)
    .then(function () {
      res.redirect("/courses");
    })
    .catch(function () {
      res.status(500).send("Unable to Remove Course/Course Not Found");
    });
});



app.get('/studentsadd', function (req, res) {
  res.render('addstudent')

});


app.post('/studentsadd', function (req, res) {

  collegedata
    .addStudent(req.body)
    .then(function () {
      res.redirect("/students");
    })
    .catch(function () {
      console.log("Error while adding student");
    });

});


app.post("/student/update", (req, res) => {
  console.log(req.body);
  collegedata.updateStudent(req.body)
    .then(
      res.redirect("/students"))
});


app.get('/students/course=:value', (req, res) => {
  collegedata.getStudentsByCourse(req.params.value)
    .then((filteredStudents) => {
      console.log(`Successfully retrieved ${filteredStudents.length} students with course ${req.params.value} `)
      res.render('students', { student: filteredStudents })

    })

    .catch((error) => res.send({ message: "no results" }))
})


app.get("/student/delete/:num", (req, res) => {
  collegedata
    .deleteStudentByNum(req.params.num)
    .then(function () {
      res.redirect("/students");
    })
    .catch(function () {
      res.status(500).send("Unable to Remove Student/Student Not Found");
    });
});




app.get('*', (req, res) => {
  res.status(404).send('Error 404 - page not found');
});



app.listen(HTTP_PORT, () => {
  console.log(`Server listening on port ${HTTP_PORT}`); 
  collegedata.initialize();
});
