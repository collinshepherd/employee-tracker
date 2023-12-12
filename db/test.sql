-- SELECT 
-- CONCAT(employee.first_name," ", employee.last_name) AS name
-- FROM employee;

-- SELECT 
--   employee.first_name, employee.last_name, employee.id
--   FROM employee

-- SELECT 
-- CONCAT(employee.first_name," ",employee.last_name) AS name, employee.id
-- FROM employee WHERE manager_id IS NULL;

-- UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?;

-- INSERT INTO employee (first_name, last_name, role_id, manager_id)
-- VALUES (?, ?, (SELECT id FROM role WHERE title = `${?}`), ?);

-- DELETE FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;

-- SELECT 
--     CONCAT(employee.first_name," ",employee.last_name) AS name, employee.id 
--     FROM employee WHERE manager_id IS NULL;

-- SELECT
-- CONCAT(employee.first_name, " ", employee.last_name) AS "name"
-- , department.name AS "department"
-- FROM employee

-- SELECT 
-- department.name
-- FROM department

-- SELECT 
-- role.title
-- FROM role;

-- INSERT INTO role (title, salary, department_id)
-- VALUES (?, ?, (SELECT id FROM department WHERE name = ?));

-- DELETE FROM role WHERE role.title = ?;

-- SELECT
-- CONCAT(employee.first_name, " ", employee.last_name) AS "name"
-- , department.name AS "department", role.salary
-- FROM employee
-- JOIN role ON employee.role_id = role.id
-- JOIN department ON role.department_id = department.id

-- INSERT INTO department (name)
-- VALUES (?)

-- DELETE FROM department WHERE department.name = ?;

-- Select all Employees with roles, department, and manager
-- SELECT
-- employee.id, employee.first_name, employee.last_name
-- , role.title, department.name AS "department", role.salary
-- , CONCAT (managers.first_name, " " , managers.last_name) as manager
-- FROM employee
-- JOIN role ON employee.role_id = role.id
-- JOIN department ON role.department_id = department.id
-- LEFT JOIN employee AS managers ON employee.manager_id = managers.id;

-- Select Managers 
-- SELECT 
-- CONCAT(employee.first_name," ",employee.last_name) AS name FROM employee WHERE manager_id IS NULL;