const API_BASE = "https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod";

// Meal Preference API
export const submitMealPreference = async (userId, mealData) => {
  try {
    const response = await fetch(`${API_BASE}/meal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        date: new Date().toISOString().split("T")[0], // "YYYY-MM-DD"
        regularity: mealData.regularity,
        optIn: mealData.optStatus === "opt-in",
        mainMeal: mealData.optStatus === "opt-in" ? mealData.mealSelection.mainMeal : null,
        addons: mealData.optStatus === "opt-in" ? mealData.mealSelection.addons : {},
      }),
    });

    const result = await response.json();
    console.log("API response:", result);
    return result;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
};

// Register API
export const registerUser = async (name, email, password, role) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!res.ok) throw new Error("Failed to register");
  return res.json();
};

// Login API
export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Invalid email or password");
  return res.json(); // Should return: { userId, role, email }
};
