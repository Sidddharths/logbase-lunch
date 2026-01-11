import React, { useEffect, useState } from "react";
import "./VendorPaymentSummary.css";

const VendorPaymentSummary = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    // Fetch dynamic vendor summary
    fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/vendor-summary")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Monthly Summary:", data);
        setMonthlyData(data);
        setFilteredData(data);
      })
      .catch((err) => console.error(" Error fetching monthly summary:", err));

    // Fetch menu config
    fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/getMenuItems")
      .then((res) => res.json())
      .then((menu) => {
        console.log("📦 Menu Config:", menu);
        if (menu?.meals && menu?.addons) {
          const allItems = [
            ...menu.meals.map((meal) => meal.name.toLowerCase().replace(" ", "")),
            ...menu.addons.map((addon) => addon.name.toLowerCase().replace(" ", ""))
          ];
          setColumns(allItems);
        }
      })
      .catch((err) => console.error(" Error fetching menu items:", err));
  }, []);

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      setFilteredData(monthlyData);
      return;
    }

    const filtered = monthlyData.map(month => {
      const filteredSummary = month.summary.filter(item => {
        const [day, mon, year] = item.date.split('.');
        const itemDate = new Date(`${year}-${mon}-${day}`);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        return itemDate >= from && itemDate <= to;
      });

      const finalTotal = filteredSummary.reduce((sum, item) => sum + item.total, 0);

      return {
        ...month,
        summary: filteredSummary,
        finalTotal
      };
    }).filter(month => month.summary.length > 0);

    setFilteredData(filtered);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setFilteredData(monthlyData);
  };

  return (
    <div className="vendor-payment-summary">
      <h2>📅 Vendor Payment Summary</h2>

      <div className="filter-container">
        <div className="date-filters">
          <div className="filter-group">
            <label htmlFor="fromDate">From Date:</label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="toDate">To Date:</label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
            />
          </div>
        </div>
        <div className="filter-buttons">
          <button onClick={handleFilter} className="filter-btn">Apply Filter</button>
          <button onClick={handleReset} className="reset-btn">Reset</button>
        </div>
      </div>

      {filteredData.length > 0 ? (
        filteredData.map((monthData, idx) => (
          <div key={idx} className="month-summary">
            <h3>{monthData.month}</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  {columns.map((col) => (
                    <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>
                  ))}
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {monthData.summary.map((row, index) => (
                  <tr key={index}>
                    <td>{row.date}</td>
                    {columns.map((col) => (
                      <td key={col}>{row[col] || 0}</td>
                    ))}
                    <td>₹{row.total.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="final-total-row">
                  <td colSpan={columns.length + 1}>Final Total</td>
                  <td>₹{monthData.finalTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div className="no-data">No data available for the selected date range</div>
      )}
    </div>
  );
};

export default VendorPaymentSummary;
