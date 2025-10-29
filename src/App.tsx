// Utility for mock autopilot reordering and break insertion
function getOptimizedTasks(tasks: Task[]): Task[] {
  // Map string categories to union type
  function mapCategory(cat: string): keyof typeof CATEGORIES {
    if (cat === "Coursework") return "Coursework";
    if (cat === "Meeting") return "Meeting";
    if (cat === "Exercise") return "Exercise";
    return "Rest";
  }
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const energyOrder = { High: 0, Medium: 1, Low: 2 };
  // Add more intelligent tasks and transitions
  let enhancedTasks: Task[] = [
    {
      id: 101,
      title: "Morning Jog",
      category: "Exercise",
      date: tasks[0].date,
      startTime: "7:00 AM",
      endTime: "7:45 AM",
      notes: "Start with light cardio",
      priority: "Medium",
      focusLevel: "Medium",
      time: "7:00 AM – 7:45 AM",
      timeSlot: "07:00",
      movedReason: "✨ Energize for the day"
    },
    {
      id: 102,
      title: "Breakfast & Planning",
      category: "Rest",
      date: tasks[0].date,
      startTime: "7:45 AM",
      endTime: "8:15 AM",
      notes: "Healthy breakfast, review goals",
      priority: "Low",
      focusLevel: "Low",
      time: "7:45 AM – 8:15 AM",
      timeSlot: "07:45",
      movedReason: "✨ Prep for productivity"
    },
    ...tasks.map(t => ({ ...t, category: mapCategory(t.category as string) })),
    {
      id: 103,
      title: "Break (Recharge)",
      category: "Rest",
      date: tasks[0].date,
      startTime: "2:30 PM",
      endTime: "2:45 PM",
      notes: "Step outside, hydrate",
      priority: "Low",
      focusLevel: "Low",
      time: "2:30 PM – 2:45 PM",
      timeSlot: "14:30",
      movedReason: "✨ Scheduled recovery"
    },
    {
      id: 104,
      title: "Deep Work Block",
      category: "Coursework",
      date: tasks[0].date,
      startTime: "2:45 PM",
      endTime: "4:00 PM",
      notes: "Focus on lab report",
      priority: "High",
      focusLevel: "High",
      time: "2:45 PM – 4:00 PM",
      timeSlot: "14:45",
      movedReason: "✨ High-focus slot"
    },
    {
      id: 105,
      title: "Social Check-in",
      category: "Meeting",
      date: tasks[0].date,
      startTime: "6:00 PM",
      endTime: "6:30 PM",
      notes: "Call family",
      priority: "Low",
      focusLevel: "Low",
      time: "6:00 PM – 6:30 PM",
      timeSlot: "18:00",
      movedReason: "✨ Balance social energy"
    }
  ];
  // Sort strictly by timeSlot (24-hour time)
  let sorted = enhancedTasks.sort((a, b) => {
    return (a.timeSlot ?? '').localeCompare(b.timeSlot ?? '');
  });
  // Insert a break after first two tasks if not present
  if (!sorted.some(t => t.title.includes("Break"))) {
    sorted.splice(2, 0, {
      id: 999,
      title: "Break (15 min Recharge)",
      category: "Rest",
      date: sorted[0].date,
      startTime: "",
      endTime: "",
      notes: "Auto-Pilot scheduled recharge",
      priority: "Low",
      focusLevel: "Low",
      time: "",
      timeSlot: "",
      movedReason: "✨ Added by Auto-Pilot"
    });
  }
  return sorted;
}
type Task = {
  id: number;
  title: string;
  category: keyof typeof CATEGORIES;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  priority: "Low" | "Medium" | "High";
  focusLevel: "Low" | "Medium" | "High";
  time?: string;
  timeSlot?: string;
  movedReason?: string;
};
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { Switch } from "./components/ui/switch";
import img_chrono_active from "./assets/chrono_active.png";
import img_profile from "./assets/profile.png";
import img_chrono_inactive from "./assets/chrono_inactive.png";

// Category system with color coding
const CATEGORIES = {
  Coursework: {
    name: "Coursework",
    color: "#CBB3E8", // lavender
    bgClass: "bg-[#CBB3E8]/30",
    borderClass: "bg-[#CBB3E8]"
  },
  Meeting: {
    name: "Meeting", 
    color: "#B8E5D3", // mint
    bgClass: "bg-[#B8E5D3]/30",
    borderClass: "bg-[#B8E5D3]"
  },
  Exercise: {
    name: "Exercise",
    color: "#FFD6A5", // peach
    bgClass: "bg-[#FFD6A5]/30", 
    borderClass: "bg-[#FFD6A5]"
  },
  Rest: {
    name: "Rest",
    color: "#B8D8FF", // pale blue
    bgClass: "bg-[#B8D8FF]/30",
    borderClass: "bg-[#B8D8FF]"
  }
};

// Helper function to get category styling
const getCategoryStyle = (category: keyof typeof CATEGORIES): typeof CATEGORIES["Coursework"] => {
  return CATEGORIES[category] || CATEGORIES.Coursework;
};

