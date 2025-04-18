import React from 'react';
import { motion } from 'framer-motion';

// Fix linter error by using motion components explicitly
const MotionDiv = motion.div;

const Overview = () => {
  return (
    <div className="space-y-4 h-full">
      <h2 className="text-xl font-semibold text-gray-800">Health Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Mental Wellbeing', value: '82%', color: 'bg-green-100' },
          { name: 'Physical Activity', value: '65%', color: 'bg-yellow-100' },
          { name: 'Sleep Quality', value: '74%', color: 'bg-blue-100' }
        ].map((stat, index) => (
          <motion.div
            key={stat.name}
            className={`${stat.color} p-4 rounded-lg shadow`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <h3 className="text-gray-700">{stat.name}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <motion.div
          className="bg-white p-4 rounded-lg shadow"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-medium mb-2">Monthly Health Trends</h3>
          <div className="h-[150px] sm:h-[200px] bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400">Health trend chart placeholder</p>
          </div>
        </motion.div>
        <motion.div
          className="bg-white p-4 rounded-lg shadow"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-medium mb-2">Upcoming Appointments</h3>
          <div className="space-y-2">
            <div className="p-2 bg-blue-50 rounded">
              <p className="font-medium">Dr. Smith - Therapy Session</p>
              <p className="text-sm text-gray-600">Tomorrow, 10:00 AM</p>
            </div>
            <div className="p-2 bg-purple-50 rounded">
              <p className="font-medium">Mental Health Check-in</p>
              <p className="text-sm text-gray-600">Friday, 2:30 PM</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Overview;
