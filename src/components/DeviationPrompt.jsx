import React, { useState, useEffect } from "react";
import "./DeviationPrompt.css";


const foodOptions = {
  NM: { label: "Normal Meal", price: 85 },
  CM: { label: "Chapathi Meal", price: 100 },
  E1: { label: "Egg", price: 15 },
  K: { label: "Chicken", price: 100 },
};

const DeviationPrompt = ({ defaultMeal, onDeviationSubmit }) => {
  const [deviation, setDeviation] = useState("");
  const [canDeviate, setCanDeviate] = useState(false);

  useEffect(() => {
    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hour = istNow.getHours();
    setCanDeviate(hour >= 8 && hour < 9);
  }, []);

  const handleSubmit = () => {
    if (onDeviationSubmit && deviation) {
      onDeviationSubmit(deviation);
      alert("Deviation submitted successfully!");
    }
  };

  if (!canDeviate) return null;

  return (
    <div >
      <h3>Do you want to deviate from your default lunch today?</h3>
      <select value={deviation} onChange={(e) => setDeviation(e.target.value)}>
        <option value="">-- Choose Different Meal --</option>
        {Object.entries(foodOptions).map(([key, val]) => (
          <option key={key} value={key}>
            {val.label} (₹{val.price})
          </option>
        ))}
      </select>
      <button onClick={handleSubmit} disabled={!deviation}>
        Submit Deviation
      </button>
    </div>
  );
};

export default DeviationPrompt;
