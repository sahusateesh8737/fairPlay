require('dotenv').config();
const prisma = require('./src/config/prisma');

const practiceProblems = [
  {
    title: 'Hello React World',
    description: 'Create a simple React component that renders an <h1> tag saying "Hello React!". This is the most basic building block of any React application.',
    difficulty: 'Easy',
    boilerplate: `import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  // Write your code here
  return null;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  },
  {
    title: 'Interactive Counter',
    description: 'Build a counter component with a "+" and "-" button to increment and decrement a state value. Use the useState hook to manage the count state.',
    difficulty: 'Easy',
    boilerplate: `import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Count: {count}</h1>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">+</button>
        <button className="px-4 py-2 bg-red-500 text-white rounded">-</button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);`
  },
  {
    title: 'Dynamic To-Do List',
    description: 'Create a To-Do list where users can type in a text input, click "Add", and see their item appear in an unordered list below. Use state to manage the array of tasks.',
    difficulty: 'Medium',
    boilerplate: `import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    if (input.trim()) {
      setTasks([...tasks, input]);
      setInput('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Todo List</h1>
      <div className="flex gap-2 mb-4">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          className="border p-2 flex-1 rounded" 
          placeholder="Add a task" 
        />
        <button onClick={addTask} className="px-4 py-2 bg-green-500 text-white rounded">Add</button>
      </div>
      <ul className="list-disc pl-5">
        {/* Render your tasks here */}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TodoApp />);`
  },
  {
    title: 'Profile Card Component',
    description: 'Build a reusable ProfileCard component that accepts props (name, role, imageUrl) and renders a styled card. Practice passing data from a parent component.',
    difficulty: 'Easy',
    boilerplate: `import React from 'react';
import ReactDOM from 'react-dom/client';

function ProfileCard(props) {
  return (
    <div className="border rounded-xl p-4 shadow-sm flex items-center gap-4 max-w-sm mx-auto mt-10">
      <img src={props.imageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
      <div>
        <h2 className="text-lg font-bold">{props.name}</h2>
        <p className="text-gray-500 text-sm">{props.role}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ProfileCard 
      name="Alex Developer" 
      role="Frontend Engineer" 
      imageUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  },
  {
    title: 'Data Fetcher (useEffect)',
    description: 'Use the useEffect hook to simulate fetching a list of users from an API when the component mounts. Display a "Loading..." message until the data arrives after 2 seconds.',
    difficulty: 'Medium',
    boilerplate: `import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(['Alice', 'Bob', 'Charlie']);
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) return <div className="p-4 text-center">Loading users...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">User Directory</h1>
      <ul className="list-disc pl-5">
        {users.map((user, idx) => (
          <li key={idx} className="mb-2">{user}</li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UserList />);`
  }
];

async function main() {
  console.log('Clearing old practice problems...');
  await prisma.practiceProblem.deleteMany({});
  
  console.log('Seeding 5 new practice problems...');
  for (const problem of practiceProblems) {
    await prisma.practiceProblem.create({
      data: problem
    });
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
