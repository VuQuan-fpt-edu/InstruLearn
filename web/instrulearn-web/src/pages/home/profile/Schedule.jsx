import React, { useState } from "react";

const initialScheduleData = {
  "2025-03-10": [
    {
      day: "Monday",
      time: "08:00 - 10:00",
      subject: "Piano Basics",
      room: "Room A",
    },
    {
      day: "Monday",
      time: "10:30 - 12:00",
      subject: "Music Theory",
      room: "Room B",
    },
  ],
  "2025-03-11": [
    {
      day: "Tuesday",
      time: "14:00 - 16:00",
      subject: "Guitar Techniques",
      room: "Room C",
    },
  ],
  "2025-03-12": [
    {
      day: "Wednesday",
      time: "09:00 - 11:00",
      subject: "Violin Practice",
      room: "Room D",
    },
  ],
  "2025-03-14": [
    {
      day: "Friday",
      time: "15:00 - 17:00",
      subject: "Composition Class",
      room: "Room E",
    },
  ],
  "2025-03-17": [
    {
      day: "Monday",
      time: "08:00 - 10:00",
      subject: "Advanced Piano",
      room: "Room A",
    },
    {
      day: "Monday",
      time: "10:30 - 12:00",
      subject: "Harmony in Music",
      room: "Room B",
    },
  ],
  "2025-03-18": [
    {
      day: "Tuesday",
      time: "14:00 - 16:00",
      subject: "Electric Guitar Techniques",
      room: "Room C",
    },
  ],
  "2025-03-19": [
    {
      day: "Wednesday",
      time: "09:00 - 11:00",
      subject: "Orchestra Practice",
      room: "Room D",
    },
  ],
  "2025-03-21": [
    {
      day: "Friday",
      time: "15:00 - 17:00",
      subject: "Music Production",
      room: "Room E",
    },
  ],
};

const Schedule = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const dates = Object.keys(initialScheduleData);

  const getWeekDates = (offset) => {
    return dates.filter((date) => {
      const baseDate = new Date("2025-03-10");
      baseDate.setDate(baseDate.getDate() + offset * 7);
      const nextWeekDate = new Date(baseDate);
      nextWeekDate.setDate(baseDate.getDate() + 6);
      return new Date(date) >= baseDate && new Date(date) <= nextWeekDate;
    });
  };

  const currentWeekDates = getWeekDates(weekOffset);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Student Music Schedule
      </h1>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Previous Week
        </button>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Next Week
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-3">Date</th>
              <th className="p-3">Day</th>
              <th className="p-3">Time</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Room</th>
            </tr>
          </thead>
          <tbody>
            {currentWeekDates.map((date) =>
              initialScheduleData[date].map((item, index) => (
                <tr
                  key={`${date}-${index}`}
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  <td className="p-3 text-center font-medium">{date}</td>
                  <td className="p-3 text-center font-medium">{item.day}</td>
                  <td className="p-3 text-center">{item.time}</td>
                  <td className="p-3 text-center">{item.subject}</td>
                  <td className="p-3 text-center">{item.room}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Schedule;
