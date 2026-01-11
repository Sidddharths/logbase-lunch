// src/pages/Employee.jsx
import React from "react";
import EmployeeDashboard from "../components/EmployeeDashboard";

const Employee = ({ user }) => {
  return <EmployeeDashboard user={user} />;
};

export default Employee;
