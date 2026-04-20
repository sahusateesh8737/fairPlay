import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ShieldAlert, BarChart3, Download, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { CSVLink } from 'react-csv';
import axios from 'axios';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#3b82f6'];

const AssignmentAnalytics = ({ assignmentId, csvData }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/assignment/${assignmentId}`);
        setAnalytics(res.data.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [assignmentId]);

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!analytics) return <div>Failed to load analytics.</div>;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Total Submissions</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalSubmissions}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Class Performance</span>
          </div>
          <p className="text-2xl font-bold text-green-500">Analytics Active</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Download className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Reports</span>
            </div>
            <CSVLink
              data={csvData}
              filename={`gradebook-${analytics.assignmentTitle}.csv`}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Export CSV
            </CSVLink>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-tight">
            <BarChart3 className="w-4 h-4 text-primary" /> Score Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="range" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Integrity Breakdown */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-tight">
            <ShieldAlert className="w-4 h-4 text-red-500" /> Integrity Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.integrityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.integrityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {analytics.integrityData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-[2px]">
               <div className="text-center p-4">
                  <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">No Violations Logged</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentAnalytics;
