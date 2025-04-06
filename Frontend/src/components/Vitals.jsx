import React from 'react';
import { motion } from 'framer-motion';

// Motion components
const MotionDiv = motion.div;

const Vitals = () => {
  return (
    <div className="space-y-4 h-full">
      <h2 className="text-xl font-semibold text-gray-800">Vital Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Heart Rate', value: '72 bpm', icon: '❤️' },
          { name: 'Blood Pressure', value: '120/80', icon: '🩸' },
          { name: 'Stress Level', value: 'Moderate', icon: '😌' },
          { name: 'Sleep Duration', value: '7.5 hrs', icon: '😴' }
        ].map((vital, index) => (
          <MotionDiv
            key={vital.name}
            className="bg-white p-4 rounded-lg shadow"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{vital.icon}</span>
              <h3 className="text-gray-700">{vital.name}</h3>
            </div>
            <p className="text-xl font-bold">{vital.value}</p>
          </MotionDiv>
        ))}
      </div>
      <MotionDiv 
        className="bg-white p-4 rounded-lg shadow mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-medium mb-4">Weekly Mental Health Patterns</h3>
        <div className="h-[250px] bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">Mental health chart placeholder</p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Vitals; 