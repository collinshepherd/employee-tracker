// Importing and requiring everything for the application
const express = require("express");
const mysql = require("mysql2");
const inquirer = require("inquirer");

// Initializing the app and setting the port
const PORT = process.env.PORT || 3001;
const app = express();

// Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connecting to the database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "root",
    database: "employee_db",
  },
  console.log("Connected to the employee_db database")
);

// Questions function that will show all the choices and call the correct function after its selected
const promptUser = () => {
  inquirer
    .prompt([
      {
        name: "choices",
        type: "list",
        message: "Please select an option:",
        choices: [
          "View All Employees",
          "View All Employees By Department",
          "View Employee By Manager",
          "Update Employee Role",
          "Update Employee Manager",
          "Add Employee",
          "Remove Employee",
          "View All Roles",
          "Add Role",
          "Remove Role",
          "View All Departments",
          "View Department Budgets",
          "Add Department",
          "Remove Department",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      // Switch for each possible answer from the inquirer list
      // Inside each case they call the function that performs what they are supposed to do
      const { choices } = answers;
      console.log(choices);
      switch (choices) {
        case "View All Employees":
          viewAllEmployees();
          break;

        case "View All Departments":
          viewAllDepartments();
          break;

        case "View All Employees By Department":
          viewEmployeesByDepartment();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Update Employee Manager":
          updateEmployeeManager();
          break;

        case "View All Roles":
          viewAllRoles();
          break;

        case "Add Role":
          addRole();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "View Department Budgets":
          viewDepartmentBudget();
          break;

        case "Remove Department":
          removeDepartment();
          break;

        case "View Employee By Manager":
          viewEmployeeByManager();
          break;

        case "Exit": {
          console.log("Goodbye!");
          process.exit();
        }
      }
    });
};

// All of the upcoming functions do basically as the name says but any difference will be noted
// Displays all employee names in a table into the console
const viewAllEmployees = async () => {
  const sql = `SELECT
    employee.id, employee.first_name, employee.last_name
    , role.title, department.name AS "department", role.salary
    , CONCAT (managers.first_name, " " , managers.last_name) as manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS managers ON employee.manager_id = managers.id
    ORDER BY employee.id;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.table(result);
      promptUser();
    }
  });
};

// Asks the user and will run through to update an employees role
const updateEmployeeRole = () => {
  let sql = `SELECT 
    employee.first_name, employee.last_name, employee.id
    FROM employee`;

  let employeeNames = [];
  let rolesArray = [];

  db.query(sql, (err, employeesResults) => {
    if (err) console.log(err);
    else {
      employeesResults.forEach((name) =>
        employeeNames.push(name.first_name + " " + name.last_name)
      );
    }

    sql = `SELECT
    role.title, role.id
    FROM role;`;

    db.query(sql, (err, rolesResults) => {
      if (err) console.log(err);
      else {
        rolesResults.forEach((role) => rolesArray.push(role.title));
      }

      inquirer
        .prompt([
          {
            name: "selectedEmployee",
            type: "list",
            message: "Which employee needs to change roles?",
            choices: employeeNames,
          },
          {
            name: "selectedRole",
            type: "list",
            message: "What is their new role?",
            choices: rolesArray,
          },
        ])
        .then((answer) => {
          let employeeId;
          let roleId;

          employeesResults.forEach((name) => {
            if (
              answer.selectedEmployee === `${name.first_name} ${name.last_name}`
            ) {
              employeeId = name.id;
            }
          });

          rolesResults.forEach((role) => {
            if (answer.selectedRole === role.title) {
              roleId = role.id;
            }
          });

          sql = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?;`;
          db.query(sql, [roleId, employeeId], (err) => {
            if (err) console.log(err);
            console.log("Employee Role Successfully Updated");
            promptUser();
          });
        });
    });
  });
};