// Expanded task data structure
const initialTasksData = [
  {
    id: 1,
    title: "15-210 Lab Section A",
    category: "Coursework",
    date: "2025-04-20",
    startTime: "10:30 AM",
    endTime: "1:30 PM",
    notes: "",
    priority: "High",
    focusLevel: "High"
  },
  {
    id: 2,
    title: "FigBuild Team Meeting",
    category: "Meeting",
    date: "2025-04-20",
    startTime: "8:30 AM",
    endTime: "10:00 AM",
    notes: "Discuss sprint review",
    priority: "Medium",
    focusLevel: "Medium"
  },
  {
    id: 3,
    title: "Lunch with Friends",
    category: "Meeting",
    date: "2025-04-20",
    startTime: "1:30 PM",
    endTime: "2:30 PM",
    notes: "At campus café",
    priority: "Low",
    focusLevel: "Low"
  },
  {
    id: 4,
    title: "Design Studio Work Session",
    category: "Coursework",
    date: "2025-04-20",
    startTime: "3:00 PM",
    endTime: "4:30 PM",
    notes: "Prototype testing",
    priority: "High",
    focusLevel: "High"
  },
  {
    id: 5,
    title: "Volleyball Practice",
    category: "Exercise",
    date: "2025-04-20",
    startTime: "4:30 PM",
    endTime: "6:00 PM",
    notes: "Bring Sherry jacket",
    priority: "Medium",
    focusLevel: "Medium"
  },
  {
    id: 6,
    title: "Evening Rest",
    category: "Rest",
    date: "2025-04-20",
    startTime: "6:30 PM",
    endTime: "7:30 PM",
    notes: "Screen-free wind-down",
    priority: "Low",
    focusLevel: "Low"
  },
  {
    id: 7,
    title: "Morning Jog",
    category: "Exercise",
    date: "2025-04-21",
    startTime: "7:00 AM",
    endTime: "8:00 AM",
    notes: "",
    priority: "Medium",
    focusLevel: "Low"
  },
  {
    id: 8,
    title: "10-301 Lecture",
    category: "Coursework",
    date: "2025-04-21",
    startTime: "9:00 AM",
    endTime: "10:30 AM",
    notes: "Chapter 5 quiz",
    priority: "High",
    focusLevel: "High"
  },
  {
    id: 9,
    title: "Coffee with Mentor",
    category: "Meeting",
    date: "2025-04-21",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    notes: "Career advice session",
    priority: "Medium",
    focusLevel: "Medium"
  },
  {
    id: 10,
    title: "Group Study Session",
    category: "Coursework",
    date: "2025-04-21",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    notes: "Statistics homework",
    priority: "High",
    focusLevel: "High"
  },
  {
    id: 11,
    title: "Netflix Break",
    category: "Rest",
    date: "2025-04-21",
    startTime: "8:00 PM",
    endTime: "9:30 PM",
    notes: "Watch documentary",
    priority: "Low",
    focusLevel: "Low"
  },
  {
    id: 12,
    title: "05-391 Project Work",
    category: "Coursework",
    date: "2025-04-22",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    notes: "Final submission prep",
    priority: "High",
    focusLevel: "High"
  }
];

// Helper function to convert task data to display format
const formatTasksForDisplay = (tasks: Task[]): Task[] => {
  return tasks.map((task: Task) => ({
    ...task,
    time: `${task.startTime} – ${task.endTime}`,
    timeSlot: convertTo24Hour(task.startTime)
  }));
};

// Helper function to convert 12-hour to 24-hour format for timeSlot
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  let hoursNum = parseInt(hours, 10);
  if (hoursNum === 12) {
    hoursNum = 0;
  }
  if (modifier === 'PM') {
    hoursNum += 12;
  }
  return `${hoursNum.toString().padStart(2, '0')}:${minutes}`;
};

// Helper function to group tasks by date
const groupTasksByDate = (tasks: Task[]): Record<string, Task[]> => {
  return tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {});
};

interface UserProfileScreenProps {
  isOpen: boolean;
  onClose: () => void;
}
function UserProfileScreen({ isOpen, onClose }: UserProfileScreenProps) {
  const [settings, setSettings] = useState({
    syncCalendar: false,
    energyInsights: true,
    darkMode: false
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto h-full bg-gradient-to-br from-purple-100/80 via-pink-50 to-blue-50 overflow-hidden shadow-2xl">
        {/* Background decorative elements */}
        <div className="absolute top-20 -right-10 w-60 h-60 bg-purple-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-10 w-40 h-40 bg-blue-200 opacity-20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-10 w-32 h-32 bg-pink-200 opacity-20 rounded-full blur-xl"></div>
  
        <div className="relative max-w-md mx-auto h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-8 pb-6">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-black hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">Back</span>
            </button>
            
            <button onClick={onClose} className="text-black hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          {/* Profile Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
              <img src={img_profile} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
  
          {/* User Name */}
          <div className="text-center mb-8">
            <h1 className="text-2xl text-black mb-2">Andrew</h1>
            <p className="text-gray-600">andrew@cmu.edu</p>
          </div>
  
          {/* Quick Actions */}
          <div className="px-6 mb-4">
            <div className="flex gap-4">
              <button className="flex-1 bg-white/60 backdrop-blur-md rounded-[30px] border border-white/20 shadow-sm hover:bg-white/80 transition-all flex items-center justify-center py-3">
                <span className="text-black font-medium">Edit Profile</span>
              </button>
              <button className="flex-1 bg-white/60 backdrop-blur-md rounded-[30px] border border-white/20 shadow-sm hover:bg-white/80 transition-all flex items-center justify-center py-3">
                <span className="text-black font-medium">Settings</span>
              </button>
            </div>
          </div>
  
          {/* Energy Summary Card */}
          <div className="px-6 mb-4">
            <div className="bg-white/60 backdrop-blur-md rounded-[30px] p-4 border border-white/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-black font-medium mb-1">Weekly Energy</h3>
                  <p className="text-sm text-gray-600">Average this week</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl text-black mb-1">74%</div>
                  <div className="text-xs text-green-600">+5% from last week</div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Settings Options */}
          <div className="px-6 space-y-4">
            {/* Sync Calendar */}
            <div className="bg-white/60 backdrop-blur-md rounded-[30px] p-4 border border-white/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-black mb-1 font-medium">Sync with Google Calendar</h4>
                  <p className="text-xs text-gray-600">Import events automatically</p>
                </div>
                <Switch 
                  checked={settings.syncCalendar}
                  onCheckedChange={() => handleToggle('syncCalendar')}
                />
              </div>
            </div>
  
            {/* Energy Insights */}
            <div className="bg-white/60 backdrop-blur-md rounded-[30px] p-4 border border-white/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-black mb-1 font-medium">Energy Insights</h4>
                  <p className="text-xs text-gray-600">Track your daily energy levels</p>
                </div>
                <Switch 
                  checked={settings.energyInsights}
                  onCheckedChange={() => handleToggle('energyInsights')}
                />
              </div>
            </div>
  
            {/* Additional Options */}
            <div className="bg-white/60 backdrop-blur-md rounded-[30px] p-4 border border-white/20 shadow-sm">
              <button className="w-full text-left">
                <h4 className="text-black">Privacy & Legal</h4>
              </button>
            </div>
  
            <div className="bg-white/60 backdrop-blur-md rounded-[30px] p-4 border border-white/20 shadow-sm">
              <button className="w-full text-left">
                <h4 className="text-black">Connect Smart Devices</h4>
              </button>
            </div>
  
            <div className="bg-white/60 backdrop-blur-md rounded-[30px] p-4 border border-white/20 shadow-sm">
              <button className="w-full text-left">
                <h4 className="text-black">Log Out</h4>
              </button>
            </div>
          </div>
        </div>

        <div className="pb-8"></div>
      </div>
    </div>
  );
}

