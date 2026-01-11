// src/components/HolidayManager.jsx
import React, { useState } from "react";
import { useEffect } from "react"; 
import "./HolidayManager.css";

const predefinedHolidays = [ 
  // "01-01", 
  // "01-26", 
  // "08-15", 
  // "10-02", 
  // "12-25", 
  // "01-15", 
  // "01-16", 
  // "04-14", 
  // "10-02", 

];

const HolidayManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedHolidays, setMarkedHolidays] = useState(new Set());
  const [showHolidayList, setShowHolidayList] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");


useEffect(() => {
  fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/get-holidays")
    .then(res => res.json())
    .then(data => {
      setMarkedHolidays(new Set(data.holidays || []));
    })
    .catch(err => {
      console.error("Failed to fetch holidays:", err);
    });
}, []);


  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const formatDate = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date - offset).toISOString();
    return localISOTime.split("T")[0];
  };

  const isPredefinedHoliday = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return predefinedHolidays.includes(`${month}-${day}`);
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = async (date) => {
  if (isPastDate(date)) return;

  const dateStr = formatDate(date);

  try {
    await fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/toggle-holiday", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr }),
    });

    const updated = new Set(markedHolidays);
    if (updated.has(dateStr)) {
      updated.delete(dateStr);
    } else {
      updated.add(dateStr);
    }
    setMarkedHolidays(updated);
  } catch (err) {
    console.error("Error toggling holiday:", err);
  }
};


  const getFirstDayOfMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = getFirstDayOfMonth();
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add all days of the month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDate(date);
      const isHoliday = markedHolidays.has(dateStr) || isWeekend(date) || isPredefinedHoliday(date);
      const isToday = formatDate(today) === dateStr;
      const isPast = isPastDate(date);
      
      days.push(
        <div
          key={i}
          className={`calendar-day 
            ${isWeekend(date) ? "weekend" : ""} 
            ${isHoliday ? "holiday" : ""}
            ${isToday ? "today" : ""}
            ${isPast ? "past" : ""}`}
          onClick={() => !isPast && handleDateClick(date)}
          aria-label={`Date ${i}, ${selectedDate.toLocaleString('default', { month: 'long' })}`}
        >
          <div className="day-number">{i}</div>
          {isHoliday && <div className="holiday-indicator"></div>}
        </div>
      );
    }

    return days;
  };

  const handleMonthChange = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const toggleHolidayList = () => {
    setShowHolidayList(!showHolidayList);
  };

  const handleSetRangeHolidays = () => {
  if (!rangeStart || !rangeEnd) return;

  const startDate = new Date(rangeStart);
  const endDate = new Date(rangeEnd);
  const updated = new Set(markedHolidays);

  const promises = [];

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    if (!isPastDate(date)) {
      const formatted = formatDate(new Date(date));
      updated.add(formatted);

      // ✅ Call backend to store this holiday
      promises.push(
        fetch("https://2xa54qyorl.execute-api.ap-south-1.amazonaws.com/prod/toggle-holiday", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ date: formatted })
        }).catch((err) => {
          console.error("Failed to store holiday:", formatted, err);
        })
      );
    }
  }

  // Wait for all API calls to complete
  Promise.all(promises)
    .then(() => {
      setMarkedHolidays(updated);
      setRangeStart("");
      setRangeEnd("");
    });
};


  const sortedHolidays = Array.from(markedHolidays)
    .filter(date => !isPastDate(new Date(date)))
    .sort();

  return (
    <div className="holiday-manager">
      <header className="header">
        <h1 >Company Holiday Manager</h1>
        <p>Mark company holidays for {selectedDate.getFullYear()}</p>
      </header>

      <div className="calendar-container">
        <div className="calendar-controls">
          <button 
            className="button secondary" 
            onClick={() => handleMonthChange(-1)}
            aria-label="Previous month"
          >
            &larr;
          </button>
          <h2 className="month-display">
            {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          <button 
            className="button secondary" 
            onClick={() => handleMonthChange(1)}
            aria-label="Next month"
          >
            &rarr;
          </button>
        </div>

        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">{renderCalendar()}</div>
<br></br>
        <div className="range-selector">
          <div className="date-inputs">
            <label>
              From:
              <input 
                type="date" 
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                min={formatDate(new Date())}
              />
            </label>
            <label>
              To:
              <input 
                type="date" 
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                min={rangeStart || formatDate(new Date())}
              />
            </label>
            <button 
              className="button" 
              onClick={handleSetRangeHolidays}
              disabled={!rangeStart || !rangeEnd}
            >
              Set Holidays
            </button>
          </div>
        </div>
        

        <div className="calendar-actions">
          <button className="button1" onClick={toggleHolidayList}>
            {showHolidayList ? 'Hide Holidays' : 'View Holidays'}
          </button>
        </div>

        {showHolidayList && (
          <div className="holiday-list">
            <h3>Marked Holidays</h3>
            {sortedHolidays.length > 0 ? (
              <ul>
                {sortedHolidays.map(date => (
                  <li key={date}>{new Date(date).toLocaleDateString('en-IN')}</li>
                ))}
              </ul>
            ) : (
              <p>No holidays marked yet</p>
            )}
          </div>
        )}

        
      </div>
    </div>
  );
};

export default HolidayManager;