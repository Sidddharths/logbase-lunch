import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./DailyMealSummary.css";

const DailyMealSummary = () => {
  const [mealData, setMealData] = useState([]);
  const [date, setDate] = useState("");
  const [mealTypes, setMealTypes] = useState([]);
  

  useEffect(() => {
  const today = new Date().toLocaleDateString("en-IN");
  setDate(today);

  // Fetch meal summary
  fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/mealsummary")
    .then((res) => res.json())
    .then((data) => {
      console.log("🚀 Raw API Response:", data);

      if (Array.isArray(data)) {
        setMealData(data);
      } else if (Array.isArray(data.data)) {
        setMealData(data.data);
      } else {
        console.error("❌ Unexpected data shape:", data);
        setMealData([]);
      }
    })
    .catch((err) => console.error("❌ Error fetching meal data:", err));

  // Fetch menu config
  fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/getMenuItems")
    .then((res) => res.json())
    .then((menu) => {
      console.log("📦 Raw Menu Response:", menu);

      if (menu?.meals && menu?.addons) {
        const mealTypesFormatted = [
  ...menu.meals.map((meal) => ({ key: `meal-${meal.id}`, label: meal.name })),
  ...menu.addons.map((addon) => ({ key: `addon-${addon.id}`, label: addon.name })),
];


        console.log("✅ Constructed mealTypes:", mealTypesFormatted);
        setMealTypes(mealTypesFormatted);
      } else {
        console.warn("⚠️ Menu format unexpected:", menu);
        setMealTypes([]);
      }
    })
    .catch((err) => console.error("❌ Error fetching menu config:", err));
}, []);



  const calculateTotals = () => {
  const totals = {};
  mealTypes.forEach((type) => {
    totals[type.label] = mealData.reduce((sum, item) => sum + (item[type.label] || 0), 0);
  });
  return totals;
};



  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Lunch Plan - ${date}`, 14, 10);
    const rows = mealData.map((item) =>
  [item.name, ...mealTypes.map((type) => item[type.label] || 0)]
);
const totals = mealTypes.map((type) =>
  mealData.reduce((acc, curr) => acc + (curr[type.label] || 0), 0)
);

    rows.push(["Total", ...totals]);
    doc.autoTable({
      head: [["Employee", ...mealTypes.map((type) => type.label)]],
      body: rows,
    });
    doc.save(`LunchPlan_${date}.pdf`);
  };

  const totals = calculateTotals();

  return (
    <div className="meal-summary">
      <h2>🥗Lunch Plan for the Day</h2>
      <p>Date: {date}</p>

    <table>
  <thead>
  <tr>
    <th>Employee</th>
    {mealTypes.map((type) => (
      <th key={`header-${type.key}`}>{type.label}</th>
    ))}
  </tr>
</thead>
<tbody>
  {mealData.map((item, idx) => (
    <tr key={`row-${idx}`}>
      <td>{item.name}</td>
      {mealTypes.map((type, i) => (
  <td key={`cell-${idx}-${i}`}>{item[type.label] || 0}</td>
))}
    </tr>
  ))}
  <tr className="total-row">
    <td>Total</td>
    {mealTypes.map((type, i) => (
  <td key={`total-${i}`}>{totals[type.label] || 0}</td>
))}

  </tr>
</tbody>

</table>




{/* <button onClick={downloadPDF}>Download as PDF</button> */}

      <div className="order-details-box">
  <h3>Order Details</h3>
  <p><strong>Order Date:</strong> {date}</p>
  <ul>
    {mealTypes
      .filter(type => totals[type.label] > 0)  // Only show types with count > 0
      .map((type) => (
        <li key={type.key}>
          {type.label} Count: {totals[type.label]}
        </li>
      ))}
  </ul>
</div>
    </div>
  );
};

export default DailyMealSummary;
