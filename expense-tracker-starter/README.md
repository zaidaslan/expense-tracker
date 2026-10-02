# Expense Tracker
Expense Tracker is a full-stack web application for managing personal expenses. Users can add, edit, delete, and filter expenses, while the application displays summary information such as the total amount, number of expenses, and highest expense.

## How to run

**Backend**

1.Open the project folder in VS Code.
2.Open a terminal inside the backend folder.
3.Make sure PostgreSQL is running.

4.Create a PostgreSQL database named: expense_tracker
5.Run the schema.sql file in PostgreSQL to create the required tables.
6.Create a .env file inside the backend folder.
7.Add the following configuration to the .env file:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
8.Replace your_password with your PostgreSQL password.
9.Install the backend dependencies: npm init -y , npm install express, npm install cors 
10.Start the backend server:node server.js

**Frontend**

1.Open the frontend folder in VS Code.
2.Open index.html using the Live Server extension.
3.The application will open in the browser.
4.Make sure the backend server is running while using the application.


## Features

- [x] Add an expense (with validation)
- [x] Delete an expense
- [x] Edit an expense
- [x] Filter by category
- [x] Summary cards (total, count, highest)
- [x] Data is saved in a PostgreSQL database

## Screenshots

i made a file , the path is backend/ss of my app(desktop and mobile).

## What was the hardest part?

The hardest part was connecting between backend, frontend and the database and making sure how the data was correctly sent and received through the API.
and what the meaning of CORS and the Same Orining Policy


## GITHUB Link



## VIDEO  link