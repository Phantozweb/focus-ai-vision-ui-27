
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const courses = [
  {
    id: 1,
    title: "Ocular Anatomy and Physiology",
    instructor: "Dr. Rajesh Kumar",
    progress: 75,
    nextClass: "Tomorrow, 10:00 AM",
    materials: 12,
  },
  {
    id: 2,
    title: "Clinical Optometry",
    instructor: "Dr. Meena Patel",
    progress: 50,
    nextClass: "Wednesday, 2:00 PM",
    materials: 8,
  },
  {
    id: 3,
    title: "Contact Lens Practice",
    instructor: "Dr. Venkat Rao",
    progress: 30,
    nextClass: "Thursday, 11:00 AM",
    materials: 5,
  }
];

const assignments = [
  {
    id: 1,
    title: "Case Analysis: Glaucoma Management",
    dueDate: "May 10, 2025",
    course: "Clinical Optometry",
    status: "pending"
  },
  {
    id: 2,
    title: "Lab Report: Corneal Topography",
    dueDate: "May 15, 2025",
    course: "Contact Lens Practice",
    status: "pending"
  },
  {
    id: 3,
    title: "Research Paper: Binocular Vision",
    dueDate: "May 5, 2025",
    course: "Ocular Anatomy and Physiology",
    status: "completed"
  }
];

const Academics = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl text-blue-400 font-medium">Academics</h1>
            <Button 
              onClick={() => toast.info("This would show your full academic calendar")}
              variant="outline"
              className="bg-darkBg border-slate-700 text-slate-300"
            >
              View Calendar
            </Button>
          </div>
          
          <div className="tool-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
            <div className="space-y-6">
              {courses.map(course => (
                <div key={course.id} className="border border-slate-800 rounded-lg p-4 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => toast.info(`Opening ${course.title} course details`)}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                    <span className="text-xs text-blue-400 bg-blue-900/20 py-1 px-2 rounded-full">
                      {course.materials} materials
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">Instructor: {course.instructor}</p>
                  
                  <div className="mb-2">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{course.progress}% complete</span>
                    <span className="text-slate-400">Next class: {course.nextClass}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="tool-card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Upcoming Assignments</h2>
              <Button 
                onClick={() => toast.info("This would show all assignments")}
                variant="outline"
                className="bg-darkBg border-slate-700 text-slate-300 text-xs"
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {assignments.map(assignment => (
                <div 
                  key={assignment.id} 
                  className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer ${
                    assignment.status === 'completed' 
                      ? 'border-green-800/50 bg-green-900/10'
                      : 'border-slate-800 hover:border-blue-500/50'
                  } transition-colors`}
                  onClick={() => toast.info(`Opening ${assignment.title} details`)}
                >
                  <div>
                    <h3 className={`font-medium ${assignment.status === 'completed' ? 'text-green-400' : 'text-white'}`}>
                      {assignment.title}
                    </h3>
                    <p className="text-slate-400 text-sm">Course: {assignment.course}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-sm ${assignment.status === 'completed' ? 'text-green-400' : 'text-blue-400'}`}>
                      {assignment.status === 'completed' ? 'Completed' : `Due: ${assignment.dueDate}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="tool-card">
            <h2 className="text-2xl font-bold text-white mb-4">Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ResourceButton 
                title="Syllabus" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <ResourceButton 
                title="Class Schedule" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              />
              <ResourceButton 
                title="Faculty Contact" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              />
              <ResourceButton 
                title="Library" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
              />
              <ResourceButton 
                title="Exam Schedule" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              />
              <ResourceButton 
                title="Academic Policies" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface ResourceButtonProps {
  title: string;
  icon: React.ReactNode;
}

const ResourceButton = ({ title, icon }: ResourceButtonProps) => {
  return (
    <Button
      variant="outline"
      className="border-slate-800 bg-darkBg hover:border-blue-500/50 text-slate-300 h-auto py-4 flex items-center gap-3 justify-start"
      onClick={() => toast.info(`Opening ${title}`)}
    >
      <span className="text-blue-400">{icon}</span>
      <span>{title}</span>
    </Button>
  );
};

export default Academics;
