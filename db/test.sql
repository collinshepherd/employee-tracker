-- Select all Employees with roles, department, and manager
SELECT
employee.id, employee.first_name, employee.last_name
, role.title, department.name AS "department", role.salary
, CONCAT (managers.first_name, " " , managers.last_name) as manager
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
LEFT JOIN employee AS managers ON employee.manager_id = managers.id;

-- Select Managers 
SELECT 
CONCAT(employee.first_name," ",employee.last_name) AS name FROM employee WHERE manager_id IS NULL;