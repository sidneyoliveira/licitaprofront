// src/components/StatCard.js
import React from 'react';

const StatCard = ({ title, value, icon }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
            <div className="text-4xl text-blue-500">
                {icon}
            </div>
        </div>
    );
};

export default StatCard;