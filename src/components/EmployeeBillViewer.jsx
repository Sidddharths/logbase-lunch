import React, { useState, useEffect } from "react";

import "./EmployeeBillViewer.css";

const EmployeeBillViewer = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMonthEndSummary, setShowMonthEndSummary] = useState(false);
  const [monthEndSummaryData, setMonthEndSummaryData] = useState(null);
  const [allEmployeeBills, setAllEmployeeBills] = useState({});

  useEffect(() => {
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/users");
      const users = await res.json();
      const formattedEmployees = users.map(user => ({
        id: user.userId,
        name: user.name,
        department: user.department || "",
      }));
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
    

  };

  fetchEmployees();
  fetchAllBills();
}, []);



  const fetchBillData = async (empId) => {
  setIsLoading(true);
  try {
    console.log("Fetching bill data for userId:", empId);

    const res = await fetch(`https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/employee-bill-summary?userId=${empId}`);
    
    if (!res.ok) {
      console.error("API call failed with status:", res.status);
      return;
    }

    const data = await res.json();
    console.log("Raw data received for userId", empId, ":", data);

    if (!data || !data.current || !data.current.details) {
      console.warn("No 'current.details' data found in response:", data);
    }

    setSelectedEmployee({ id: empId, ...data });
    setSelectedMonth("current");
  } catch (err) {
    console.error("Error fetching bill data:", err);
  } finally {
    setIsLoading(false);
  }
};

const fetchAllBills = async () => {
  setIsLoading(true);
  try {
    console.log("Fetching all employee bills...");

    const res = await fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/employee-bill-summary");

    if (!res.ok) {
      console.error("API call failed with status:", res.status);
      return;
    }

    const rawData = await res.json();
    console.log("Full employee bill data received:", rawData);

    // 🔧 Convert object to array of { id, ...billData }
    const transformedData = Object.entries(rawData).map(([id, bill]) => ({
      id,
      ...bill,
    }));

    console.log("Transformed employee bill array:", transformedData);

    setAllEmployeeBills(transformedData);
  } catch (err) {
    console.error("Error fetching all bills:", err);
  } finally {
    setIsLoading(false);
  }
};