interface TopBarProps {
  focusEnabled: boolean;
  autoPilotEnabled: boolean;
  onFocusToggle: (enabled: boolean) => void;
  onAutoPilotToggle: (enabled: boolean) => void;
  onProfileClick: () => void;
  showToggle?: boolean;
}
function TopBar({
  focusEnabled,
  autoPilotEnabled,
  onFocusToggle,
  onAutoPilotToggle,
  onProfileClick,
  showToggle = true,
}: TopBarProps) {
  // Gradient for Auto-Pilot ON
  const autoPilotGradient = "bg-white/40 border-white/20 backdrop-blur-md";
  return (
    <div className="relative top-0 left-0 right-0 bg-transparent z-20 max-w-md mx-auto">
      <div className="flex items-center px-6 pt-8 pb-6">
        {/* Focus vs Auto-Pilot Toggle - only show in active mode */}
        {showToggle ? (
          <motion.div
            className={`flex items-center rounded-full p-1 border ${autoPilotGradient}`}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <button
              onClick={() => onFocusToggle(true)}
              className={`px-4 py-2 rounded-full transition-all ${
                focusEnabled
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <span className="text-xs">Focus</span>
            </button>
            <button
              onClick={() => onAutoPilotToggle(true)}
              className={`px-4 py-2 rounded-full transition-all ${
                autoPilotEnabled
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <span className="text-xs">Auto-Pilot</span>
            </button>
          </motion.div>
        ) : null}
        <div className="flex-1" />
        {/* Profile Image - always at top right */}
        <button 
          onClick={onProfileClick}
          className="w-12 h-12 rounded-full overflow-hidden shadow-md hover:shadow-lg transition-shadow ml-auto"
        >
          <img
            src={img_profile}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}

function TaskTracker(): React.ReactElement {
  return (
    <div className="px-6 mb-6">
      <div className="flex gap-4">
        {/* Tasks Remaining Card */}
        <div className="flex-1 bg-pink-100/70 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex justify-between">
            <span className="text-4xl font-bold text-black">5</span>
            <span className="text-sm text-gray-700">Tasks <br />Remaining</span>
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded-full">
            <div className="h-full bg-green-400 rounded-full" style={{ width: "28%" }}></div>
          </div>
        </div>

        {/* Completion Percentage Card */}
        <div className="flex-1 bg-purple-100/70 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex justify-between">
            <span className="text-4xl font-bold text-black">28%</span>
            <span className="text-sm text-gray-700">Tasks <br />Completed</span>
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded-full">
            <div className="h-full bg-green-400 rounded-full" style={{ width: "28%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScheduleProps {
  tasks: Task[];
  onScheduleClick: () => void;
}
function Schedule({ tasks, onScheduleClick }: ScheduleProps) {
  // Use same time slots as expanded view for consistency
  // Only show collapsed morning view: 8am-12pm
  const timeSlots = [
    "8 am", "9 am", "10 am", "11 am", "12 pm"
  ];

  // Helper to get tasks for a time slot
  const getTasksForTimeSlot = (timeSlot: string): Task[] => {
    const isPM = timeSlot.includes("pm");
    const hour = parseInt(timeSlot);
    const slotHour24 = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;
    return tasks.filter((task: Task) => {
      const [taskHour] = (task.timeSlot ?? "0:00").split(":").map(Number);
      return taskHour === slotHour24;
    });
  };

  return (
    <div className="px-6 mb-6">
      {/* Frosted glass schedule container */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-sm">
        {/* Schedule Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onScheduleClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <h2 className="text-2xl text-black font-semibold">Schedule</h2>
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-sm text-gray-600">April 20</span>
        </div>
        {/* Timeline + Tasks */}
        <div className="relative">
          {timeSlots.map((timeSlot) => {
            const tasksForSlot = getTasksForTimeSlot(timeSlot);
            return (
              <div key={timeSlot} className="flex items-start mb-8">
                <span className="text-xs text-black w-12 flex-shrink-0 mt-1">{timeSlot}</span>
                <div className="flex-1 ml-4">
                  <div className="h-px bg-gray-200"></div>
                  {tasksForSlot.map((task: Task) => {
                    const categoryStyle = getCategoryStyle(task.category);
                    return (
                      <div
                        key={task.id}
                        className={`${categoryStyle.bgClass} backdrop-blur-md rounded-lg p-3 border border-white/20 w-[85%] mt-2 relative`}
                      >
                        <div className="text-xs font-medium text-black mb-1">{task.title}</div>
                        <div className="text-xs text-gray-600 mb-1">{task.time}</div>
                        {task.notes && <div className="text-xs text-gray-600">Notes: {task.notes}</div>}
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full ${categoryStyle.borderClass}`}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface BottomNavigationProps {
  onAddTask: () => void;
  currentMode: string;
  onModeChange: (mode: string) => void;
}
function BottomNavigation({
  onAddTask,
  currentMode,
  onModeChange,
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-purple-100/80 via-pink-50/60 to-transparent z-20 max-w-md mx-auto">
      <div className="px-6 pb-8 pt-4">
        <div className="bg-white/60 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            {/* Active Button */}
            <button
              onClick={() => onModeChange("active")}
              className={`rounded-full px-6 py-4 transition-all ${
                currentMode === "active"
                  ? "bg-pink-200/80 shadow-sm"
                  : "hover:bg-white/20"
              }`}
            >
              <span
                className={`text-base ${
                  currentMode === "active"
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                Active
              </span>
            </button>

            {/* Add Button */}
            <button
              onClick={onAddTask}
              className="bg-purple-300 rounded-full p-4 shadow-lg"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* Inactive Button */}
            <button
              onClick={() => onModeChange("inactive")}
              className={`rounded-full px-6 py-4 transition-all ${
                currentMode === "inactive"
                  ? "bg-pink-200/80 shadow-sm"
                  : "hover:bg-white/20"
              }`}
            >
              <span
                className={`text-base ${
                  currentMode === "inactive"
                    ? "text-black"
                    : "text-gray-500"
                }`}
              >
                Inactive
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inactive Mode Components
function InactiveCharacterBlob(): React.ReactElement {
  return (
    <div className="flex justify-center mb-8">
      <img
        src={img_chrono_inactive}
        alt="Inactive Character"
        className="w-40 h-40 object-cover rounded-full"
      />
    </div>
  );
}

function EnergyChart(): React.ReactElement {
  return (
    <div className="px-6 mb-8">
      <h3 className="text-lg text-white/70 mb-4">
        Energy Level
      </h3>
      <div className="relative h-32 bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
        {/* Chart grid lines */}
        <div className="absolute inset-4">
          <div className="relative h-full">
            {/* Horizontal grid lines */}
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 transform -translate-y-px"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>

            {/* Vertical grid lines */}
            <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 transform -translate-x-px"></div>
            <div className="absolute top-0 bottom-0 right-0 w-px bg-white/10"></div>

            {/* Chart line */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 280 96"
            >
              <defs>
                <linearGradient
                  id="energyGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#E9D5FF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Fill area under the curve */}
              <path
                d="M0 14 L70 20 L140 52 L210 58 L280 76 L280 96 L0 96 Z"
                fill="url(#energyGradient)"
              />

              {/* Chart line */}
              <path
                d="M0 14 L70 20 L140 52 L210 58 L280 76"
                stroke="#C084FC"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Data point */}
              <circle cx="280" cy="76" r="4" fill="#af5cff" />
            </svg>
          </div>
        </div>

        {/* Chart labels */}
        <div className="absolute -bottom-6 left-4 text-xs text-white/50">
          Hour 0
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/50">
          Hour 12
        </div>
        <div className="absolute -bottom-6 right-4 text-xs text-white/50">
          Hour 24
        </div>

        <div className="absolute -left-0 top-0 text-xs text-white/50">
          100%
        </div>
        <div className="absolute -left-0 top-1/2 transform -translate-y-1/2 text-xs text-white/50">
          50%
        </div>
        <div className="absolute -left-0 bottom-0 text-xs text-white/50">
          0%
        </div>
        <div className="absolute -left-0 top-1/4 transform -translate-y-1/2 text-xs text-white/50">
          75%
        </div>
      </div>
    </div>
  );
}

function DailyCategories(): React.ReactElement {
  const categories = [
    {
      name: "Sleep",
      hours: 2,
      color: "bg-blue-500/20 border-blue-400/30",
    },
    {
      name: "Friends",
      hours: 1,
      color: "bg-purple-500/20 border-purple-400/30",
    },
    {
      name: "Entertainment",
      hours: 4,
      color: "bg-pink-500/20 border-pink-400/30",
    },
    {
      name: "Exercise",
      hours: 1,
      color: "bg-green-500/20 border-green-400/30",
    },
  ];

  return (
    <div className="px-6 mb-8">
      <h3 className="text-lg text-white/70 mb-6">
        Daily Categories
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <div
            key={category.name}
            className={`${category.color} backdrop-blur-md rounded-2xl p-4 border relative`}
          >
            <div className="text-4xl text-white mb-1">
              {category.hours}
            </div>
            <div className="text-sm text-white/80 mb-1">
              hours
            </div>
            <div className="text-xs text-white/60">
              {category.name}
            </div>

            {/* Chevron icon */}
            <div className="absolute top-4 right-4">
              <svg
                className="w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface InactiveModeProps {
  focusEnabled: boolean;
  autoPilotEnabled: boolean;
  onFocusToggle: (enabled: boolean) => void;
  onAutoPilotToggle: (enabled: boolean) => void;
  onProfileClick: () => void;
}
function InactiveMode({
  focusEnabled,
  autoPilotEnabled,
  onFocusToggle,
  onAutoPilotToggle,
  onProfileClick,
}: InactiveModeProps) {
  return (
    <>
      {/* Fixed Top Bar - header only, no toggle */}
      <TopBar
        focusEnabled={focusEnabled}
        autoPilotEnabled={autoPilotEnabled}
        onFocusToggle={onFocusToggle}
        onAutoPilotToggle={onAutoPilotToggle}
        onProfileClick={onProfileClick}
        showToggle={false}
      />
      {/* Scrollable Main Content */}
      <div className="pt-6 pb-32 overflow-y-auto relative z-10">
        <InactiveCharacterBlob />
        <EnergyChart />
        <DailyCategories />
      </div>
    </>
  );
}

interface ExpandedCalendarViewProps {
  onScheduleClick: () => void;
  groupedTasks: Record<string, Task[]>;
}
function ExpandedCalendarView({ onScheduleClick, groupedTasks }: ExpandedCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState("2025-04-20");
  const currentTasks = groupedTasks[selectedDate] || [];

  const timeSlots = [
    "8 am", "9 am", "10 am", "11 am", "12 pm", 
    "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", 
    "6 pm", "7 pm", "8 pm", "9 pm", "10 pm"
  ];

  const calendarDates = [
    { date: 13, isCurrentMonth: false }, { date: 14, isCurrentMonth: true }, { date: 15, isCurrentMonth: true }, 
    { date: 16, isCurrentMonth: true }, { date: 17, isCurrentMonth: true }, { date: 18, isCurrentMonth: true }, 
    { date: 19, isCurrentMonth: false },
    { date: 20, isCurrentMonth: true, isToday: true }, { date: 21, isCurrentMonth: true }, 
    { date: 22, isCurrentMonth: true }, { date: 23, isCurrentMonth: true }, { date: 24, isCurrentMonth: true }, 
    { date: 25, isCurrentMonth: true }, { date: 26, isCurrentMonth: false },
    { date: 27, isCurrentMonth: false }, { date: 28, isCurrentMonth: true }, 
    { date: 29, isCurrentMonth: true }, { date: 30, isCurrentMonth: true }
  ];

  const handleDateClick = (date: number) => {
    const dateStr = `2025-04-${date.toString().padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const getTasksForTimeSlot = (timeSlot: string): Task[] => {
    // Convert timeSlot (like "8 am") → numeric hour 8 or 20
    const isPM = timeSlot.includes("pm");
    const hour = parseInt(timeSlot); // "8 am" -> 8
    const slotHour24 = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour;
  
    return currentTasks.filter((task: Task) => {
      const [taskHour, taskMinute] = (task.timeSlot ?? "0:00").split(":").map(Number);
      return taskHour === slotHour24;
    });
  };
  
  return (
    <div className="pt-6 pb-32 overflow-y-auto relative z-10">
      {/* Header */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onScheduleClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <h1 className="text-2xl text-black">Schedule</h1>
              <svg className="w-6 h-6 text-gray-300 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Profile Image */}
          <button 
            onClick={() => {}} // We'll handle this in the main component
            className="w-12 h-12 rounded-full overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <img src={img_profile} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="px-6 mb-8">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg text-black">April</span>
            <span className="text-sm text-purple-500">2025</span>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 justify-center">
            {/* Day headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={day}
                className={`flex items-center justify-center w-8 h-8 text-xs ${
                  index === 0 || index === 6 ? 'text-gray-400' : 'text-black'
                }`}
              >
                {day}
              </div>
            ))}
            
            {/* Calendar dates */}
            {calendarDates.map((dateObj, index) => {
              const fullDate = `2025-04-${dateObj.date.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === fullDate;
            
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(dateObj.date)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all
                    ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : dateObj.isToday
                          ? 'bg-purple-300 text-white'
                          : dateObj.isCurrentMonth
                            ? 'text-black hover:bg-purple-100'
                            : 'text-gray-400'
                    }`}
                >
                  {dateObj.date}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6">
        <div className="relative">
          {timeSlots.map((timeSlot, index) => {
            const tasksForSlot = getTasksForTimeSlot(timeSlot);
            
            return (
              <div key={timeSlot} className="flex items-start mb-8">
                <span className="text-xs text-black w-12 flex-shrink-0 mt-1">{timeSlot}</span>
                <div className="flex-1 ml-4">
                  <div className="h-px bg-gray-200"></div>
                  
                  {/* Task cards for this time slot */}
                  {tasksForSlot.map((task: Task, taskIndex: number) => {
                    const categoryStyle = getCategoryStyle(task.category);
                    return (
                      <div key={task.id} className={`mt-2 mb-4 ${categoryStyle.bgClass} backdrop-blur-md rounded-lg p-3 border border-white/20 w-[85%] relative`}>
                        <div className="text-xs text-black mb-1">{task.title}</div>
                        <div className="text-xs text-gray-600 mb-1">{task.time}</div>
                        {task.notes && (
                          <div className="text-xs text-gray-600">Notes: {task.notes}</div>
                        )}
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full ${categoryStyle.borderClass}`}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}
function AddTaskModal({ isOpen, onClose, onSave }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "Start a new task...",
    category: "Coursework",
    date: "2025-04-20",
    startTime: "16:20",
    endTime: "17:20",
    priority: "Medium",
    focusLevel: "Medium",
    notes: ""
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const categories = Object.keys(CATEGORIES);

  const handleInputChange = (field: keyof Task, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const mappedTask = {
      id: Date.now(),
      title: formData.title === "Start a new task..." ? `${formData.category} Task` : formData.title,
      category: (formData.category === "Coursework" ? "Coursework" : formData.category === "Meeting" ? "Meeting" : formData.category === "Exercise" ? "Exercise" : "Rest") as keyof typeof CATEGORIES,
      date: formData.date,
      startTime: formatTimeForDisplay(formData.startTime),
      endTime: formatTimeForDisplay(formData.endTime),
      notes: formData.notes,
      priority: (formData.priority === "High" ? "High" : formData.priority === "Medium" ? "Medium" : "Low") as "Low" | "Medium" | "High",
      focusLevel: (formData.focusLevel === "High" ? "High" : formData.focusLevel === "Medium" ? "Medium" : "Low") as "Low" | "Medium" | "High"
    };
    onSave(mappedTask);
    setFormData({
      title: "Start a new task...",
      category: "Coursework",
      date: "2025-04-20",
      startTime: "16:20",
      endTime: "17:20",
      priority: "Medium",
      focusLevel: "Medium",
      notes: ""
    });
    setIsEditingTitle(false);
    onClose();
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSubmit = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if (("key" in e && e.key === "Enter") || e.type === "blur") {
      setIsEditingTitle(false);
    }
  };

  const formatTimeForDisplay = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hoursNum = parseInt(hours, 10);
  const hour12 = hoursNum > 12 ? hoursNum - 12 : hoursNum === 0 ? 12 : hoursNum;
  const period = hoursNum >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes} ${period}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto bg-gradient-to-br from-purple-100/80 via-pink-50 to-blue-50 rounded-t-[40px] transform transition-transform duration-300 ease-out translate-y-0">
        {/* Background decorative elements */}
        <div className="absolute top-10 -right-8 w-32 h-32 bg-purple-200 opacity-20 rounded-full blur-2xl"></div>
        <div className="absolute top-20 -left-8 w-24 h-24 bg-blue-200 opacity-20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 -right-8 w-32 h-32 bg-pink-200 opacity-20 rounded-full blur-2xl"></div>
        <div className="relative p-6 pb-8 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-1">
              {isEditingTitle ? (
                <input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  onKeyDown={handleTitleSubmit}
                  onBlur={handleTitleSubmit}
                  className="text-2xl text-black bg-transparent border-none outline-none flex-1"
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl text-black flex-1">{formData.title}</h2>
              )}
              <button onClick={handleTitleEdit} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <button onClick={onClose} className="text-black hover:text-gray-600 transition-colors ml-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-px bg-black mb-6"></div>

          <div className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-gray-600 mb-2">Category:</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => {
                  const mappedCat = (cat === "Coursework" ? "Coursework" : cat === "Meeting" ? "Meeting" : cat === "Exercise" ? "Exercise" : "Rest") as keyof typeof CATEGORIES;
                  const categoryStyle = getCategoryStyle(mappedCat);
                  return (
                    <button
                      key={cat}
                      onClick={() => handleInputChange('category', cat)}
                      className={`relative rounded-[20px] p-4 border-2 transition-all ${
                        formData.category === cat 
                          ? 'border-black shadow-sm' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: categoryStyle.color + '80' }}
                    >
                      <div className="text-sm text-black">{cat}</div>
                      <div 
                        className="absolute left-2 top-2 bottom-2 w-1 rounded-full"
                        style={{ backgroundColor: categoryStyle.color }}
                      ></div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-600 mb-2">Date:</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full bg-purple-200 rounded-[20px] px-4 py-3 text-gray-700 border-none outline-none appearance-none pr-10"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-gray-600 mb-2">Time:</label>
              <div className="flex gap-4 items-center">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="flex-1 bg-purple-200 rounded-[20px] px-4 py-3 text-gray-700 border-none outline-none text-center"
                />
                <span className="text-gray-600 text-sm">TO</span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="flex-1 bg-purple-200 rounded-[20px] px-4 py-3 text-gray-700 border-none outline-none text-center"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-gray-600 mb-2">Priority:</label>
              <div className="bg-purple-100/40 backdrop-blur-md rounded-[30px] p-1 border border-purple-200/50">
                <div className="flex">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleInputChange('priority', level)}
                      className={`flex-1 py-2 px-4 rounded-[30px] transition-all ${
                        formData.priority === level 
                          ? 'bg-purple-300/60 shadow-sm text-black' 
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      <span className="text-sm">{level}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Focus Level */}
            <div>
              <label className="block text-gray-600 mb-2">Focus Level:</label>
              <div className="bg-purple-100/40 backdrop-blur-md rounded-[30px] p-1 border border-purple-200/50">
                <div className="flex">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleInputChange('focusLevel', level)}
                      className={`flex-1 py-2 px-4 rounded-[30px] transition-all ${
                        formData.focusLevel === level 
                          ? 'bg-purple-300/60 shadow-sm text-black' 
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      <span className="text-sm">{level}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-600 mb-2">Notes:</label>
              <div className="relative">
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Optional notes..."
                  rows={4}
                  className="w-full bg-purple-200 rounded-[20px] px-4 py-3 text-gray-700 border-none outline-none resize-none"
                />
                <div className="absolute bottom-3 right-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                className="w-full bg-purple-300/60 backdrop-blur-md rounded-[30px] border border-purple-200/50 shadow-lg hover:bg-purple-300/80 transition-all flex items-center justify-center py-4"
              >
                <span className="text-black text-base font-medium">Save Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActiveModeProps {
  focusEnabled: boolean;
  autoPilotEnabled: boolean;
  onFocusToggle: (enabled: boolean) => void;
  onAutoPilotToggle: (enabled: boolean) => void;
  onScheduleClick: () => void;
  onProfileClick: () => void;
  tasks: Task[];
}
function ActiveMode({
  focusEnabled,
  autoPilotEnabled,
  onFocusToggle,
  onAutoPilotToggle,
  onScheduleClick,
  onProfileClick,
  tasks,
}: ActiveModeProps) {
  // Banner state
  const [showBanner, setShowBanner] = useState(false);
  const [showChartAnim, setShowChartAnim] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);
  const [animatedTasks, setAnimatedTasks] = useState<Task[]>(tasks);
  const [postponedCount, setPostponedCount] = useState(0);
  const [glowMap, setGlowMap] = useState<{ [id: number]: boolean }>({});

  React.useEffect(() => {
    if (autoPilotEnabled) {
      setShowBanner(true);
      setShowChartAnim(true);
      setShowOptimized(false);

      const bannerTimer = setTimeout(() => {
        setShowBanner(false);

        const transitionTimer = setTimeout(() => {
          setShowChartAnim(false);
          setShowOptimized(true);

          let rearranged = getOptimizedTasks(tasks);
          let postponed = 0;
          let displayTasks = rearranged;
          if (rearranged.length > 6) {
            postponed = rearranged.length - 6;
            displayTasks = rearranged.slice(0, 6);
          }
          setAnimatedTasks(displayTasks);
          setPostponedCount(postponed);

          const newGlow: { [id: number]: boolean } = {};
          displayTasks.forEach((t) => {
            if (t.movedReason || t.id === 999) newGlow[t.id] = true;
          });
          setGlowMap(newGlow);
          setTimeout(() => setGlowMap({}), 1200);
        }, 500);
      }, 2500);

      return () => clearTimeout(bannerTimer);
    } else {
      setAnimatedTasks(tasks);
      setPostponedCount(0);
      setGlowMap({});
      setShowBanner(false);
      setShowChartAnim(false);
      setShowOptimized(false);
    }
  }, [autoPilotEnabled, tasks]);

  return (
    <>
      <TopBar
        focusEnabled={focusEnabled}
        autoPilotEnabled={autoPilotEnabled}
        onFocusToggle={onFocusToggle}
        onAutoPilotToggle={onAutoPilotToggle}
        onProfileClick={onProfileClick}
        showToggle={true}
      />

      <div className="px-6 mb-4">
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="w-full flex justify-center"
            >
              <div
                className="px-6 py-3 rounded-2xl bg-white/0 text-teal-900 font-semibold text-base flex items-center gap-2 animate-fade-in-out"
              >
                Auto-Pilot is optimizing your day...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✨ Wrapped Scrollable Main Content for smooth upward animation */}
      <motion.div
        className={`pb-32 overflow-y-auto relative z-10 ${
          autoPilotEnabled
            ? 'bg-gradient-to-br from-teal-100 via-blue-50 to-purple-100'
            : ''
        }`}
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: 0,
          opacity: 1,
          transition: { duration: 0.8, ease: 'easeOut' },
        }}
      >
        {/* Character blob */}
        <div className={`flex justify-center relative ${!autoPilotEnabled ? "mb-6" : ""}`}>
          <motion.div
            className="relative flex items-center justify-center"
            animate={
              autoPilotEnabled && showChartAnim
                ? { scale: [1, 1.05, 1] }
                : { scale: 1 }
            }
            transition={
              autoPilotEnabled && showChartAnim
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : {}
            }
          >
            <img
              src={img_chrono_active}
              alt="Character"
              className="w-40 h-40 object-cover rounded-full"
            />
          </motion.div>
        </div>

        {/* Energy chart */}
        {autoPilotEnabled && (
          <motion.div
            className="px-6 mb-8"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="relative h-32 bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10"
              animate={showChartAnim ? { y: [0, -6, 0] } : { y: 0 }}
              transition={
                showChartAnim ? { duration: 2, repeat: Infinity } : {}
              }
            >
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 96">
                <defs>
                  <linearGradient
                    id="energyGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#5eead4" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#CBB3E8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* ✨ Dynamic flowing energy curve */}
                <motion.path
                  d="M0,40 C40,20 80,10 120,40 S200,85 280,70 L280,96 L0,96 Z"
                  fill="url(#energyGradient)"
                  animate={
                    showChartAnim
                      ? {
                          d: [
                            'M0,40 C40,20 80,10 120,40 S200,85 280,70 L280,96 L0,96 Z',
                            'M0,36 C40,15 80,5 120,36 S200,90 280,68 L280,96 L0,96 Z',
                            'M0,44 C40,25 80,18 120,44 S200,80 280,72 L280,96 L0,96 Z',
                            'M0,40 C40,20 80,10 120,40 S200,85 280,70 L280,96 L0,96 Z'
                          ],
                        }
                      : {}
                  }
                  transition={
                    showChartAnim
                      ? { duration: 3, ease: 'easeInOut', repeat: Infinity }
                      : {}
                  }
                />

                <motion.path
                  d="M0,40 C40,20 80,10 120,40 S200,85 280,70"
                  stroke="#5eead4"
                  strokeWidth="2.8"
                  fill="none"
                  strokeLinecap="round"
                  animate={
                    showChartAnim
                      ? {
                          d: [
                            'M0,40 C40,20 80,10 120,40 S200,85 280,70',
                            'M0,36 C40,15 80,5 120,36 S200,90 280,68',
                            'M0,44 C40,25 80,18 120,44 S200,80 280,72',
                            'M0,40 C40,20 80,10 120,40 S200,85 280,70'
                          ],
                        }
                      : {}
                  }
                  transition={
                    showChartAnim
                      ? { duration: 3, ease: 'easeInOut', repeat: Infinity }
                      : {}
                  }
                />

                {/* ✨ End circle stays attached to line tip */}
                <motion.circle
                  cx="280"
                  cy="70"
                  r="5"
                  fill="#5eead4"
                  animate={
                    showChartAnim
                      ? {
                          cy: [70, 68, 72, 70], // sync with curve peak
                        }
                      : {}
                  }
                  transition={
                    showChartAnim
                      ? { duration: 4.5, ease: 'easeInOut', repeat: Infinity }
                      : {}
                  }
                />
              </svg>
              <div className="absolute -bottom-6 left-4 text-xs text-teal-500">
                Hour 0
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-teal-500">
                Hour 12
              </div>
              <div className="absolute -bottom-6 right-4 text-xs text-teal-500">
                Hour 24
              </div>
              {/* <div className="absolute -left-0 top-0 text-xs text-teal-500">
                100%
              </div>
              <div className="absolute -left-0 top-1/2 transform -translate-y-1/2 text-xs text-teal-500">
                50%
              </div>
              <div className="absolute -left-0 bottom-0 text-xs text-teal-500">
                0%
              </div>
              <div className="absolute -left-0 top-1/4 transform -translate-y-1/2 text-xs text-teal-500">
                75%
              </div> */}
            </motion.div>
          </motion.div>
        )}

        {autoPilotEnabled && <div className="h-8"></div>}

        {/* Animated Task List */}
        {autoPilotEnabled && showOptimized && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="px-6 mb-8">
              <AnimatePresence>
                {animatedTasks.map((task: Task, idx: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className={`mb-4 ${
                      getCategoryStyle(task.category).bgClass
                    } backdrop-blur-md rounded-lg p-4 border border-white/20 w-full relative flex items-center ${
                      glowMap[task.id]
                        ? 'ring-4 ring-teal-200 ring-opacity-60 animate-pulse'
                        : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="text-xs font-medium text-black mb-1">
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {task.time}
                      </div>
                      {task.notes && (
                        <div className="text-xs text-gray-600">
                          Notes: {task.notes}
                        </div>
                      )}
                    </div>
                    {task.movedReason && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="ml-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-100 via-purple-100 to-blue-100 text-teal-900 text-sm font-semibold shadow-sm border border-teal-100/60 backdrop-blur-md animate-pulse"
                      >
                        {task.movedReason}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {postponedCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="fixed bottom-24 left-0 right-0 z-30 flex justify-center"
              >
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-100 via-teal-100 to-purple-100 shadow-lg text-blue-900 font-semibold text-base flex items-center gap-2">
                  1 task postponed to tomorrow for recovery balance.
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {!autoPilotEnabled && (
          <>
            <TaskTracker />
            <Schedule tasks={tasks} onScheduleClick={onScheduleClick} />
          </>
        )}
      </motion.div>
    </>
  );
}

export default function App(): React.ReactElement {
  const [focusEnabled, setFocusEnabled] = useState(true);
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(false);
  const [currentMode, setCurrentMode] = useState("active"); // 'active', 'inactive', or 'calendar'
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [allTasks, setAllTasks] = useState(initialTasksData);

  const handleAddTask = (): void => {
    setIsAddTaskModalOpen(true);
  };

  const handleCloseAddTask = (): void => {
    setIsAddTaskModalOpen(false);
  };

  const handleSaveTask = (newTask: Task): void => {
    setAllTasks(prev => [...prev, newTask]);
    console.log("New task added:", newTask);
  };

  // Get tasks formatted for display
  // Map allTasks category to union type
  const formattedTasks = formatTasksForDisplay(
    allTasks.map(t => ({
      ...t,
      category: (t.category === "Coursework" ? "Coursework" : t.category === "Meeting" ? "Meeting" : t.category === "Exercise" ? "Exercise" : "Rest") as keyof typeof CATEGORIES,
      priority: (t.priority === "High" ? "High" : t.priority === "Medium" ? "Medium" : "Low") as "Low" | "Medium" | "High",
      focusLevel: (t.focusLevel === "High" ? "High" : t.focusLevel === "Medium" ? "Medium" : "Low") as "Low" | "Medium" | "High"
    })
  )
  );
  const groupedTasks = groupTasksByDate(formattedTasks);

  const handleFocusToggle = (enabled: boolean): void => {
    setFocusEnabled(enabled);
    setAutoPilotEnabled(!enabled);
  };

  const handleAutoPilotToggle = (enabled: boolean): void => {
    setAutoPilotEnabled(enabled);
    setFocusEnabled(!enabled);
  };

  const handleModeChange = (mode: string): void => {
    setCurrentMode(mode);
  };

  const handleScheduleClick = (): void => {
    setCurrentMode(currentMode === "calendar" ? "active" : "calendar");
  };

  const handleProfileClick = (): void => {
    setIsProfileOpen(true);
  };

  const handleCloseProfile = (): void => {
    setIsProfileOpen(false);
  };

  const getBackgroundGradient = (): string => {
    if (currentMode === "active" || currentMode === "calendar") {
      return "bg-gradient-to-br from-purple-100/80 via-pink-50 to-blue-50";
    }
    return "bg-gradient-to-br from-gray-800 via-slate-800 to-indigo-900";
  };

  const renderCurrentView = (): React.ReactElement | null => {
    switch (currentMode) {
      case "active":
        return (
          <ActiveMode
            focusEnabled={focusEnabled}
            autoPilotEnabled={autoPilotEnabled}
            onFocusToggle={handleFocusToggle}
            onAutoPilotToggle={handleAutoPilotToggle}
            onScheduleClick={handleScheduleClick}
            onProfileClick={handleProfileClick}
            tasks={formattedTasks.filter((t: Task) => t.date === "2025-04-20")}
          />
        );
      case "inactive":
        return (
          <InactiveMode
            focusEnabled={focusEnabled}
            autoPilotEnabled={autoPilotEnabled}
            onFocusToggle={handleFocusToggle}
            onAutoPilotToggle={handleAutoPilotToggle}
            onProfileClick={handleProfileClick}
          />
        );
      case "calendar":
        return <ExpandedCalendarView onScheduleClick={handleScheduleClick} groupedTasks={groupedTasks} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen max-w-md mx-auto relative ${getBackgroundGradient()}`}>
      {/* Render current view */}
      {renderCurrentView()}

      {/* Fixed Bottom Navigation - only show for active/inactive modes */}
      {currentMode !== "calendar" && (
        <BottomNavigation
          onAddTask={handleAddTask}
          currentMode={currentMode}
          onModeChange={handleModeChange}
        />
      )}
      
      {/* Fixed Bottom Navigation for calendar view */}
      {currentMode === "calendar" && (
        <BottomNavigation
          onAddTask={handleAddTask}
          currentMode="active" // Show active as highlighted since calendar is part of active flow
          onModeChange={handleModeChange}
        />
      )}

      {/* Add Task Modal */}
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={handleCloseAddTask}
        onSave={handleSaveTask}
      />

      {/* User Profile Modal */}
      <UserProfileScreen
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
      />
    </div>
  );
}