// Asks the user and will run through updating an employees manager
const updateEmployeeManager = () => {
  let sql = `SELECT 
    CONCAT(employee.first_name," ",employee.last_name) AS name, employee.id 
    FROM employee WHERE manager_id IS NULL;`;

  let managersArray = [];

  db.query(sql, (err, managersResult) => {
    if (err) console.log(err);
    else {
      managersResult.forEach((manager) => managersArray.push(manager.name));
    }

    sql = `SELECT 
    employee.first_name, employee.last_name, employee.id
    FROM employee`;

    let employeeNames = [];

    db.query(sql, (err, employeesResults) => {
      if (err) console.log(err);
      else {
        employeesResults.forEach((name) =>
          employeeNames.push(name.first_name + " " + name.last_name)
        );
      }
      inquirer
        .prompt([
          {
            name: "selectedEmployee",
            type: "list",
            message: "Who is getting a new manager?",
            choices: employeeNames,
          },
          {
            name: "newManager",
            type: "list",
            message: "Who is their new manager?",
            choices: managersArray,
          },
        ])
        .then((answers) => {
          let employeeId;
          let managerId;

          employeesResults.forEach((name) => {
            if (
              answers.selectedEmployee ===
              `${name.first_name} ${name.last_name}`
            ) {
              employeeId = name.id;
            }
          });

          managersResult.forEach((manager) => {
            if (answers.newManager === manager.name) {
              managerId = manager.id;
            }
          });

          sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?;`;
          db.query(sql, [managerId, employeeId], (err) => {
            if (err) console.log(err);
            else {
              console.log("Manager Updated Successfully");
              promptUser();
            }
          });
        });
    });
  });
};

// Adds a new employee to the database
const addEmployee = () => {
  let sql = `SELECT 
    CONCAT(employee.first_name," ",employee.last_name) AS name, employee.id 
    FROM employee WHERE manager_id IS NULL;`;

  let managersArray = ["None"];

  db.query(sql, (err, managersResult) => {
    if (err) console.log(err);
    else {
      managersResult.forEach((manager) => managersArray.push(manager.name));
    }

    let rolesArray = [];

    sql = `SELECT
    role.title, role.id
    FROM role;`;

    db.query(sql, (err, rolesResults) => {
      if (err) console.log(err);
      else {
        rolesResults.forEach((role) => rolesArray.push(role.title));
      }

      inquirer
        .prompt([
          {
            name: "firstName",
            type: "input",
            message: "Enter the first name of the employee",
          },
          {
            name: "lastName",
            type: "input",
            message: "Enter the last name of the employee",
          },
          {
            name: "roleName",
            type: "list",
            message: "Enter the role of the employee",
            choices: rolesArray,
          },
          {
            name: "managerName",
            type: "list",
            message: "Who is the manager of the employee?",
            choices: managersArray,
          },
        ])
        .then((answers) => {
          let managerId;

          if (answers.managerName === "None") {
            managerId = null;
          } else {
            managersResult.forEach((manager) => {
              if (answers.managerName === manager.name) {
                managerId = manager.id;
              }
            });
          }

          let sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES (?, ?, (SELECT id FROM role WHERE title = ?), ?);`;
          db.query(
            sql,
            [answers.firstName, answers.lastName, answers.roleName, managerId],
            (err) => {
              if (err) console.log(err);
              else {
                console.log("Employee Added Successfully");
                promptUser();
              }
            }
          );
        });
    });
  });
};

// Removes an existing employee from the database
const removeEmployee = () => {
  let sql = `SELECT 
    employee.first_name, employee.last_name, employee.id
    FROM employee`;

  let employeeNames = [];

  db.query(sql, (err, employeesResults) => {
    if (err) console.log(err);
    else {
      employeesResults.forEach((name) =>
        employeeNames.push(name.first_name + " " + name.last_name)
      );
    }
    inquirer
      .prompt([
        {
          name: "selectedEmployee",
          type: "list",
          message: "Which employee would you like to remove?",
          choices: employeeNames,
        },
      ])
      .then((answers) => {
        let firstName;
        let lastName;
        let sql = `DELETE FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;`;
        employeesResults.forEach((name) => {
          if (
            answers.selectedEmployee === `${name.first_name} ${name.last_name}`
          ) {
            firstName = name.first_name;
            lastName = name.last_name;
          }
        });
        db.query(sql, [firstName, lastName], (err) => {
          if (err) console.log(err);
          else {
            console.log("Employee Successfully Removed");
            promptUser();
          }
        });
      });
  });
};