const generateMonthEndSummary = async () => {
  setIsLoading(true);
  try {
    // First, ensure we have all employee bills data
    if (Object.keys(allEmployeeBills).length === 0) {
      await fetchAllBills();
    }

    // Get current month and year (e.g., "May 2025")
    const currentDate = new Date();
    const currentMonthYear = currentDate.toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });

    // Process the real data to create the summary
    const summaryEmployees = allEmployeeBills
      .filter(employee => employee.current) // Only include employees with current month data
      .map(employee => {
        const currentBill = employee.current;
        return {
          id: employee.id,
          name: employees.find(e => e.id === employee.id)?.name || "Unknown",
          details: currentBill.details || [],
          totalAmount: currentBill.totalAmount || 0
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort by name

    // Calculate month total
    const monthTotal = summaryEmployees.reduce(
      (sum, employee) => sum + (employee.totalAmount || 0), 
      0
    );

    const realSummary = {
      month: currentMonthYear,
      employees: summaryEmployees,
      monthTotal: monthTotal
    };

    setMonthEndSummaryData(realSummary);
    setShowMonthEndSummary(true);
  } catch (error) {
    console.error("Error generating month end summary:", error);
    // Fallback to dummy data if there's an error
    // const dummySummary = {
    //   month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    //   employees: [
    //     {
    //       id: 1,
    //       name: "John Doe",
    //       details: [
    //         { date: "May 1", meal: "Normal", addons: ["Egg", "Chicken"], price: 200 },
    //         { date: "May 2", meal: "Normal", addons: [], price: 85 },
    //       ],
    //       totalAmount: 285,
    //     },
    //     {
    //       id: 2,
    //       name: "Jane Smith",
    //       details: [
    //         { date: "May 1", meal: "Chapathi", addons: ["Egg"], price: 120 },
    //         { date: "May 3", meal: "Normal", addons: ["Chicken"], price: 180 },
    //       ],
    //       totalAmount: 300,
    //     },
    //   ],
    //   monthTotal: 585,
    // };
    // setMonthEndSummaryData(dummySummary);
    setShowMonthEndSummary(true);
  } finally {
    setIsLoading(false);
  }
};

  const filteredEmployees = employees.filter(emp =>
  typeof emp.name === 'string' && emp.name.toLowerCase().includes(searchTerm.toLowerCase())
);


  const renderBillTable = (billData) => {
    console.log("Rendering bill table with data:", billData);
    if (!billData) return null;
    
    return (
      <table className="bill-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Meal</th>
            <th>Addons</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {billData.details.map((d, i) => (
            <tr key={i}>
              <td>{d.date}</td>
              <td>{d.meal}</td>
              <td>{d.addons.join(", ") || "-"}</td>
              <td>₹{d.price}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan="3">Total</td>
            <td>₹{billData.totalAmount}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderEmployeeSummary = (employee) => {
    return (
      <div key={employee.id} className="employee-summary">
        <h4 className="employee-summary-name">{employee.name}</h4>
        <table className="bill-table summary-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Meal</th>
              <th>Addons</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {employee.details.map((d, i) => (
              <tr key={i}>
                <td>{d.date}</td>
                <td>{d.meal}</td>
                <td>{d.addons.join(", ") || "-"}</td>
                <td>₹{d.price}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="3">Employee Total</td>
              <td>₹{employee.totalAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="employee-bill-viewer">
      <h2 className="header">🧑‍💼 Employee Meal Bill Records</h2>
      
      <div className="content-container">
        <div className="employee-list-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <h3 className="sub-header">Employees</h3>
          {isLoading ? (
            <div className="loading">Loading employees...</div>
          ) : (
            <ul className="employee-list">
              {filteredEmployees.map((emp) => (
                <li
                  key={emp.id}
                  onClick={() => fetchBillData(emp.id)}
                  className={`employee-item ${
                    selectedEmployee?.id === emp.id ? "selected" : ""
                  }`}
                >
                  <span className="employee-name">{emp.name}</span>
                  <span className="employee-department">{emp.department}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedEmployee && (
          <div className="bill-details-container">
            <div className="employee-header">
              <h3>
                {employees.find(e => e.id === selectedEmployee.id)?.name}'s Meal Bills
              </h3>
            </div>

            <div className="month-selector">
              <button
                className={`month-tab ${
                  selectedMonth === "current" ? "active" : ""
                }`}
                onClick={() => setSelectedMonth("current")}
              >
                Current Month
              </button>
              {selectedEmployee?.past?.map((pastBill, index) => (
                <button
                  key={index}
                  className={`month-tab ${
                    selectedMonth === `past-${index}` ? "active" : ""
                  }`}
                  onClick={() => setSelectedMonth(`past-${index}`)}
                >
                  {pastBill.month}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="loading">Loading bill details...</div>
            ) : (
              <div className="bill-section">
                {selectedMonth === "current" ? (
                  <>
                    <h4 className="bill-month-header">
                      {selectedEmployee?.current?.month} Bill
                    </h4>
                    {renderBillTable(selectedEmployee.current)}
                  </>
                ) : (
                  selectedEmployee?.past?.map((pastBill, index) => {
                    if (selectedMonth === `past-${index}`) {
                      return (
                        <div key={index}>
                          <h4 className="bill-month-header">
                            {pastBill.month} Bill
                          </h4>
                          {renderBillTable(pastBill)}
                        </div>
                      );
                    }
                    return null;
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Month End Summary Button */}
      <button 
        className="month-end-summary-button"
        onClick={generateMonthEndSummary}
      >
        Month End Summary
      </button>

      {/* Month End Summary Modal */}
      {showMonthEndSummary && monthEndSummaryData && (
  <div
    className="summary-modal"
    onClick={() => setShowMonthEndSummary(false)} // close on backdrop click
  >
    <div
      className="summary-modal-content"
      onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
    >

            <div className="summary-modal-header">
              <h3>{monthEndSummaryData.month} - Month End Summary</h3>
              <button 
                className="close-button"
                onClick={() => setShowMonthEndSummary(false)}
              >
                ×
              </button>
            </div>
            <div className="summary-modal-body">
              {monthEndSummaryData.employees.map(renderEmployeeSummary)}
              <div className="month-total">
                <h4>{monthEndSummaryData.month} Month Total: ₹{monthEndSummaryData.monthTotal}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeBillViewer;