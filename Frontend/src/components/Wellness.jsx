import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const MotionDiv = motion.div;
const MotionButton = motion.button;

const Wellness = () => {
  // Load data from localStorage or set defaults
  const [sleepData, setSleepData] = useState(() => {
    const saved = localStorage.getItem('wellness_sleep');
    return saved ? JSON.parse(saved) : {
      today: 0,
      history: [7, 6.5, 8, 7.5, 6, 7, 8],
      labels: ["7 days ago", "6 days ago", "5 days ago", "4 days ago", "3 days ago", "2 days ago", "Yesterday"]
    };
  });

  const [stepsData, setStepsData] = useState(() => {
    const saved = localStorage.getItem('wellness_steps');
    return saved ? JSON.parse(saved) : {
      today: 0,
      history: [5200, 6800, 7500, 4300, 8200, 7600, 6100],
      labels: ["7 days ago", "6 days ago", "5 days ago", "4 days ago", "3 days ago", "2 days ago", "Yesterday"]
    };
  });

  const [wellbeingScore, setWellbeingScore] = useState(() => {
    const saved = localStorage.getItem('wellness_score');
    return saved ? JSON.parse(saved) : {
      current: 75,
      history: [68, 72, 80, 65, 75, 82, 78],
      labels: ["7 days ago", "6 days ago", "5 days ago", "4 days ago", "3 days ago", "2 days ago", "Yesterday"]
    };
  });

  // Input states
  const [sleepHours, setSleepHours] = useState('');
  const [stepCount, setStepCount] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wellness_sleep', JSON.stringify(sleepData));
    localStorage.setItem('wellness_steps', JSON.stringify(stepsData));
    localStorage.setItem('wellness_score', JSON.stringify(wellbeingScore));
  }, [sleepData, stepsData, wellbeingScore]);

  // Calculate wellbeing score based on sleep and steps
  const calculateWellbeing = (sleep, steps) => {
    // Sleep score (optimal around 7-8 hours)
    let sleepScore = 0;
    if (sleep >= 7 && sleep <= 9) {
      sleepScore = 50; // Optimal sleep
    } else if (sleep >= 6 && sleep < 7) {
      sleepScore = 40; // Slightly under
    } else if (sleep > 9 && sleep <= 10) {
      sleepScore = 40; // Slightly over
    } else if (sleep >= 5 && sleep < 6) {
      sleepScore = 30; // Under
    } else if (sleep > 10) {
      sleepScore = 30; // Over
    } else if (sleep >= 4 && sleep < 5) {
      sleepScore = 20; // Very under
    } else {
      sleepScore = 10; // Severely under or over
    }

    // Steps score (target 10,000 steps)
    let stepsScore = 0;
    if (steps >= 10000) {
      stepsScore = 50; // Excellent
    } else if (steps >= 7500) {
      stepsScore = 40; // Very good
    } else if (steps >= 5000) {
      stepsScore = 30; // Good
    } else if (steps >= 2500) {
      stepsScore = 20; // Fair
    } else {
      stepsScore = 10; // Needs improvement
    }

    return sleepScore + stepsScore;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse inputs
    const newSleepHours = parseFloat(sleepHours);
    const newStepCount = parseInt(stepCount, 10);
    
    if (isNaN(newSleepHours) || isNaN(newStepCount)) {
      alert('Please enter valid numbers for sleep hours and steps.');
      return;
    }
    
    // Calculate new wellbeing score
    const newScore = calculateWellbeing(newSleepHours, newStepCount);
    
    // Update sleep data
    const newSleepData = {
      today: newSleepHours,
      history: [...sleepData.history.slice(1), newSleepHours],
      labels: [...sleepData.labels.slice(1), 'Today']
    };
    
    // Update steps data
    const newStepsData = {
      today: newStepCount,
      history: [...stepsData.history.slice(1), newStepCount],
      labels: [...stepsData.labels.slice(1), 'Today']
    };
    
    // Update wellbeing score
    const newWellbeingData = {
      current: newScore,
      history: [...wellbeingScore.history.slice(1), newScore],
      labels: [...wellbeingScore.labels.slice(1), 'Today']
    };
    
    // Update states
    setSleepData(newSleepData);
    setStepsData(newStepsData);
    setWellbeingScore(newWellbeingData);
    
    // Reset form
    setSleepHours('');
    setStepCount('');
    setShowForm(false);
  };

  // Chart data for sleep
  const sleepChartData = {
    labels: sleepData.labels,
    datasets: [
      {
        label: 'Sleep Hours',
        data: sleepData.history,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Chart data for steps
  const stepsChartData = {
    labels: stepsData.labels,
    datasets: [
      {
        label: 'Steps',
        data: stepsData.history,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderWidth: 1
      }
    ]
  };

  // Chart data for wellbeing score
  const wellbeingChartData = {
    labels: wellbeingScore.labels,
    datasets: [
      {
        label: 'Wellbeing Score',
        data: wellbeingScore.history,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Doughnut chart for today's wellbeing score
  const scoreData = {
    labels: ['Wellbeing', 'Remaining'],
    datasets: [
      {
        data: [wellbeingScore.current, 100 - wellbeingScore.current],
        backgroundColor: [
          wellbeingScore.current >= 80 ? 'rgba(75, 192, 75, 0.8)' : 
          wellbeingScore.current >= 60 ? 'rgba(255, 205, 86, 0.8)' : 
          'rgba(255, 99, 132, 0.8)',
          'rgba(220, 220, 220, 0.3)'
        ],
        borderWidth: 0
      }
    ]
  };

  // Get wellbeing status message
  const getWellbeingStatus = (score) => {
    if (score >= 90) return { message: "Excellent", color: "text-green-600" };
    if (score >= 80) return { message: "Very Good", color: "text-green-500" };
    if (score >= 70) return { message: "Good", color: "text-green-400" };
    if (score >= 60) return { message: "Fair", color: "text-yellow-500" };
    if (score >= 50) return { message: "Okay", color: "text-yellow-600" };
    if (score >= 40) return { message: "Could Be Better", color: "text-orange-500" };
    if (score >= 30) return { message: "Needs Attention", color: "text-orange-600" };
    return { message: "Needs Improvement", color: "text-red-500" };
  };

  const status = getWellbeingStatus(wellbeingScore.current);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Wellness Tracking</h2>
        <MotionButton
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showForm ? 'Cancel' : 'Add Today\'s Data'}
        </MotionButton>
      </div>

      {/* Input Form */}
      {showForm && (
        <MotionDiv
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-4 rounded-lg shadow"
        >
          <h3 className="font-medium mb-3">Enter Today's Data</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700 mb-1">
                Hours of Sleep
              </label>
              <input
                type="number"
                id="sleepHours"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                step="0.1"
                min="0"
                max="24"
                placeholder="e.g. 7.5"
                required
              />
            </div>
            <div>
              <label htmlFor="stepCount" className="block text-sm font-medium text-gray-700 mb-1">
                Steps Walked
              </label>
              <input
                type="number"
                id="stepCount"
                value={stepCount}
                onChange={(e) => setStepCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
                max="100000"
                placeholder="e.g. 8000"
                required
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Data
              </button>
            </div>
          </form>
        </MotionDiv>
      )}

      {/* Wellbeing Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MotionDiv
          className="bg-white p-4 rounded-lg shadow col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-medium mb-3 text-center">Today's Wellbeing</h3>
          <div className="flex flex-col items-center">
            <div className="h-36 w-36 relative mb-4">
              <Doughnut data={scoreData} options={{
                circumference: 360,
                cutout: '80%',
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }} />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold">{wellbeingScore.current}</span>
                <span className="text-xs text-gray-500">out of 100</span>
              </div>
            </div>
            <h4 className={`text-xl font-medium ${status.color}`}>{status.message}</h4>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Today's Sleep: <span className="font-medium">{sleepData.today} hours</span></p>
              <p>Today's Steps: <span className="font-medium">{stepsData.today.toLocaleString()}</span></p>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          className="bg-white p-4 rounded-lg shadow col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="font-medium mb-3">Wellbeing Trend</h3>
          <div className="h-64">
            <Line data={wellbeingChartData} options={chartOptions} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Your wellbeing score is based on sleep quality and physical activity.
              Try to maintain 7-8 hours of sleep and at least 8,000 steps daily for optimal health.
            </p>
          </div>
        </MotionDiv>
      </div>

      {/* Sleep & Steps Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionDiv
          className="bg-white p-4 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-medium mb-3">Sleep History</h3>
          <div className="h-60">
            <Line 
              data={sleepChartData} 
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    min: 0,
                    max: 12,
                    title: {
                      display: true,
                      text: 'Hours'
                    }
                  }
                }
              }} 
            />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>Recommended: 7-8 hours of quality sleep per night</p>
          </div>
        </MotionDiv>

        <MotionDiv
          className="bg-white p-4 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="font-medium mb-3">Steps History</h3>
          <div className="h-60">
            <Bar 
              data={stepsChartData} 
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'Steps'
                    }
                  }
                }
              }} 
            />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>Goal: 10,000 steps per day for optimal physical activity</p>
          </div>
        </MotionDiv>
      </div>

      {/* Recommendations */}
      <MotionDiv
        className="bg-white p-4 rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="font-medium mb-3">Personalized Recommendations</h3>
        <div className="space-y-2">
          {wellbeingScore.current < 70 && sleepData.today < 7 && (
            <div className="flex items-start bg-blue-50 p-3 rounded-lg">
              <span className="text-blue-600 mt-0.5 mr-2">💤</span>
              <div>
                <p className="text-sm font-medium text-blue-800">Improve Your Sleep</p>
                <p className="text-xs text-blue-600">Try to get at least 7 hours of sleep tonight. Consider going to bed 30 minutes earlier.</p>
              </div>
            </div>
          )}
          
          {wellbeingScore.current < 70 && stepsData.today < 5000 && (
            <div className="flex items-start bg-green-50 p-3 rounded-lg">
              <span className="text-green-600 mt-0.5 mr-2">👟</span>
              <div>
                <p className="text-sm font-medium text-green-800">Increase Your Activity</p>
                <p className="text-xs text-green-600">Try to take a 20-minute walk today to boost your step count and improve your mood.</p>
              </div>
            </div>
          )}
          
          {wellbeingScore.current >= 80 && (
            <div className="flex items-start bg-indigo-50 p-3 rounded-lg">
              <span className="text-indigo-600 mt-0.5 mr-2">🌟</span>
              <div>
                <p className="text-sm font-medium text-indigo-800">Keep Up the Good Work!</p>
                <p className="text-xs text-indigo-600">Your wellness habits are excellent. Maintain this routine for optimal mental and physical health.</p>
              </div>
            </div>
          )}
          
          {wellbeingScore.current < 80 && wellbeingScore.current >= 60 && (
            <div className="flex items-start bg-yellow-50 p-3 rounded-lg">
              <span className="text-yellow-600 mt-0.5 mr-2">✨</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">You're On The Right Track</p>
                <p className="text-xs text-yellow-600">Small improvements in your sleep schedule or daily activity can boost your wellbeing score.</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start bg-purple-50 p-3 rounded-lg">
            <span className="text-purple-600 mt-0.5 mr-2">🧠</span>
            <div>
              <p className="text-sm font-medium text-purple-800">Mental Wellness Tip</p>
              <p className="text-xs text-purple-600">Take 5 minutes today for mindful breathing or meditation to reduce stress and improve mental clarity.</p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Wellness; 