import React, { useState, useEffect } from "react";
import "./ViewBillModal.css";

const ViewBillModal = ({ isOpen, onClose, userId }) => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [billData, setBillData] = useState({ current: null, past: [] });
  const [isLoading, setIsLoading] = useState(false);

 useEffect(() => {
  console.log("Modal mounted");
  if (!isOpen || !userId) return;
  fetchBillData();

}, [isOpen, userId]);


  const fetchBillData = async () => {
    console.log("Fetching data for userId:", userId);
  setIsLoading(true);
  try {
    console.log("Fetching bill for user:", userId);

    const res = await fetch(
      `https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/employee-bill-summary?userId=${userId}`
    );

    if (!res.ok) {
      console.error("API call failed with status:", res.status);
      return;
    }

    const data = await res.json();
    console.log("Fetched bill data:", data);

    console.log("Raw API response:", data);
    console.log("Current Month Details:", data.current?.details);
    console.log("Past Months Data:", data.past);

    setBillData({
      current: data.current || { month: "", details: [], totalAmount: 0 },
      past: data.past || [],
    });
  } catch (err) {
    console.error("Error fetching bill data:", err);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const calculateTotal = (data) => {
    const total = data.reduce((acc, item) => acc + item.price, 0);
    const discount = total * 0.5;
    const finalTotal = total - discount;
    return { total, discount, finalTotal };
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const transformDetails = (details) => {
    return details.map((item) => ({
      date: item.date,
      meal: item.meal,
      addons: item.addons
        ? item.addons.map((addon) => ({
            name: addon,
            quantity: 1,
          }))
        : [],
      price: item.price,
    }));
  };

  const currentMonthData = billData.current
    ? transformDetails(billData.current.details)
    : [];

  const pastMonthsData = billData.past.reduce((acc, monthData) => {
    acc[monthData.month] = transformDetails(monthData.details);
    return acc;
  }, {});

  return (
    <div className="modal-overlay view-bill-modal" onClick={handleOutsideClick}>
      <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Meal Billing</h2>

        {isLoading ? (
          <div className="loading">Loading bill data...</div>
        ) : (
          <>
            <div className="bill-tabs">
              <button
                className={activeTab === "monthly" ? "active" : ""}
                onClick={() => setActiveTab("monthly")}
              >
                View {billData.current?.month || "Current"} Month's Bill
              </button>
              <button
                className={activeTab === "past" ? "active" : ""}
                onClick={() => setActiveTab("past")}
                disabled={billData.past.length === 0}
              >
                View Past Bills
              </button>
            </div>

            {activeTab === "monthly" && (
              <div className="bill-section">
                <h3>{billData.current?.month || "Current"} Month's Bill</h3>
                {currentMonthData.length > 0 ? (
                  <>
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Meal</th>
                          <th>Add-ons</th>
                          <th>Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMonthData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.date}</td>
                            <td>{item.meal}</td>
                            <td>
                              {item.addons.length > 0
                                ? item.addons.map((a) => a.name).join(", ")
                                : "-"}
                            </td>
                            <td>{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bill-summary">
                      <p>Total: ₹{calculateTotal(currentMonthData).total}</p>
                      <p>Discount (50%): ₹{calculateTotal(currentMonthData).discount}</p>
                      <p className="final-total">Final Total: ₹{calculateTotal(currentMonthData).finalTotal}</p>
                    </div>
                  </>
                ) : (
                  <p>No meal records found for this month</p>
                )}
              </div>
            )}

            {activeTab === "past" && (
              <div className="bill-section">
                <h3>Past Month Bills</h3>
                {Object.keys(pastMonthsData).length > 0 ? (
                  Object.entries(pastMonthsData).map(([month, bills], idx) => {
                    const { total, discount, finalTotal } = calculateTotal(bills);
                    return (
                      <div key={month}>
                        <h4>{month} Month's Bill</h4>
                        {bills.length > 0 ? (
                          <>
                            <table>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Meal</th>
                                  <th>Add-ons</th>
                                  <th>Price (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bills.map((item, i) => (
                                  <tr key={i}>
                                    <td>{item.date}</td>
                                    <td>{item.meal}</td>
                                    <td>
                                      {item.addons.length > 0
                                        ? item.addons.map((a) => a.name).join(", ")
                                        : "-"}
                                    </td>
                                    <td>{item.price}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="bill-summary">
                              <p>Total: ₹{total}</p>
                              <p>Discount (50%): ₹{discount}</p>
                              <p className="final-total">Final Total: ₹{finalTotal}</p>
                            </div>
                          </>
                        ) : (
                          <p>No records for {month}</p>
                        )}
                        {idx < Object.keys(pastMonthsData).length - 1 && (
                          <hr className="divider" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p>No past bills available</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewBillModal;
