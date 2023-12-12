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
          process.exit();
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

const removeDepartment = () => {
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
          message: "Which department would you like to remove?",
          choices: departmentArray,
        },
      ])
      .then((answers) => {
        let sql = `DELETE FROM department WHERE department.name = ?;`;

        db.query(sql, [answers.selectedDepartment], (err) => {
          if (err) console.log(err);
          else {
            console.log(`${answers.selectedDepartment} Successfully Deleted`);
            promptUser();
          }
        });
      });
  });
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

promptUser();
