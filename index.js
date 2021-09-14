const Title = require("./assets/js/appTitle");
const inquirer = require("inquirer");
const mysql = require("mysql");

let title = new Title();

const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "garahowai",
    database: "companyDB"
});

connection.connect((err) => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n\n");

    title.titleLogo();
    menuInquirer();
});



function menuInquirer() {
    let order = "";
    inquirer
        .prompt([
            {
                type: "rawlist",
                message: "What woud you like to do?",
                name: "menu",
                choices: [
                    "View All Employees",
                    "View All Employees By Department",
                    "View All Employees By Manager",
                    "Add Employees",
                    "Remove Employee",
                    "Update Employee Role",
                    "Update Employee Manager",
                    "View All Roles",
                    "Add Role",
                    "Remove Role",
                    "View All Departments",
                    "Add Departments",
                    "Remove Departments",
                    "EXIT"
                ]
            }
        ]).then(res => {
            // console.log(res);
            if (res.menu === "EXIT") {
                console.log("Close App...");
                connection.end();
                return;
            } else if (res.menu === "View All Employees") {
                order = "ORDER BY id"
                viewSql(order);
            } else if (res.menu === "View All Employees By Department") {
                order = "ORDER BY department"
                viewSql(order);
            } else if (res.menu === "View All Employees By Manager") {
                order = "ORDER BY manager"
                viewSql(order);
            } else if (res.menu === "Add Employees") {
                addEmployeeSql();
            } else if (res.menu === "Update Employee Manager") {
                updateEmployeeSql();
            } else if (res.menu === "Remove Employee") {
                deleteEmployeeSql();
            } else if (res.menu === "Update Employee Role") {
                updateEmployeeRole();
            } else if (res.menu === "View All Roles") {
                viewRoleSql();
            } else if (res.menu === "Add Role") {
                addRole();
            } else if (res.menu === "Remove Role") {
                deleteRoleSql();
            } else if (res.menu === "View All Departments") {
                viewDepartmentSql();
            } else if (res.menu === "Add Departments") {
                addDepartment();
            } else if (res.menu === "Remove Departments") {
                deleteDepartmentSql();
            }

        })
};

//////////////////////////////////////////////////////////////////////////////////////////
// SQL
function viewSql(order) {
    connection.query(`SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name,' ',m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
    ${order};`,
        function (err, res) {
            if (err) throw err;
            console.log();
            console.log(`id  first_name  last_name   title               department    salary      manager`);
            console.log(`--  ----------  ----------  ------------------  ------------  ----------  -------------------`);
            for (obj of res) {
                console.log(String(obj.id).padEnd(4) + obj.first_name.padEnd(12) + obj.last_name.padEnd(12) + String(obj.title).padEnd(20) + String(obj.department).padEnd(14) + String(obj.salary).padEnd(12) + obj.manager);
            }
            console.log();
            menuInquirer();
        }
    );
}

function viewRoleSql() {
    connection.query(`SELECT r.id, r.title, r.salary, d.name AS department FROM role r LEFT JOIN department d ON r.department_id = d.id`,
        function (err, res) {
            if (err) throw err;
            console.log();
            console.log(`id  title              salary    department`);
            console.log(`--  -----------------  --------  ---------------`);
            for (obj of res) {
                console.log(String(obj.id).padEnd(4) + obj.title.padEnd(19) + String(obj.salary).padEnd(10) + String(obj.department).padEnd(17));
            }
            console.log();
            menuInquirer();
        }
    );
}

function viewDepartmentSql() {
    connection.query(`SELECT * FROM department;`,
        function (err, res) {
            if (err) throw err;
            console.log();
            console.log(`id  department`);
            console.log(`--  -------------`);
            for (obj of res) {
                console.log(String(obj.id).padEnd(4) + obj.name.padEnd(19));
            }
            console.log();
            menuInquirer();
        }
    );
}