// Asks which manager you would like to see their employees and then shows all of their employees
const viewEmployeeByManager = () => {
  let sql = `SELECT 
    CONCAT(employee.first_name," ",employee.last_name) AS name, employee.id 
    FROM employee WHERE manager_id IS NULL;`;

  let managersArray = [];

  db.query(sql, (err, managersResult) => {
    if (err) console.log(err);
    else {
      managersResult.forEach((manager) => managersArray.push(manager.name));
    }
    inquirer
      .prompt([
        {
          name: "managerName",
          type: "list",
          message: "Choose a manager:",
          choices: managersArray,
        },
      ])
      .then((answers) => {
        let managerId;

        managersResult.forEach((manager) => {
          if (answers.managerName === manager.name) {
            managerId = manager.id;
          }
        });

        let sql = `SELECT
        CONCAT(employee.first_name," ",employee.last_name) AS name
        FROM employee WHERE manager_id = ?;`;
        db.query(sql, [managerId], (err, result) => {
          if (err) console.log(err);
          else {
            console.table(result);
            promptUser();
          }
        });
      });
  });
};

// Asks which department you would like to see and then shows all employees in that department
const viewEmployeesByDepartment = () => {
  let sql = `SELECT
  CONCAT(employee.first_name, " ", employee.last_name) AS "name"
  , department.name AS "department"
  FROM employee
  JOIN role ON employee.role_id = role.id
  JOIN department ON role.department_id = department.id`;

  let departmentArray = [];

  db.query(sql, (err, employeeAndDepartment) => {
    if (err) console.log(err);

    let sql = `SELECT 
    department.name
    FROM department`;

    db.query(sql, (err, departmentName) => {
      if (err) console.log(err);
      else {
        departmentName.forEach((department) =>
          departmentArray.push(department.name)
        );
      }

      inquirer
        .prompt([
          {
            name: "selectedDepartment",
            type: "list",
            message:
              "Which department would you like to see the employees for?",
            choices: departmentArray,
          },
        ])
        .then((answers) => {
          let namesArray = [];

          employeeAndDepartment.forEach((employee) => {
            if (answers.selectedDepartment === employee.department) {
              namesArray.push(employee.name);
            }
          });
          console.log(answers.selectedDepartment, "Department");
          console.table(namesArray);
          promptUser();
        });
    });
  });
};

// Shows you all of the roles in the console log in a table
const viewAllRoles = () => {
  let sql = `SELECT 
  role.title as "roles"
  FROM role;`;

  db.query(sql, (err, result) => {
    if (err) console.log(err);
    else {
      console.table(result);
      promptUser();
    }
  });
};

// This adds a role to the database and also will check to make sure that it isn't a duplicate role
const addRole = () => {
  let departmentArray = [];

  let sql = `SELECT 
    department.name
    FROM department`;

  db.query(sql, (err, departmentName) => {
    if (err) console.log(err);
    else {
      departmentName.forEach((department) =>
        departmentArray.push(department.name)
      );
    }
    inquirer
      .prompt([
        {
          name: "newRole",
          type: "input",
          message: "What is the new role called?",
        },
        {
          name: "salary",
          type: "number",
          message: "What is the salary for this role?",
        },
        {
          name: "selectedDepartment",
          type: "list",
          message: "Which department is this in?",
          choices: departmentArray,
        },
      ])
      .then((answers) => {
        let duplicate = false;
        let sql = `SELECT 
        role.title
        FROM role;`;

        db.query(sql, (err, result) => {
          if (err) console.log(err);
          else {
            result.forEach((role) => {
              if (answers.newRole === role.title) {
                duplicate = true;
                console.log(
                  `${answers.newRole} is already a role. Please try again.`
                );
                addRole();
              }
            });
          }

          if (!duplicate) {
            sql = `INSERT INTO role (title, salary, department_id)
      VALUES (?, ?, (SELECT id FROM department WHERE name = ?));`;

            db.query(
              sql,
              [answers.newRole, answers.salary, answers.selectedDepartment],
              (err) => {
                if (err) console.log(err);
                else {
                  console.log("Role Added Successfully");
                  promptUser();
                }
              }
            );
          }
        });
      });
  });
};

