import React, { useState, useEffect, useCallback } from "react";
import "./MenuManager.css";


const MenuManager = () => {
  const [meals, setMeals] = useState([]);
  const [addons, setAddons] = useState([]);
  const [newItem, setNewItem] = useState({
    type: "meal",
    name: "",
    price: "",
    days: [true, true, true, true, true],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Correctly placed useCallback
  const fetchMenuItems = useCallback(async () => {
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
      alert("Failed to load menu items from server.");
    }
  }, []);

  // ✅ Fetch on mount
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);
  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      alert("Please fill in all required fields");
      return;
    }

    const item = {
      id: Date.now(),
      name: newItem.name.trim(),
      price: parseFloat(newItem.price),
      days: [...newItem.days]
    };

    if (newItem.type === "meal") {
      setMeals([...meals, item]);
    } else {
      setAddons([...addons, item]);
    }

    setNewItem({ 
      type: "meal", 
      name: "", 
      price: "",
      days: [true, true, true, true, true]
    });
    setShowAddModal(false);
  };

 const handleDelete = async (type, id) => {
  if (window.confirm("Are you sure you want to delete this item?")) {
    const success = await deleteMenuItem(type, id);
    if (success) {
      if (type === "meal") {
        setMeals(meals.filter((m) => m.id !== id));
      } else {
        setAddons(addons.filter((a) => a.id !== id));
      }
    }
  }
};


  const handlePriceChange = (type, id, newPrice) => {
    const update = (list) =>
      list.map((item) => (item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item));

    if (type === "meal") {
      setMeals(update(meals));
    } else {
      setAddons(update(addons));
    }
  };

  const handleDayToggle = (type, id, dayIndex) => {
    const update = (list) =>
      list.map((item) => {
        if (item.id === id) {
          const newDays = [...item.days];
          newDays[dayIndex] = !newDays[dayIndex];
          return { ...item, days: newDays };
        }
        return item;
      });

    if (type === "meal") {
      setMeals(update(meals));
    } else {
      setAddons(update(addons));
    }
  };

  const saveMenuConfiguration = async () => {
  try {
    const response = await fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/saveMenuItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ meals, addons })
    });

    if (!response.ok) throw new Error("Failed to save menu");

    const result = await response.json();
    console.log("Server response:", result);
    alert("Menu configuration saved successfully!");
  } catch (error) {
    console.error("Save failed:", error);
    alert("Failed to save menu configuration backend.");
  }
};

  const filteredMeals = meals.filter(meal => 
  meal?.name?.toLowerCase().includes(searchTerm.toLowerCase())
);

const filteredAddons = addons.filter(addon => 
  addon?.name?.toLowerCase().includes(searchTerm.toLowerCase())
);


  const dayAbbreviations = ["M", "T", "W", "Th", "F"];

  const deleteMenuItem = async (type, id) => {
  try {
    const response = await fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/deleteMenuItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, type }) // Send id and type ('meal' or 'addon')
    });

    if (!response.ok) {
      throw new Error("Failed to delete item from database");
    }

    const result = await response.json();
    console.log("Delete response:", result);
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete item from server");
    return false;
  }
};


  return (
    <div className="menu-manager">
      <header className="menu-header">
        <h2>Menu & Add-ons Manager</h2>
        <div className="header-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="add-item-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Add Item
          </button>
        </div>
      </header>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-item-modal">
            <div className="modal-header">
              <h3>Add New Item</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setNewItem({ 
                    type: "meal", 
                    name: "", 
                    price: "",
                    days: [true, true, true, true, true]
                  });
                  setShowAddModal(false);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Item Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                >
                  <option value="meal">Meal</option>
                  <option value="addon">Add-on</option>
                </select>
              </div>
<br></br>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <br></br>

              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                />
              </div>
<br></br>
              <div className="form-group days-selection">
                <label>Available Days</label>
                <div className="day-checkboxes">
                  {newItem.days.map((day, index) => (
                    <label key={index} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={day}
                        onChange={() => {
                          const newDays = [...newItem.days];
                          newDays[index] = !newDays[index];
                          setNewItem({ ...newItem, days: newDays });
                        }}
                      />
                      {dayAbbreviations[index]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="submit-btn add"
                  onClick={handleAddItem}
                >
                  Add Item
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setNewItem({ 
                      type: "meal", 
                      name: "", 
                      price: "",
                      days: [true, true, true, true, true]
                    });
                    setShowAddModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="menu-sections">
        <div className="menu-section">
          <h3>Meals ({filteredMeals.length})</h3>
          {filteredMeals.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price (₹)</th>
                  <th>Available Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeals.map((meal) => (
                  <tr key={meal.id}>
                    <td>{meal.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={meal.price}
                        onChange={(e) =>
                          handlePriceChange("meal", meal.id, e.target.value)
                        }
                      />
                    </td>
                    <td className="days-cell">
                      <div className="day-checkboxes">
                        {meal.days.map((day, index) => (
                          <label 
                            key={index} 
                            className={`day-checkbox ${day ? 'active' : ''}`}
                            onClick={() => handleDayToggle("meal", meal.id, index)}
                          >
                            {dayAbbreviations[index]}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="actions">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete("meal", meal.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-items">No meals found</p>
          )}
        </div>

        <div className="menu-section">
          <h3>Add-ons ({filteredAddons.length})</h3>
          {filteredAddons.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price (₹)</th>
                  <th>Available Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAddons.map((addon) => (
                  <tr key={addon.id}>
                    <td>{addon.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={addon.price}
                        onChange={(e) =>
                          handlePriceChange("addon", addon.id, e.target.value)
                        }
                      />
                    </td>
                    <td className="days-cell">
                      <div className="day-checkboxes">
                        {addon.days.map((day, index) => (
                          <label 
                            key={index} 
                            className={`day-checkbox ${day ? 'active' : ''}`}
                            onClick={() => handleDayToggle("addon", addon.id, index)}
                          >
                            {dayAbbreviations[index]}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="actions">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete("addon", addon.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-items">No add-ons found</p>
          )}
        </div>
      </div>

      <div className="save-configuration">
        <button 
          className="save-btn"
          onClick={saveMenuConfiguration}
        >
          Save Menu Configuration
        </button>
      </div>
    </div>
  );
};

export default MenuManager;