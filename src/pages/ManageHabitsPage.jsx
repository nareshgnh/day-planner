// src/pages/ManageHabitsPage.jsx
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { Label as CustomLabel } from '../ui/Label';
import { ListChecks, Plus, Edit, Trash2 } from 'lucide-react';

const ManageHabitsPage = ({ habits, openModalForEditHabit, handleDeleteHabitCallback, openModalForNewHabit, habitLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'good', 'bad'
  const [sortBy, setSortBy] = useState('title_asc');

  const getHabitWithStreak = (habit) => {
    let currentStreak = 0;
    // Placeholder for actual streak calculation.
    return { ...habit, currentStreak }; 
  };

  const filteredAndSortedHabits = useMemo(() => {
    if (!habits) return [];
    let processedHabits = habits.map(habit => getHabitWithStreak(habit));

    processedHabits = processedHabits.filter(habit => {
      const matchesSearchTerm = habit.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || habit.type === filterType;
      return matchesSearchTerm && matchesType;
    });

    processedHabits.sort((a, b) => {
      switch (sortBy) {
        case 'title_asc': return a.title.localeCompare(b.title);
        case 'title_desc': return b.title.localeCompare(a.title);
        case 'startDate_asc': return new Date(a.startDate) - new Date(b.startDate);
        case 'startDate_desc': return new Date(b.startDate) - new Date(a.startDate);
        case 'streak_desc': return (b.currentStreak || 0) - (a.currentStreak || 0);
        case 'streak_asc': return (a.currentStreak || 0) - (b.currentStreak || 0);
        default: return 0;
      }
    });
    return processedHabits;
  }, [habits, searchTerm, filterType, sortBy, habitLog]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <ListChecks size={28} className="mr-3 text-indigo-600 dark:text-indigo-400" />
          Manage All Habits
        </h2>
        <Button onClick={openModalForNewHabit} className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap">
          <Plus size={18} className="mr-1.5" /> Add New Habit
        </Button>
      </div>

      <Card className='flex-shrink-0'>
        <CardContent className="pt-4 pb-4 space-y-4 md:space-y-0 md:flex md:flex-wrap md:justify-between md:items-end gap-4">
          <div className='flex-grow min-w-[200px]'>
            <CustomLabel htmlFor="search-habits-manage">Search Habits</CustomLabel>
            <Input
              id="search-habits-manage"
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mt-1"
            />
          </div>
          <div className='flex items-end gap-4 flex-wrap'>
            <div>
              <CustomLabel className="mb-1.5 block">Filter by Type</CustomLabel>
              <RadioGroup name="filterTypeManagePage" value={filterType} onValueChange={setFilterType} className="flex space-x-3 items-center mt-1">
                <CustomLabel htmlFor="type-all-managepage" className="flex items-center space-x-1.5 text-sm font-normal cursor-pointer mb-0">
                    <RadioGroupItem value="all" id="type-all-managepage" />
                    <span>All</span>
                </CustomLabel>
                <CustomLabel htmlFor="type-good-filter-managepage" className="flex items-center space-x-1.5 text-sm font-normal cursor-pointer mb-0">
                    <RadioGroupItem value="good" id="type-good-filter-managepage" />
                    <span>Good</span>
                </CustomLabel>
                <CustomLabel htmlFor="type-bad-filter-managepage" className="flex items-center space-x-1.5 text-sm font-normal cursor-pointer mb-0">
                    <RadioGroupItem value="bad" id="type-bad-filter-managepage" />
                    <span>Bad</span>
                </CustomLabel>
              </RadioGroup>
            </div>
            <div>
              <CustomLabel htmlFor="sort-by-manage">Sort By</CustomLabel>
              <select 
                id="sort-by-manage" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 w-full sm:w-auto rounded-md border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-50 mt-1"
              >
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="startDate_asc">Start Date (Oldest)</option>
                <option value="startDate_desc">Start Date (Newest)</option>
                <option value="streak_desc">Streak (Highest First)</option>
                <option value="streak_asc">Streak (Lowest First)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-grow overflow-y-auto scrollbar-thin pr-1 pb-4">
        {filteredAndSortedHabits && filteredAndSortedHabits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedHabits.map(habit => (
              <Card key={habit.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md truncate" title={habit.title}>{habit.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-600 dark:text-gray-400 space-y-1 flex-grow">
                  <p>Type: <span className="font-medium">{habit.type === 'bad' ? 'Break Bad' : 'Build Good'}</span></p>
                  <p>Start Date: <span className="font-medium">{habit.startDate}</span></p>
                  {habit.endDate && <p>End Date: <span className="font-medium">{habit.endDate}</span></p>}
                  <p>Schedule: <span className="font-medium">{habit.scheduleType || 'Daily'}</span></p>
                  {habit.isMeasurable && <p>Goal: <span className="font-medium">{habit.goal} {habit.unit}</span></p>}
                </CardContent>
                <CardFooter className="p-3 border-t dark:border-gray-700 flex justify-end space-x-2 mt-auto">
                  <Button variant="outline" size="icon_sm" onClick={() => openModalForEditHabit(habit)} title="Edit Habit">
                    <Edit size={14} />
                  </Button>
                  <Button variant="destructive" size="icon_sm" onClick={() => {
                    if (confirm(`Are you sure you want to delete "${habit.title}"? This cannot be undone.`)) {
                        handleDeleteHabitCallback(habit.id);
                    }
                  }} title="Delete Habit">
                    <Trash2 size={14} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800 mt-4">
            <CardContent className="pt-6 pb-6 text-center text-gray-500 dark:text-gray-400">
              <p>{searchTerm || filterType !== 'all' ? 'No habits match your criteria.' : 'No habits found. Start by adding a new habit!'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageHabitsPage;
