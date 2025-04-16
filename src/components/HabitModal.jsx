// src/components/HabitModal.jsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { RadioGroup, RadioGroupItem } from "../ui/RadioGroup";
import { formatDate, parseDate } from "../utils/helpers";

const daysOfWeek = [
  { id: 0, label: "Sun" }, { id: 1, label: "Mon" }, { id: 2, label: "Tue" },
  { id: 3, label: "Wed" }, { id: 4, label: "Thu" }, { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

// Inline fallback components for Label and Checkbox
const Label = ({ children, htmlFor, className }) => <label htmlFor={htmlFor} className={className}>{children}</label>;
const Checkbox = ({ id, checked, onCheckedChange, className }) => {
    const handleChange = (event) => { if (onCheckedChange) { onCheckedChange(event.target.checked); } };
    return <input type="checkbox" id={id} checked={!!checked} onChange={handleChange} className={className} />;
};


export const HabitModal = ({
  isOpen,
  onClose,
  editingHabit,
  habitData, // Includes measurable, schedule fields. Category is removed.
  onDataChange,
  onSave,
}) => {

  // Removed 'category' from destructuring
  const {
      title, type, startDate, endDate, scheduleType, scheduleDays, scheduleFrequency,
      isMeasurable, unit, goal
  } = habitData;

  // --- Handlers --- 
  const handleInputChange = (field, value) => { onDataChange({ ...habitData, [field]: value }); };
  const handleScheduleTypeChange = (value) => { const d={...habitData, scheduleType:value}; if(value!=='specific_days')d.scheduleDays=[]; if(value!=='frequency_weekly')d.scheduleFrequency=null; onDataChange(d); };
  const handleDayToggle = (dayId) => { const cD=habitData.scheduleDays||[]; const uD=cD.includes(dayId)?cD.filter(d=>d!==dayId):[...cD, dayId].sort((a,b)=>a-b); onDataChange({...habitData, scheduleDays:uD}); };
  const handleFrequencyChange = (e) => { const v=e.target.value; const f=v===''?null:parseInt(v,10); if(v===''||(!isNaN(f)&&f>0&&f<=7))onDataChange({...habitData,scheduleFrequency:f}); else if(!isNaN(f)&&f<=0)onDataChange({...habitData,scheduleFrequency:null}); };
  const handleMeasurableToggle = (checked) => { const d={...habitData,isMeasurable:checked}; if(!checked){d.unit='';d.goal=null;} onDataChange(d); };
  const handleUnitChange = (e) => { onDataChange({ ...habitData, unit: e.target.value }); };
  const handleGoalChange = (e) => { const v=e.target.value; const gV=v===''?null:parseFloat(v); if(v===''||(!isNaN(gV)&&gV>0))onDataChange({...habitData,goal:gV}); else if(!isNaN(gV)&&gV<=0)onDataChange({...habitData,goal:null}); };

  // Form Validation
  const isFormValid = () => { if(!title||!title.trim())return false; const currentScheduleType=scheduleType||'daily'; if(currentScheduleType==='specific_days'&&(!scheduleDays||scheduleDays.length===0))return false; if(currentScheduleType==='frequency_weekly'&&(scheduleFrequency===null||scheduleFrequency<=0))return false; if(isMeasurable&&(!unit||!unit.trim()||goal===null||goal<=0))return false; const sD=parseDate(startDate);const eD=endDate?parseDate(endDate):null; if(!sD)return false; if(eD&&sD>eD)return false; return true; };


  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle>{editingHabit ? "Edit Habit" : "Add New Habit"}</DialogTitle></DialogHeader>
        <form id="habit-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="space-y-4 pb-4">
            {/* Title */}
            <div>
              <Label htmlFor="habit-title-modal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></Label>
              <Input id="habit-title-modal" value={title} onChange={(e)=>handleInputChange("title", e.target.value)} placeholder="E.g., Exercise daily" className="w-full" autoFocus required maxLength={100}/>
            </div>

            {/* REMOVED Category Input */}

            {/* Type */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Habit Type</Label>
              <RadioGroup value={type || 'good'} onValueChange={(value) => handleInputChange("type", value)} className="flex space-x-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="good" id="type-good" /><Label htmlFor="type-good" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Build Good</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="bad" id="type-bad" /><Label htmlFor="type-bad" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Break Bad</Label></div>
              </RadioGroup>
            </div>

            {/* Measurable Section */}
            <div className="pt-2 space-y-3">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="is-measurable" checked={isMeasurable||false} onCheckedChange={handleMeasurableToggle} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:ring-offset-gray-800 cursor-pointer"/>
                    <Label htmlFor="is-measurable" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Track quantity</Label>
                </div>
                {isMeasurable && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                        <div>
                             <Label htmlFor="habit-unit" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Unit <span className="text-red-500">*</span></Label>
                             <Input id="habit-unit" value={unit||''} onChange={handleUnitChange} placeholder="minutes, glasses, etc." className="w-full" required={isMeasurable} maxLength={30}/>
                        </div>
                         <div>
                             <Label htmlFor="habit-goal" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Daily Goal <span className="text-red-500">*</span></Label>
                             <Input id="habit-goal" type="number" value={goal??''} onChange={handleGoalChange} placeholder="e.g., 8, 15" className="w-full" required={isMeasurable} min="0.01" step="any"/>
                        </div>
                    </div>
                )}
            </div>

            {/* Scheduling Section */}
            <div className="pt-2">
                 <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</Label>
                 <RadioGroup value={scheduleType||'daily'} onValueChange={handleScheduleTypeChange} className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                     <div className="flex items-center space-x-2"><RadioGroupItem value="daily" id="sch-daily" /><Label htmlFor="sch-daily" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Daily</Label></div>
                     <div className="flex items-center space-x-2"><RadioGroupItem value="specific_days" id="sch-specific" /><Label htmlFor="sch-specific" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Specific Days</Label></div>
                     <div className="flex items-center space-x-2"><RadioGroupItem value="frequency_weekly" id="sch-frequency" /><Label htmlFor="sch-frequency" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">X times/week</Label></div>
                 </RadioGroup>
                 {(scheduleType||'daily') === 'specific_days' && (
                     <div className="mt-3 p-3 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                         <Label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Select Days:</Label>
                         <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                             {daysOfWeek.map(day => (<div key={day.id} className="flex items-center space-x-1.5"><Checkbox id={`day-${day.id}`} checked={(scheduleDays||[]).includes(day.id)} onCheckedChange={()=>handleDayToggle(day.id)} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:ring-offset-gray-800 cursor-pointer"/><Label htmlFor={`day-${day.id}`} className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">{day.label}</Label></div>))}
                         </div>
                     </div>)}
                 {(scheduleType||'daily') === 'frequency_weekly' && (
                     <div className="mt-3 p-3 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                         <Label htmlFor="freq-input" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Times per week? <span className="text-red-500">*</span></Label>
                         <Input id="freq-input" type="number" min="1" max="7" step="1" value={scheduleFrequency??''} onChange={handleFrequencyChange} placeholder="e.g., 3" className="w-20" required={(scheduleType||'daily')==='frequency_weekly'}/>
                     </div>)}
             </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <Label htmlFor="habit-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date <span className="text-red-500">*</span></Label>
                <Input id="habit-start" type="date" required value={startDate} onChange={(e)=>handleInputChange("startDate", e.target.value)} className="w-full" max={formatDate(new Date(new Date().getFullYear() + 10, 11, 31))}/>
              </div>
              <div>
                <Label htmlFor="habit-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date <span className="text-xs">(Optional)</span></Label>
                <Input id="habit-end" type="date" value={endDate||''} onChange={(e)=>handleInputChange("endDate", e.target.value||null)} className="w-full" min={startDate||undefined} max={formatDate(new Date(new Date().getFullYear() + 20, 11, 31))}/>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="habit-form" variant="default" disabled={!isFormValid()} className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
              {editingHabit ? "Save Changes" : "Add Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
