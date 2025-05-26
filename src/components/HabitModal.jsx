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
import { Label as CustomLabel } from "../ui/Label"; 

const daysOfWeek = [
  { id: 0, label: "Sun" }, { id: 1, label: "Mon" }, { id: 2, label: "Tue" },
  { id: 3, label: "Wed" }, { id: 4, label: "Thu" }, { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

const Checkbox = ({ id, checked, onCheckedChange, className, children }) => {
    const handleChange = (event) => { if (onCheckedChange) { onCheckedChange(event.target.checked); } };
    return (
        <CustomLabel htmlFor={id} className={`flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer ${className || ''}`}>
            <input type="checkbox" id={id} checked={!!checked} onChange={handleChange} className={'h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:ring-offset-gray-800 cursor-pointer'} />
            <span>{children}</span>
        </CustomLabel>
    );
};

export const HabitModal = ({
  isOpen,
  onClose,
  editingHabit,
  habitData,
  onDataChange,
  onSave,
}) => {

  const {
      title, type, startDate, endDate, scheduleType, scheduleDays, scheduleFrequency,
      isMeasurable, unit, goal
  } = habitData;

  const handleInputChange = (field, value) => { onDataChange({ ...habitData, [field]: value }); };
  const handleScheduleTypeChange = (value) => { const d={...habitData, scheduleType:value}; if(value!=='specific_days')d.scheduleDays=[]; if(value!=='frequency_weekly')d.scheduleFrequency=null; onDataChange(d); };
  const handleDayToggle = (dayId) => { const cD=habitData.scheduleDays||[]; const uD=cD.includes(dayId)?cD.filter(d=>d!==dayId):[...cD, dayId].sort((a,b)=>a-b); onDataChange({...habitData, scheduleDays:uD}); };
  const handleFrequencyChange = (e) => { const v=e.target.value; const f=v===''?null:parseInt(v,10); if(v===''||(!isNaN(f)&&f>0&&f<=7))onDataChange({...habitData,scheduleFrequency:f}); else if(!isNaN(f)&&f<=0)onDataChange({...habitData,scheduleFrequency:null}); };
  const handleMeasurableToggle = (checked) => { const d={...habitData,isMeasurable:checked}; if(!checked){d.unit='';d.goal=null;} onDataChange(d); };
  const handleUnitChange = (e) => { onDataChange({ ...habitData, unit: e.target.value }); };
  const handleGoalChange = (e) => { const v=e.target.value; const gV=v===''?null:parseFloat(v); if(v===''||(!isNaN(gV)&&gV>0))onDataChange({...habitData,goal:gV}); else if(!isNaN(gV)&&gV<=0)onDataChange({...habitData,goal:null}); };

  const isFormValid = () => { if(!title||!title.trim())return false; const currentScheduleType=scheduleType||'daily'; if(currentScheduleType==='specific_days'&&(!scheduleDays||scheduleDays.length===0))return false; if(currentScheduleType==='frequency_weekly'&&(scheduleFrequency===null||scheduleFrequency<=0))return false; if(isMeasurable&&(!unit||!unit.trim()||goal===null||goal<=0))return false; const sD=parseDate(startDate);const eD=endDate?parseDate(endDate):null; if(!sD)return false; if(eD&&sD>eD)return false; return true; };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader><DialogTitle>{editingHabit ? "Edit Habit" : "Add New Habit"}</DialogTitle></DialogHeader>
        <form id="habit-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          <div className="space-y-4 pb-4">
            <div>
              <CustomLabel htmlFor="habit-title-modal">Title <span className="text-red-500">*</span></CustomLabel>
              <Input id="habit-title-modal" value={title} onChange={(e)=>handleInputChange("title", e.target.value)} placeholder="E.g., Exercise daily" className="w-full mt-1" autoFocus required maxLength={100}/>
            </div>

            <div>
              <CustomLabel className="mb-2 block">Habit Type</CustomLabel>
              <RadioGroup name="habitTypeModal" value={type || 'good'} onValueChange={(value) => handleInputChange("type", value)} className="flex space-x-4 mt-1">
                <CustomLabel htmlFor="type-good-modal" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <RadioGroupItem value="good" id="type-good-modal" />
                  <span>Build Good</span>
                </CustomLabel>
                <CustomLabel htmlFor="type-bad-modal" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <RadioGroupItem value="bad" id="type-bad-modal" />
                  <span>Break Bad</span>
                </CustomLabel>
              </RadioGroup>
            </div>

            <div className="pt-2 space-y-3">
                <Checkbox id="is-measurable-modal" checked={isMeasurable||false} onCheckedChange={handleMeasurableToggle}>Track quantity</Checkbox>
                {isMeasurable && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                        <div>
                             <CustomLabel htmlFor="habit-unit-modal" className="text-xs">Unit <span className="text-red-500">*</span></CustomLabel>
                             <Input id="habit-unit-modal" value={unit||''} onChange={handleUnitChange} placeholder="minutes, glasses, etc." className="w-full mt-1" required={isMeasurable} maxLength={30}/>
                        </div>
                         <div>
                             <CustomLabel htmlFor="habit-goal-modal" className="text-xs">Daily Goal <span className="text-red-500">*</span></CustomLabel>
                             <Input id="habit-goal-modal" type="number" value={goal??''} onChange={handleGoalChange} placeholder="e.g., 8, 15" className="w-full mt-1" required={isMeasurable} min="0.01" step="any"/>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-2">
                 <CustomLabel className="mb-2 block">Schedule</CustomLabel>
                 <RadioGroup name="scheduleTypeModal" value={scheduleType||'daily'} onValueChange={handleScheduleTypeChange} className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-1">
                     <CustomLabel htmlFor="sch-daily-modal" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <RadioGroupItem value="daily" id="sch-daily-modal" />
                        <span>Daily</span>
                     </CustomLabel>
                     <CustomLabel htmlFor="sch-specific-modal" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <RadioGroupItem value="specific_days" id="sch-specific-modal" />
                        <span>Specific Days</span>
                     </CustomLabel>
                     <CustomLabel htmlFor="sch-frequency-modal" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <RadioGroupItem value="frequency_weekly" id="sch-frequency-modal" />
                        <span>X times/week</span>
                     </CustomLabel>
                 </RadioGroup>
                 {(scheduleType||'daily') === 'specific_days' && (
                     <div className="mt-3 p-3 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                         <CustomLabel className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Select Days:</CustomLabel>
                         <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                             {daysOfWeek.map(day => (<Checkbox key={day.id} id={`day-${day.id}-modal`} checked={(scheduleDays||[]).includes(day.id)} onCheckedChange={()=>handleDayToggle(day.id)}>{day.label}</Checkbox>))}
                         </div>
                     </div>)}
                 {(scheduleType||'daily') === 'frequency_weekly' && (
                     <div className="mt-3 p-3 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                         <CustomLabel htmlFor="freq-input-modal" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Times per week? <span className="text-red-500">*</span></CustomLabel>
                         <Input id="freq-input-modal" type="number" min="1" max="7" step="1" value={scheduleFrequency??''} onChange={handleFrequencyChange} placeholder="e.g., 3" className="w-20 mt-1" required={(scheduleType||'daily')==='frequency_weekly'}/>
                     </div>)}
             </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <CustomLabel htmlFor="habit-start-modal">Start Date <span className="text-red-500">*</span></CustomLabel>
                <Input id="habit-start-modal" type="date" required value={startDate} onChange={(e)=>handleInputChange("startDate", e.target.value)} className="w-full mt-1" max={formatDate(new Date(new Date().getFullYear() + 10, 11, 31))}/>
              </div>
              <div>
                <CustomLabel htmlFor="habit-end-modal">End Date <span className="text-xs">(Optional)</span></CustomLabel>
                <Input id="habit-end-modal" type="date" value={endDate||''} onChange={(e)=>handleInputChange("endDate", e.target.value||null)} className="w-full mt-1" min={startDate||undefined} max={formatDate(new Date(new Date().getFullYear() + 20, 11, 31))}/>
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