// This will remove a role as long as there are not any employees already assigned to the role you try to remove
const removeRole = () => {
  let sql = `SELECT 
  role.title as "roles"
  FROM role;`;

  let rolesArray = ["Cancel"];

  db.query(sql, (err, result) => {
    if (err) console.log(err);
    else {
      result.forEach((role) => rolesArray.push(role.roles));
    }

    inquirer
      .prompt([
        {
          name: "selectedRole",
          type: "list",
          message: "Which role would you like to remove?",
          choices: rolesArray,
        },
      ])
      .then((answers) => {
        if (answers.selectedRole === "Cancel") {
          promptUser();
        } else {
          let sql = `
        DELETE FROM role WHERE role.title = ?;`;

          db.query(sql, [answers.selectedRole], (err) => {
            if (err) {
              console.log(
                `${answers.selectedRole} is in use by an employee. Please select a different role`
              );
              removeRole();
            } else {
              console.log("Role Removed Successfully");
              promptUser();
            }
          });
        }
      });
  });
};

// This will show all of the departments in the database in the console in a table
const viewAllDepartments = () => {
  let sql = `SELECT
  department.name AS "department"
  FROM department;`;

  db.query(sql, (err, result) => {
    if (err) console.log(err);
    else {
      console.table(result);
      promptUser();
    }
  });
};

// This will ask the user which department they want to know the budget for and then will output the total cost of that department (All of the employees salaries added together)
const viewDepartmentBudget = () => {
  let departmentArray = [];

  let sql = `SELECT 
    department.name
    FROM department`;

  db.query(sql, (err, departmentName) => {
    if (err) console.log(err);
    else {
      departmentName.forEach((department) =>
        departmentArray.push(department.name)
      );
    }

    inquirer
      .prompt([
        {
          name: "selectedDepartment",
          type: "list",
          message: "Which department would you like to see the employees for?",
          choices: departmentArray,
        },
      ])
      .then((answers) => {
        let totalBudget = 0;

        let sql = `SELECT
    CONCAT(employee.first_name, " ", employee.last_name) AS "name"
    , department.name AS "department", role.salary
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id`;

        db.query(sql, (err, employeeResult) => {
          if (err) console.log(err);

          employeeResult.forEach((employee) => {
            if (employee.department === answers.selectedDepartment) {
              totalBudget += parseInt(employee.salary);
            }
          });

          console.log(answers.selectedDepartment, "Budget");
          console.log("Total: ", totalBudget);
          promptUser();
        });
      });
  });
};

// This will allow the user to add a new department as long as it does not exist already
const addDepartment = () => {
  let sql = `SELECT
  department.name
  FROM department;`;

  let departmentArray = [];

  db.query(sql, (err, departmentResult) => {
    if (err) console.log(err);

    inquirer
      .prompt([
        {
          name: "selectedDepartment",
          type: "input",
          message: "Enter the name of the new department:",
        },
      ])
      .then((answers) => {
        let duplicate = false;
        departmentResult.forEach((department) => {
          if (answers.selectedDepartment === department.name) {
            console.log(
              `${answers.selectedDepartment} is already a department name. Please try again.`
            );
            duplicate = true;
            addDepartment();
          }
        });

        if (!duplicate) {
          let sql = `INSERT INTO department (name)
        VALUES (?)`;

          db.query(sql, [answers.selectedDepartment], (err) => {
            if (err) console.log(err);
            else {
              console.log(`${answers.selectedDepartment} Added Successfully`);
              promptUser();
            }
          });
        }
      });
  });
};

// This will let the user remove a department as long as there are no employees current assigned to any roles in that specific department
const removeDepartment = () => {
  let departmentArray = ["None"];

  let sql = `SELECT 
    department.name
    FROM department`;

  db.query(sql, (err, departmentName) => {
    if (err) console.log(err);
    else {
      departmentName.forEach((department) =>
        departmentArray.push(department.name)
      );
    }

    inquirer
      .prompt([
        {
          name: "selectedDepartment",
          type: "list",
          message: "Which department would you like to remove?",
          choices: departmentArray,
        },
      ])
      .then((answers) => {
        if (answers.selectedDepartment === "None") {
          promptUser();
        } else {
          let sql = `DELETE FROM department WHERE department.name = ?;`;

          db.query(sql, [answers.selectedDepartment], (err) => {
            if (err) {
              console.log(
                `The ${answers.selectedDepartment} department has employees inside. Please choose an empty department to remove it`
              );
              removeDepartment();
            } else {
              console.log(`${answers.selectedDepartment} Successfully Deleted`);
              promptUser();
            }
          });
        }
      });
  });
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

promptUser();
