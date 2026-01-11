import React, { useEffect, useState } from "react";
import DefaultMealSelector from "./DefaultMealSelector";
import DeviationPrompt from "./DeviationPrompt";
import ViewBillModal from "./ViewBillModal";
import FoodCodePopup from "../components/FoodCodePopup";
import "./EmployeeDashboard.css";

import { submitMealPreference } from "../services/api";




const EmployeeDashboard = () => {
  const [defaultMeal, setDefaultMeal] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [canDeviate, setCanDeviate] = useState(false);

  const userId = localStorage.getItem("userId"); // ✅ Load userId dynamically

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.userId;


  useEffect(() => {
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hour = istNow.getHours();

    // 8 AM to 9 AM IST = deviation window
    setCanDeviate(hour === 8);
  }, []);

  const handleDefaultSave = async (meal) => {
    setDefaultMeal(meal);
    try {
      const result = await submitMealPreference(userId, meal); // ✅ Use dynamic userId
      alert(result.message || "Meal preference submitted!");
    } catch (err) {
      alert("Failed to submit meal preference.");
    }
  };

  const handleDeviationSubmit = (meal) => {
    // TODO: Save deviation for today in backend
    alert(`Deviation submitted: ${meal}`);
  };

  console.log("Current User ID:", currentUserId);


  return (
    <div>
      <h2>Welcome to the Lunch Program</h2>
      <FoodCodePopup />

      <DefaultMealSelector
        selected={defaultMeal}
        onSave={handleDefaultSave}
      />

      {canDeviate && defaultMeal && (
        <DeviationPrompt onSubmit={handleDeviationSubmit} />
      )}

      <button className="viewBillButton" onClick={() => setShowBill(true)}>
        View Bill
      </button>

      <ViewBillModal
  isOpen={showBill}
  onClose={() => setShowBill(false)}
  userId={currentUserId}
/>

    </div>
  );
};

export default EmployeeDashboard;
