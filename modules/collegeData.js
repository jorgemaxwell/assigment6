/*********************************************************************************
*  WEB700 – Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Jorge Barcasnegras Student ID: 156530214 Date: 05-02-2023
*
********************************************************************************/ 



const Sequelize = require('sequelize');
var sequelize = new Sequelize('voxlwebp', 'voxlwebp', 'wlVzgK1O5NokYhKCcxLxjsslr4GdPPYn', {
    host: 'raja.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});


var Student = sequelize.define("Student", {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
});

var Course = sequelize.define("Course", {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING,
});

Course.hasMany(Student, { foreignKey: "course" });


//-------------------------------------------

module.exports.initialize = async function () {
    try {
        await sequelize.sync();
        return "Operation was a success";
    } catch (error) {
        throw new Error("Unable to sync the database");
    }
}

module.exports.getAllStudents = async function() {
  try {
    const students = await Student.findAll();
    return students;
  } catch (error) {
    throw new Error("no results returned");
  }
};

module.exports.getStudentsByCourse = function (course) {
  console.log(typeof course);
  return Student.findAll({
    where: {
      course,
    },
  })
    .then(function (students) {
      return students;
    })
    .catch(function () {
      throw new Error("no results returned");
    });
};

module.exports.getStudentByNum = function (num) {
  return Student.findOne({
    where: {
      num: num
    }
  })
  .then(function (student) {
    if (!student) {
      throw new Error("no results returned");
    }
    return student;
  });
};

module.exports.getCourses = async function () {
    try {
        const courseList = await Course.findAll();
        return courseList;
    } catch (error) {
        throw new Error("no results returned");
    }
};

module.exports.getCourseById = function (id) {
  return Course.findOne({
    where: {
      courseId: id
    }
  }).then(function (course) {
    if (!course) {
      throw new Error('No results returned');
    }
    return course;
  });
};

module.exports.addStudent = async function(studentData) {
  try {
    const payload = {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      addressStreet: studentData.addressStreet || null,
      addressCity: studentData.addressCity || null,
      addressProvince: studentData.addressProvince || null,
      TA: !!studentData.TA,
      status: studentData.status,
      course: studentData.course
    };

    const newStudent = await Student.create(payload);
    return "Successfully added";
  } catch (error) {
    throw new Error("Unable to create student");
  }
};

module.exports.updateStudent = function (studentData) {
    const payload = {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        addressStreet: studentData.addressStreet,
        addressCity: studentData.addressCity,
        addressProvince: studentData.addressProvince,
        TA: Boolean(studentData.TA),
        status: studentData.status,
        course: studentData.course,
    };

    for (let key in payload) {
        if (payload[key] === '') {
            payload[key] = null;
        }
    }

    return Student.update(payload, {
        where: {
            studentNum: studentData.studentNum,
        },
    }).then(() => {
        return "Successfully updated";
    }).catch(() => {
        throw "Unable to update student";
    });
};

module.exports.addCourse = function (course) {
  console.log(course);
  const payload = {
    courseCode: course.courseCode,
    courseDescription: course.courseDescription,
  };
  for (let key in payload) {
    if (payload[key] === "") {
      payload[key] = null;
    }
  }
  return Course.create(payload)
    .then(function () {
      return "Course successfully added";
    })
    .catch(function () {
      throw new Error("Unable to create course");
    });
};


module.exports.updateCourse = function (course) {
    return new Promise(function (resolve, reject) {
        const payload = {
            courseCode: course.courseCode,
            courseDescription: course.courseDescription,
        };
        for (let key in payload) {
            if (payload[key] == "") {
                payload[key] = null;
            }
        }
        Course.update(payload, {
            where: { courseId: course.courseId },
        })
            .then(function () {
                resolve("Successfully updated");
            })
            .catch(function () {
                reject("Unable to update course");
            });
    });
}

module.exports.deleteCourseById = (courseId) => {
  return Course.destroy({
    where: { courseId },
  })
    .then(() => "Successfully deleted")
    .catch(() => "Unable to delete course");
};

module.exports.deleteStudentByNum = function (studentNum) {
  return Student.destroy({ where: { studentNum } })
    .then(() => "Successfully deleted")
    .catch(() => Promise.reject("Unable to delete student"));
};

