const express = require("express");
const mysql = require("mysql2");
const inquirer = require("inquirer");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "root",
    database: "employee_db",
  },
  console.log("Connected to the employee_db database")
);

const promptUser = () => {
  inquirer
    .prompt([
      {
        name: "choices",
        type: "list",
        message: "Please select an option:",
        choices: [
          "View All Employees",
          "View Employee By Manager",
          "Update Employee Role",
          "Update Employee Manager",
          "Add Employee",
          "Remove Employee",
          "View All Roles",
          "Add Role",
          "Remove Role",
          "View All Departments",
          "View All Employees By Department",
          "View Department Budgets",
          "Add Department",
          "Remove Department",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      const { choices } = answers;
      console.log(choices);
      switch (choices) {
        case "View All Employees":
          console.log("it ran");
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

        case "View all Roles":
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

        case "Exit": {
          //   prompt.ui.close();
        }
      }
    });
};

const viewAllEmployees = async () => {
  const sql = `SELECT
    employee.id, employee.first_name, employee.last_name
    , role.title, department.name AS "department", role.salary
    , CONCAT (managers.first_name, " " , managers.last_name) as manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS managers ON employee.manager_id = managers.id;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.table(result);
      promptUser();
    }
  });
};

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

const updateEmployeeManager = () => {
    let sql = 
};

const addEmployee = () => {};

const removeEmployee = () => {};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

promptUser();
