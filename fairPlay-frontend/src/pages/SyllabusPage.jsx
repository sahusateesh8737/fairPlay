import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, ChevronRight, Download, FileText, Globe, Cpu, Database, Hash, ShieldCheck, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdvancedBackground from '../components/AdvancedBackground';

const SyllabusPage = () => {
  const syllabusData = [
    {
      subject: "CSE332: Industry Ethics & Legal Issues",
      icon: <ShieldCheck className="text-emerald-400" />,
      description: "apply ethical principles and integrity in professional, business, and IT practices",
      pdfPath: "/syllabus/ethics.pdf",
      modules: [
        "Unit 1: Professional Ethics & Social Responsibility",
        "Unit 2: Intellectual Property Rights (IPR)",
        "Unit 3: Government Funding and Startup schemes",
        "Unit 4: Startup in IT",
        "Unit 5: Companies",
        "Unit 6: Ethical and Professional issues in Information Security"
      ]
    },
    {
      subject: "CSE357: Combinatorial Studies",
      icon: <Hash className="text-pink-400" />,
      description: "understand the fundamental computer science concepts, including data structures, algorithms, databases, operating systems, and computer networks, essential for technical interviews.",
      pdfPath: "/syllabus/combinatorial.pdf",
      modules: [
        "Unit 1: Operating System Basics",
        "Unit 2: Computer Networking Basics ",
        "Unit 3: Database Management Systems (DBMS)",
        "Unit 4: Fundamentals of Programming Languages",
        "Unit 5: Data Structures ",
        "Unit 6: Algorithms"
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-background text-white overflow-x-hidden">
      <AdvancedBackground />
      
      <main className="relative z-10 pt-32 pb-24 px-6 container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/" className="text-primary text-sm font-bold flex items-center gap-2 mb-4 hover:underline">
              <ChevronRight className="rotate-180 w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-5xl font-extrabold tracking-tight">Course <span className="text-gradient">Syllabus</span></h1>
            <p className="text-muted-foreground mt-4 text-lg">Comprehensive roadmap for engineering placements 2024-25.</p>
          </motion.div>
        </div>

        <div className="space-y-12">
          {syllabusData.map((item, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                {React.cloneElement(item.icon, { size: 180 })}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    {React.cloneElement(item.icon, { size: 32 })}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{item.subject}</h2>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a 
                    href={item.pdfPath} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-primary transition-all shadow-lg text-muted-foreground"
                      title="View Syllabus"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                  </a>
                  <a 
                    href={item.pdfPath} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3 bg-primary/20 border border-primary/30 px-6 py-3 rounded-2xl font-bold hover:bg-primary/30 text-primary transition-all shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </motion.button>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {item.modules.map((mod, midx) => (
                  <div key={midx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/30 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-slate-300">{mod}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SyllabusPage;
