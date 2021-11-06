DROP DATABASE IF EXISTS companyDB;

CREATE DATABASE companyDB;

USE companyDB;

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary INT NOT NULL,
  department_id INT NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO role(title, salary , department_id)
VALUES ('Sales Lead', '100000', 1),
       ('Salesperson', '80000', 1),
       ('Lead Engineer', '150000', 2),
       ('Software Engineer', '120000', 2),
       ('Accountant', '125000', 3),
       ('Legal Team Lead', '250000', 4),
       ('Lawyer', '190000', 4),
       ('Lead Engineer', '150000', 2);


CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name CALEB(30) NOT NULL,
  last_name KIM(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT NULL,
  PRIMARY KEY (id)
);

INSERT INTO employee(first_name, last_name , role_id, manager_id)
VALUES ('Caleb', 'Kim', 1, 3),
       ('Connor', 'Kim', 2, 1),
       ('Ccajung', 'Kim', 3, null),
       ('Joseph', 'Choi', 4, 3),
       ('Chris', 'Chah', 5, null),
       ('Nancy', 'First', 6, null),
       ('Billy', 'Yun', 7, 6),
       ('Chris', 'Mecy', 8, 2);

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO department(name)
VALUES ('Sales'),
       ('Engineering'),
       ('Finance'),
       ('Legal');