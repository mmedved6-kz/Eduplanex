"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OptimizationProgressProps {
  progressData: {
    generations: number[];
    bestFitnessScore: number[];
    hardViolationsCount: number[];
    softViolationsCount: number[];
  } | null;
}

const OptimizationChart = ({ progressData }: OptimizationProgressProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (progressData) {
      // Transform the data for the chart
      const formattedData = progressData.generations.map((gen, index) => ({
        generation: gen,
        fitness: progressData.bestFitnessScore[index],
        hardViolations: progressData.hardViolationsCount[index],
        softViolations: progressData.softViolationsCount[index],
      }));
      
      setChartData(formattedData);
    }
  }, [progressData]);

  if (!progressData || chartData.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">No optimization data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Optimization Progress</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="generation" label={{ value: 'Generation', position: 'insideBottomRight', offset: -10 }} />
            <YAxis yAxisId="left" label={{ value: 'Fitness Score', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Violations', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="fitness" stroke="#4285F4" name="Fitness Score" />
            <Line yAxisId="right" type="monotone" dataKey="hardViolations" stroke="#EA4335" name="Hard Violations" />
            <Line yAxisId="right" type="monotone" dataKey="softViolations" stroke="#FBBC05" name="Soft Violations" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium">Initial Fitness: {chartData[0]?.fitness.toFixed(2)}</p>
          <p className="text-sm font-medium">Final Fitness: {chartData[chartData.length-1]?.fitness.toFixed(2)}</p>
          <p className="text-xs text-gray-600 mt-1">
            {((chartData[chartData.length-1]?.fitness / chartData[0]?.fitness) * 100 - 100).toFixed(2)}% improvement
          </p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm font-medium">Initial Violations: {chartData[0]?.hardViolations + chartData[0]?.softViolations}</p>
          <p className="text-sm font-medium">Final Violations: {chartData[chartData.length-1]?.hardViolations + chartData[chartData.length-1]?.softViolations}</p>
          <p className="text-xs text-gray-600 mt-1">
            {chartData[chartData.length-1]?.hardViolations === 0 ? "All hard constraints satisfied" : `${chartData[chartData.length-1]?.hardViolations} hard violations remain`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptimizationChart;