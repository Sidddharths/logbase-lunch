import React, { useState, useEffect } from 'react';
import './FoodCodePopup.css';

const FoodCodePopup = () => {
  const [open, setOpen] = useState(false);
  const [meals, setMeals] = useState([]);
  const [addons, setAddons] = useState([]);

  const togglePopup = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(
          "https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/getMenuItems"
        );
        if (!response.ok) throw new Error("Failed to fetch menu items");

        const data = await response.json();
        setMeals(data.meals || []);
        setAddons(data.addons || []);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    if (open) {
      fetchMenuItems();
    }
  }, [open]);

  return (
    <div className="food-popup-container">
      <div className={`popup-icon ${open ? 'open' : ''}`} onClick={togglePopup}>
        {open ? '✕' : '₹'}
      </div>

      {open && (
        <div className="popup-content">
          <h3>Food Menu & Prices</h3>
          
          <div className="menu-section">
            <h4>Main Meals</h4>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal, index) => (
                  <tr key={`meal-${index}`}>
                    <td>{meal.name}</td>
                    <td>₹{meal.price}</td>
                  </tr>
                ))}
                {meals.length === 0 && (
                  <tr>
                    <td colSpan="2">No meals available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="menu-section">
            <h4>Addons</h4>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {addons.map((addon, index) => (
                  <tr key={`addon-${index}`}>
                    <td>{addon.name}</td>
                    <td>₹{addon.price}</td>
                  </tr>
                ))}
                {addons.length === 0 && (
                  <tr>
                    <td colSpan="2">No addons available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodCodePopup;