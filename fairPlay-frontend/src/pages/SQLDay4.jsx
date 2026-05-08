import { motion } from 'framer-motion';
import SQLModuleLayout from '../components/SQLModuleLayout';

const SQLDay4 = () => {
  const titles = [
    '',
    'SQL Basics Interactive Day 1',
    'SQL Where Clause Day 2',
    'Aggregate Functions Day 3',
    'SQL Joins Masterclass Day 4',
    'Mastering Subqueries Day 5',
    'Window Functions Day 6'
  ];

  return (
    <SQLModuleLayout currentDay={4}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full"
      >
        <iframe
          src="/content/sql-day-4.html"
          title={titles[4]}
          className="w-full h-full border-none"
        />
      </motion.div>
    </SQLModuleLayout>
  );
};

export default SQLDay4;
