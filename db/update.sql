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
SELECT 
    CONCAT(employee.first_name," ",employee.last_name) AS name, employee.id 
    FROM employee WHERE manager_id IS NULL;