function addEmployeeSql() {
    connection.query(`SELECT CONCAT(first_name,' ',last_name) AS name, e.id AS manager_id, r.id AS role_id, r.title FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    UNION 
    SELECT CONCAT(e.first_name,' ',e.last_name) AS name, e.id AS manager_id, r.id AS role_id, r.title FROM role r
    LEFT JOIN employee e ON e.role_id = r.id`,
        function (err, res) {
            if (err) throw err;
            // console.log(res);
            let resultObj = res;
            let nameArrTemp = [];
            let roleArrTemp = [];
            nameArrTemp.push("None");
            for (obj of res) {
                if (obj.title === null) {

                } else {
                    roleArrTemp.push(obj.title);
                }
                if (obj.name === null) {

                } else {
                    nameArrTemp.push(obj.name);
                }
            }

            // Remove duplicate value
            let roleArr = roleArrTemp.filter((c, index) => {
                return roleArrTemp.indexOf(c) === index;
            });
            let nameArr = nameArrTemp.filter((c, index) => {
                return nameArrTemp.indexOf(c) === index;
            });

            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "What is the employee's first name?",
                        name: "first_name"
                    },
                    {
                        type: "input",
                        message: "What is the employee's last name?",
                        name: "last_name"
                    },
                    {
                        type: "rawlist",
                        message: "What is the employee's role?",
                        name: "role",
                        choices: roleArr
                    },
                    {
                        type: "rawlist",
                        message: "Who is the employee's manager?",
                        name: "managerName",
                        choices: nameArr
                    }
                ]).then((res) => {
                    // console.log(resultObj);
                    let roleID = 0;
                    let managerID = 0;
                    // let inputName = res.first_name + " " + res.last_name;
                    for (obj of resultObj) {
                        if (obj.title === res.role) {
                            roleID = obj.role_id;
                        }
                        if (obj.name === res.managerName) {
                            managerID = obj.manager_id;
                        }
                    }
                    if (managerID === 0) {
                        managerID = null;
                    }

                    if (roleID === 0) {
                        roleID = null;
                    }
                    // console.log(`Added ${res.first_name} ${res.last_name} role_Id: ${roleID} / Manager_Id ${managerID}`);
                    console.log(`Added ${res.first_name} ${res.last_name} to the database`);
                    connection.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ("${res.first_name}", "${res.last_name}", ${roleID}, ${managerID});`);
                    console.log();

                    menuInquirer();
                })
        }
    )
}

function updateEmployeeRole() {
    connection.query(`SELECT e.id, CONCAT(first_name,' ',last_name) AS name, r.title FROM employee e
    LEFT JOIN role r ON r.id = e.role_id
    UNION
    SELECT r.id, CONCAT(first_name,' ',last_name) AS name, r.title FROM employee e
    RIGHT JOIN role r ON r.id = e.role_id`,
        function (err, res) {
            if (err) throw err;
            let nameArrTemp = [];
            let roleArrTemp = [];
            let employeeArr = res;
            let employeeSelected = "";
            for (obj of res) {
                nameArrTemp.push(obj.name);
            }
            for (obj of res) {
                roleArrTemp.push(obj.title);
            }

            let nameArr = nameArrTemp.filter((c, index) => {
                return nameArrTemp.indexOf(c) === index;
            });
            let roles = roleArrTemp.filter((c, index) => {
                return roleArrTemp.indexOf(c) === index;
            });


            nameArr.push("CANCEL");
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        message: "Which employee's role do you want to change?",
                        name: "name",
                        choices: nameArr
                    }
                ]).then((res) => {
                    if (res.name === "CANCEL") {
                        menuInquirer();
                    } else {
                        employeeSelected = res.name;
                        inquirer
                            .prompt([
                                {
                                    type: "rawlist",
                                    message: "Which role do you want to assign?",
                                    name: "role",
                                    choices: roles
                                }
                            ]).then((res) => {
                                // console.log(employeeArr);
                                let id = 0;
                                for (obj of employeeArr) {
                                    if (res.role === obj.title) {
                                        id = obj.id;
                                    }
                                }


                                connection.query("UPDATE employee SET role_id = ? WHERE CONCAT(first_name,' ',last_name) = ?", [id, employeeSelected]);
                                console.log(`Updated ${employeeSelected}'s role as ${res.role} from the database`);
                                console.log();
                                menuInquirer();
                            });
                    }
                });
        })
}

function updateEmployeeSql() {
    connection.query(`SELECT id, CONCAT(first_name,' ',last_name) AS name FROM employee`,
        function (err, res) {
            if (err) throw err;
            // console.log(res);
            let nameArr = [];
            let employeeArr = res;
            let employeeSelected = "";
            for (obj of res) {
                nameArr.push(obj.name);
            }
            nameArr.push("CANCEL");
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        message: "Which employee's manager do you want to change?",
                        name: "name",
                        choices: nameArr
                    }
                ]).then((res) => {
                    if (res.name === "CANCEL") {
                        menuInquirer();
                    } else {
                        employeeSelected = res.name;
                        nameArr.splice(nameArr.indexOf(res.name), 1);
                        nameArr.splice(nameArr.indexOf("CANCEL"), 1);
                        nameArr.push("null");
                        inquirer
                            .prompt([
                                {
                                    type: "rawlist",
                                    message: "Which manager do you want to assign?",
                                    name: "name",
                                    choices: nameArr
                                }
                            ]).then((res) => {
                                // console.log(employeeArr);
                                let id = 0;
                                if (res.name === "null") {
                                    id = 0;
                                } else {
                                    for (obj of employeeArr) {
                                        if (res.name === obj.name) {
                                            id = obj.id;
                                        }
                                    }
                                }

                                connection.query("UPDATE employee SET manager_id = ? WHERE CONCAT(first_name,' ',last_name) = ?", [id, employeeSelected]);
                                console.log(`Updated ${employeeSelected}'s Manager as ${res.name} from the database`);
                                console.log();
                                menuInquirer();
                            });
                    }
                });
        })
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the Department's name?",
                name: "department_name"
            }
        ]).then((res) => {
            console.log(`Added ${res.department_name} to the database`);
            connection.query(`INSERT INTO department(name) VALUES ("${res.department_name}");`);
            console.log();

            menuInquirer();
        });
}

