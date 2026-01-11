import React, { useEffect, useState } from "react";
import "./DefaultMealSelector.css";

const DefaultMealSelector = ({ onSave }) => {
  // Get today's date in IST as yyyy-MM-dd ISO format
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const [regularity, setRegularity] = useState("regular");
  const [optStatus, setOptStatus] = useState("opt-in");
  const [mainMeal, setMainMeal] = useState("");
  const [addonCounts, setAddonCounts] = useState({});

  const [mealOptions, setMealOptions] = useState([]);
  const [addonOptions, setAddonOptions] = useState([]);

  const [isTodayHoliday, setIsTodayHoliday] = useState(false);

  const now = new Date();

  // Formatted date string to display to user
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const dayIndex = dayOfWeek >= 1 && dayOfWeek <= 5 ? dayOfWeek - 1 : -1; // Monday=0,...Friday=4

  const isDisabled = () => {
    const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hour = istNow.getHours();
    return hour >= 23 || isTodayHoliday || dayIndex === -1; // disable if after 11 PM IST, holiday or weekend
  };

  useEffect(() => {
    const fetchUserMealPreference = async () => {
      
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.userId;


      console.log("Fetching meal preference for", userId, date);

      try {
        const res = await fetch(
          `https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/getMealPreference?userId=${userId}&date=${date}`
        );

        const data = await res.json();
        console.log("Received preference:", data);

        if (data && data.status) {
          setRegularity(data.mealPlanType?.toLowerCase() || "regular");
          setOptStatus(data.status === "opted-out" ? "opt-out" : "opt-in");
          setMainMeal(data.mainMeal || "");
          setAddonCounts(data.addons || {});
        }
      } catch (err) {
        console.error("Failed to fetch user meal preference:", err);
      }
    };

    fetchUserMealPreference();
  }, [date]);

  // Fetch meals and add-ons dynamically from backend
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(
          "https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/getMenuItems"
        );
        const data = await res.json();

        // Filter by day index (weekdays only, no menu on weekends)
        const filterByDay = (items) => {
          if (dayIndex === -1) return [];
          return items.filter((item) => item.days && item.days[dayIndex]);
        };

        setMealOptions(filterByDay(data.meals || []));
        setAddonOptions(filterByDay(data.addons || []));
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        alert("Error loading menu items.");
      }
    };

    fetchMenu();
  }, [dayIndex]);

  useEffect(() => {
    const checkIfTodayHoliday = async () => {
      try {
        const res = await fetch(
          "https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/get-holidays"
        );
        const data = await res.json();

        console.log("Fetched holidays from backend:", data);

        const holidayDates = data.holidays || [];

        // Normalize holiday dates to yyyy-MM-dd string
        const normalizedHolidays = holidayDates.map((dateStr) =>
          new Date(dateStr).toISOString().split("T")[0]
        );

        const todayStr = new Date().toISOString().split("T")[0];

        console.log("Today's ISO:", todayStr);
        console.log("Holiday list:", normalizedHolidays);

        setIsTodayHoliday(normalizedHolidays.includes(date));
      } catch (err) {
        console.error("Failed to fetch holidays:", err);
      }
    };

    checkIfTodayHoliday();
  }, [date]);

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      alert("User not logged in.");
      return;
    }

    const payload = {
      userId: user.userId, // dynamic userId from localStorage
      date,
      mealPlanType: regularity === "occasional" ? "Occasional" : "Regular",
      status: optStatus === "opt-out" ? "opted-out" : "opted-in",
      mainMeal: optStatus === "opt-out" ? null : mainMeal,
      addons: optStatus === "opt-out" ? {} : addonCounts,
    };

    try {
      const res = await fetch(
        "https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/meal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      console.log("Saved meal preference:", result);
      alert("Preferences saved!");
      if (onSave) onSave(result);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save preferences.");
    }
  };

  return (
    <>
      <div className="default-meal-selector">
        <h2>Set Meal Preferences</h2>
        <p className="date">{today}</p>

        {isTodayHoliday && (
          <p className="holiday-warning" style={{ color: "red", fontWeight: "bold" }}>
            Today is a holiday. Meal selection is disabled.
          </p>
        )}

        <div className="section">
          <label className="section-label">Today's Opt Status:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="opt-in"
                checked={optStatus === "opt-in"}
                onChange={() => setOptStatus("opt-in")}
                disabled={isDisabled()}
              />
              Opt-In
            </label>
            <label>
              <input
                type="radio"
                value="opt-out"
                checked={optStatus === "opt-out"}
                onChange={() => setOptStatus("opt-out")}
                disabled={isDisabled()}
              />
              Opt-Out
            </label>
          </div>
        </div>

        {optStatus === "opt-in" && (
          <>
            <div className="section">
              <label className="section-label">Main Meal:</label>
              <select
                value={mainMeal}
                onChange={(e) => setMainMeal(e.target.value)}
                disabled={isDisabled()}
              >
                <option value="">Select Meal</option>
                {mealOptions.map((meal) => (
                  <option key={meal.id} value={meal.name}>
                    {meal.name} (₹{meal.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="section addons">
              <label className="section-label">Add-ons:</label>
              {addonOptions.map((addon) => (
                <div key={addon.id} className="stepper">
                  <span>{addon.name}:</span>
                  <button
                    onClick={() =>
                      setAddonCounts((prev) => ({
                        ...prev,
                        [addon.name]: Math.max(0, (prev[addon.name] || 0) - 1),
                      }))
                    }
                    disabled={isDisabled()}
                  >
                    -
                  </button>
                  <span>{addonCounts[addon.name] || 0}</span>
                  <button
                    onClick={() =>
                      setAddonCounts((prev) => ({
                        ...prev,
                        [addon.name]: Math.min(3, (prev[addon.name] || 0) + 1),
                      }))
                    }
                    disabled={isDisabled()}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="save-btn" onClick={handleSave} disabled={isDisabled()}>
          Save Preferences
        </button>
      </div>
    </>
  );
};

export default DefaultMealSelector;
