import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  Edit,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';

export const EarlyInterventionView = () => {
  const { interventions, addIntervention, updateInterventionStatus, dataset } = useApp();

  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');

  // New intervention form state
  const [newStudentId, setNewStudentId] = useState('');
  const [newActionType, setNewActionType] = useState('Attendance counseling');
  const [newPriority, setNewPriority] = useState('High');
  const [newFaculty, setNewFaculty] = useState('Dr. S. Raman');
  const [newNotes, setNewNotes] = useState('');

  // Statistics calculation
  const stats = useMemo(() => {
    const total = interventions.length;
    const active = interventions.filter(i => i.status === 'In Progress').length;
    const completed = interventions.filter(i => i.status === 'Completed').length;
    const pending = interventions.filter(i => i.status === 'Pending').length;
    return { total, active, completed, pending };
  }, [interventions]);

  const filteredInterventions = useMemo(() => {
    if (filterStatus === 'All') return interventions;
    return interventions.filter(i => i.status === filterStatus);
  }, [interventions, filterStatus]);

  const handleCreateNew = (e) => {
    e.preventDefault();
    const student = dataset.find(s => s.Student_ID === newStudentId) || { Student_Name: "Student", Department: "General" };

    const item = {
      id: `INT-${Date.now()}`,
      studentId: newStudentId || "STU2025001",
      studentName: student.Student_Name,
      department: student.Department,
      riskScore: 75.0,
      mainFactor: "Academic Deficit",
      recommendedAction: newActionType,
      assignedFaculty: newFaculty,
      priority: newPriority,
      status: "Pending",
      assignedDate: new Date().toISOString().split('T')[0],
      notes: newNotes || "Intervention initiated by faculty advisor."
    };

    addIntervention(item);
    setIsModalOpen(false);
    setNewStudentId('');
    setNewNotes('');
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Upper Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Interventions</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Active (In Progress)</span>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.active}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Completed</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.completed}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Pending Action</span>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Intervention Roster Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <HeartHandshake className="w-5 h-5 text-brand-600" />
              <span>Early Intervention Workflow Roster</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Assign counselors, update intervention status, record progress notes, and complete mentoring plans.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Assign New Intervention Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Intervention</span>
            </button>
          </div>
        </div>

        {/* Interventions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold uppercase">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Student & Dept</th>
                <th className="p-3.5">Main Risk Factor</th>
                <th className="p-3.5">Action Plan</th>
                <th className="p-3.5">Assigned Faculty</th>
                <th className="p-3.5 text-center">Priority</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredInterventions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3.5 font-bold text-brand-600">{item.id}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">{item.studentName}</p>
                    <p className="text-[10px] text-slate-400">{item.studentId} • {item.department}</p>
                  </td>
                  <td className="p-3.5 text-red-600 dark:text-red-400 font-semibold">{item.mainFactor}</td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{item.recommendedAction}</td>
                  <td className="p-3.5">{item.assignedFaculty}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      item.priority === 'Critical' ? 'bg-red-500 text-white' :
                      item.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                      item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      item.status === 'In Progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {item.status !== 'Completed' && (
                        <button
                          onClick={() => updateInterventionStatus(item.id, 'In Progress')}
                          className="px-2 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded text-[10px] font-bold"
                        >
                          Start
                        </button>
                      )}
                      {item.status !== 'Completed' && (
                        <button
                          onClick={() => updateInterventionStatus(item.id, 'Completed', 'Intervention goals fulfilled.')}
                          className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded text-[10px] font-bold"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Intervention Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Assign Early Intervention</h3>

            <form onSubmit={handleCreateNew} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Student</label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                >
                  <option value="">-- Choose Student --</option>
                  {dataset.slice(0, 30).map(s => (
                    <option key={s.Student_ID} value={s.Student_ID}>
                      {s.Student_Name} ({s.Student_ID} • {s.Department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Intervention Action Type</label>
                <select
                  value={newActionType}
                  onChange={(e) => setNewActionType(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                >
                  <option value="Attendance counseling">Attendance counseling</option>
                  <option value="Academic mentoring">Academic mentoring</option>
                  <option value="Assignment support">Assignment support</option>
                  <option value="Faculty meeting">Faculty meeting</option>
                  <option value="Peer tutoring">Peer tutoring</option>
                  <option value="Study plan">Study plan</option>
                  <option value="Parent/guardian communication">Parent/guardian communication</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Faculty Notes / Instructions</label>
                <textarea
                  rows="3"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Enter initial mentoring guidelines..."
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
