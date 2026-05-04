import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Database, PlayCircle, BookOpen, Layers, Terminal, MonitorPlay } from 'lucide-react';

const SQLHub = () => {
  const modules = [
    {
      id: 1,
      day: 'Day 1',
      title: 'SQL Basics Interactive',
      description: 'Master the fundamentals of SQL. Learn how to write your first SELECT statements, understand basic data types, and filter data.',
      path: '/placement-prep/sql/day-1',
      icon: <Database className="w-8 h-8 text-blue-500" />
    },
    {
      id: 2,
      day: 'Day 2',
      title: 'SQL Where Clause',
      description: 'Deep dive into filtering and querying. Master complex WHERE clauses, AND/OR logic, and pattern matching.',
      path: '/placement-prep/sql/day-2',
      icon: <BookOpen className="w-8 h-8 text-purple-500" />
    },
    {
      id: 3,
      day: 'Day 3',
      title: 'Aggregate Functions',
      description: 'Learn to summarize data. Master COUNT, SUM, AVG, MIN, MAX and the powerful GROUP BY clause.',
      path: '/placement-prep/sql/day-3',
      icon: <Database className="w-8 h-8 text-pink-500" />
    },
    {
      id: 4,
      day: 'Day 4',
      title: 'SQL Joins Masterclass',
      description: 'The ultimate guide to combining tables. Learn INNER, LEFT, RIGHT, and FULL joins with interactive visualizations.',
      path: '/placement-prep/sql/day-4',
      icon: <Layers className="w-8 h-8 text-cyan-500" />
    },
    {
      id: 5,
      day: 'Day 5',
      title: 'Mastering Subqueries',
      description: 'Learn to write queries within queries. Master non-correlated and correlated subqueries for complex data extraction.',
      path: '/placement-prep/sql/day-5',
      icon: <Terminal className="w-8 h-8 text-emerald-500" />
    },
    {
      id: 6,
      day: 'Day 6',
      title: 'Window Functions',
      description: 'Master advanced analytical functions. Learn ROW_NUMBER, RANK, DENSE_RANK, and OVER clauses for complex reporting.',
      path: '/placement-prep/sql/day-6',
      icon: <MonitorPlay className="w-8 h-8 text-indigo-500" />
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Placement <span className="text-gradient">Preparation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interactive, day-by-day SQL modules designed to prepare you for top-tier technical interviews.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative"
            >
              <Link to={mod.path} className="block h-full">
                <div className="h-full bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden relative">
                  {/* Background decoration */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-muted rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {mod.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                        {mod.day}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex items-center text-sm font-semibold text-primary gap-2">
                    Start Module <PlayCircle className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SQLHub;
