const Title = require("./assets/js/appTitle");
const inquirer = require("inquirer");
const mysql = require("mysql");

let title = new Title();

const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3000,

    // Your username
    user: "root",

    // Your password
    password: "mola18nomA",
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
                    "Add Employees",
                    "Update Employee Role",
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
            } else if (res.menu === "Add Employees") {
                addEmployeeSql();
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


// SQL


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

