// src/pages/Admin.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";
import DailyMealSummary from "../components/DailyMealSummary";
import EmployeeBillViewer from "../components/EmployeeBillViewer";
import VendorPaymentSummary from "../components/VendorPaymentSummary";
import MenuManager from "../components/MenuManager";
import DefaultMealSelector from "../components/DefaultMealSelector";
import EmployeeDashboard from "../components/EmployeeDashboard";
import HolidayManager from "../components/HolidayManager";

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />}>
        <Route index element={<>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>Admin Control Panel</h1>
          <p style={{ fontSize: '16px', color: '#666' }}>Select an option above to manage the lunch program effectively.</p>
        </>} />
        <Route path="daily-summary" element={<DailyMealSummary />} />
        <Route path="employee-bills" element={<EmployeeBillViewer />} />
        <Route path="vendor-summary" element={<VendorPaymentSummary />} />
        <Route path="menu-manager" element={<MenuManager />} />
        <Route path="holiday-manager" element={<HolidayManager />} />
        <Route path="admin-meal-selector" element={<EmployeeDashboard />} />
      </Route>
    </Routes>
  );
};

export default Admin;