function addRole() {
    connection.query(`SELECT * FROM department;`,
        function (err, res) {
            if (err) throw err;
            let departmentArr = res;
            let departmentName = [];
            let departmentId = 0;
            for (obj of res) {
                departmentName.push(obj.name);
            }
            departmentName.push("Create New Department");
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "What is role's name?",
                        name: "roleName"
                    },
                    {
                        type: "input",
                        message: "How much is the salary?",
                        name: "salary"
                    },
                    {
                        type: "rawlist",
                        message: "Which department is the role in?",
                        name: "departmentName",
                        choices: departmentName
                    }
                ]).then((res) => {
                    if (res.departmentName === "Create New Department") {
                        console.log();
                        addDepartment();
                    } else {
                        for(obj of departmentArr){
                            if(res.departmentName === obj.name){
                                departmentId = obj.id;
                            }
                        }
                        console.log(`Added ${res.roleName} to the database`);
                        connection.query(`INSERT INTO role(title, salary, department_id) VALUES ("${res.roleName}", "${res.salary}", ${departmentId});`);
                        console.log();

                        menuInquirer();
                    }
                    
                })
        }
    )
}



function deleteEmployeeSql() {
    connection.query(`SELECT CONCAT(first_name,' ',last_name) AS name
    FROM employee;`,
        function (err, res) {
            if (err) throw err;
            let nameArr = [];
            for (obj of res) {
                nameArr.push(obj.name);
            }
            nameArr.push("CANCEL");
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        message: "Which employee do you want to remove?",
                        name: "name",
                        choices: nameArr
                    }
                ]).then((res) => {
                    if (res.name === "CANCEL") {
                        menuInquirer();
                    } else {
                        connection.query("DELETE FROM employee WHERE CONCAT(first_name,' ',last_name) = ?", [res.name]);
                        console.log(`Removed ${res.name} from the database`);
                        console.log();
                        menuInquirer();
                    }
                });
        }
    );
}

function deleteRoleSql() {
    connection.query(`SELECT title FROM role`,
        function (err, res) {
            if (err) throw err;
            // console.log(res);
            let nameArr = [];
            for (obj of res) {
                nameArr.push(obj.title);
            }
            nameArr.push("CANCEL");
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        message: "Which role do you want to remove?",
                        name: "role",
                        choices: nameArr
                    }
                ]).then((res) => {
                    if (res.name === "CANCEL") {
                        menuInquirer();
                    } else {
                        connection.query("DELETE FROM role WHERE title = ?", [res.role]);
                        console.log(`Removed ${res.role} from the database`);
                        console.log();
                        menuInquirer();
                    }
                });
        }
    );
}

function deleteDepartmentSql() {
    connection.query(`SELECT name FROM department`,
        function (err, res) {
            if (err) throw err;
            // console.log(res);
            let nameArr = [];
            for (obj of res) {
                nameArr.push(obj.name);
            }
            nameArr.push("CANCEL");
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        message: "Which Department do you want to remove?",
                        name: "name",
                        choices: nameArr
                    }
                ]).then((res) => {
                    if (res.name === "CANCEL") {
                        menuInquirer();
                    } else {
                        connection.query("DELETE FROM department WHERE name = ?", [res.name]);
                        console.log(`Removed ${res.name} from the database`);
                        console.log();
                        menuInquirer();
                    }
                });
        }
    );
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Be creating Common Function.
function deleteSql(table, columnName) {
    connection.query("SELECT ? FROM ?", [columnName, table],
        function (err, res) {
            if (err) throw err;
            console.log(res);
            let nameArr = [];
            for (obj of res) {
                nameArr.push(obj.name);
            }
            nameArr.push("CANCEL");
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        message: `Which ${table} do you want to remove?`,
                        name: "name",
                        choices: nameArr
                    }
                ]).then((res) => {
                    if (res.name === "CANCEL") {
                        menuInquirer();
                    } else {
                        connection.query("DELETE FROM ? WHERE name = ?", [table, res.name]);
                        console.log(`Removed ${res.name} from the database`);
                        console.log();
                        menuInquirer();
                    }
                });
        }
    );
}