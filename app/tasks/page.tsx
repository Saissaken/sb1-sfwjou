'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, differenceInDays, isToday } from 'date-fns';
import { CalendarIcon, Circle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

type Task = {
  id: number;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
};

const priorityColors = {
  low: 'text-green-500',
  medium: 'text-yellow-500',
  high: 'text-red-500'
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
        console.log('Loaded tasks from localStorage:', parsedTasks);
      } else {
        console.log('No tasks found in localStorage');
      }
      isFirstRender.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isFirstRender.current) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() && dueDate) {
      const newTaskItem: Task = {
        id: Date.now(),
        title: newTask,
        dueDate: dueDate.toISOString(),
        priority,
      };
      setTasks(prevTasks => [...prevTasks, newTaskItem]);
      setNewTask('');
      setDueDate(new Date());
      setPriority('medium');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const deleteTask = (id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const diffDays = differenceInDays(date, today);

    if (isToday(date)) return 'today';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    return `in ${diffDays}d`;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex justify-between items-center p-4 bg-card">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <ThemeToggle />
      </header>
      <main className="flex-grow overflow-auto p-4">
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between bg-card text-card-foreground p-4 rounded-lg shadow">
              <span className="flex-grow mr-4 break-words">{task.title}</span>
              <div className="flex items-center space-x-4 flex-shrink-0">
                <span className="text-sm text-muted-foreground whitespace-nowrap">{formatDueDate(new Date(task.dueDate))}</span>
                <Circle className={`h-4 w-4 ${priorityColors[task.priority]}`} />
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <footer className="p-4 bg-card fixed bottom-0 left-0 right-0">
        <div className="flex space-x-4 max-w-4xl mx-auto">
          <Input
            type="text"
            placeholder="New task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow"
          />
          <Popover>
            <PopoverTrigger asChild>
              <button className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                {formatDueDate(dueDate)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => setDueDate(date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
            <SelectTrigger className="w-[50px]">
              <SelectValue>
                <Circle className={`h-4 w-4 ${priorityColors[priority]}`} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low"><Circle className="h-4 w-4 text-green-500 inline-block mr-2" /> Low</SelectItem>
              <SelectItem value="medium"><Circle className="h-4 w-4 text-yellow-500 inline-block mr-2" /> Medium</SelectItem>
              <SelectItem value="high"><Circle className="h-4 w-4 text-red-500 inline-block mr-2" /> High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </footer>
    </div>
  );
}