import { motion } from 'framer-motion';
import SQLModuleLayout from '../components/SQLModuleLayout';

const SQLDay8 = () => {
  return (
    <SQLModuleLayout currentDay={8}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full"
      >
        <iframe
          src="/content/sql-day-8.html"
          title="SQL Basics Interactive Day 8"
          className="w-full h-full border-none"
        />
      </motion.div>
    </SQLModuleLayout>
  );
};

export default SQLDay8;
