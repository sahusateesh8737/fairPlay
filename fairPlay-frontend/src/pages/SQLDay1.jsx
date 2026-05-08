import { motion } from 'framer-motion';
import SQLModuleLayout from '../components/SQLModuleLayout';

const SQLDay1 = () => {
  return (
    <SQLModuleLayout currentDay={1}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full"
      >
        <iframe
          src="/content/sql-day-1.html"
          title="SQL Basics Interactive Day 1"
          className="w-full h-full border-none"
        />
      </motion.div>
    </SQLModuleLayout>
  );
};

export default SQLDay1;
