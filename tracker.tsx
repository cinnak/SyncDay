"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Clock } from "lucide-react"
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

type TimeEntry = {
  id: string
  title: string
  startTime: string
  endTime: string
  details: string
  color: string
}

const colorPalette = [
  "bg-pink-200", "bg-purple-200", "bg-indigo-200", "bg-blue-200", "bg-green-200",
  "bg-yellow-200", "bg-orange-200", "bg-red-200", "bg-teal-200", "bg-cyan-200"
]

const presetEntries = [
  { id: 'preset1', title: 'Morning Routine', duration: '1h', color: 'bg-yellow-200' },
  { id: 'preset2', title: 'Work Session', duration: '3h', color: 'bg-blue-200' },
  { id: 'preset3', title: 'Lunch Break', duration: '1h', color: 'bg-green-200' },
  { id: 'preset4', title: 'Exercise', duration: '1h', color: 'bg-orange-200' },
  { id: 'preset5', title: 'Evening Relaxation', duration: '2h', color: 'bg-purple-200' },
]

const DraggablePresetCard = ({ entry, onDrop }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PRESET_ENTRY',
    item: { ...entry },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className={`${entry.color} cursor-move`}>
        <CardContent className="p-4">
          <h3 className="font-semibold">{entry.title}</h3>
          <p className="text-sm">{entry.duration}</p>
        </CardContent>
      </Card>
    </div>
  )
}

const TimeSlot = ({ time, entry, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'PRESET_ENTRY',
    drop: (item) => onDrop(item, time),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div ref={drop} className={`flex items-center ${isOver ? 'bg-gray-100' : ''}`}>
      <span className="w-16 text-sm text-gray-500">{time}</span>
      {entry ? (
        <div className={`flex-1 p-2 rounded-md ml-2 ${entry.color}`}>
          <div className="font-medium">{entry.title}</div>
          <div className="text-sm">{entry.startTime} - {entry.endTime}</div>
          <div className="text-xs mt-1">{entry.details}</div>
        </div>
      ) : (
        <div className="flex-1 h-8 border border-dashed border-gray-300 rounded-md ml-2"></div>
      )}
    </div>
  )
}

export default function TimeTracker() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [newEntry, setNewEntry] = useState<Partial<TimeEntry>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.startTime && newEntry.endTime && date) {
      setEntries([...entries, {
        id: Date.now().toString(),
        ...newEntry,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
      } as TimeEntry])
      setNewEntry({})
      setIsDialogOpen(false)
    }
  }

  const handlePresetDrop = (item, time) => {
    const [hours, minutes] = time.split(':').map(Number)
    const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    const [durationHours, durationMinutes] = item.duration.split('h').map(Number)
    const endHours = hours + durationHours
    const endMinutes = minutes + (durationMinutes || 0)
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      title: item.title,
      startTime,
      endTime,
      details: '',
      color: item.color,
    }

    setEntries([...entries, newEntry])
  }

  const entriesForSelectedDate = entries.filter(
    (entry) => entry.date?.toDateString() === date?.toDateString()
  )

  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              Colorful Time Tracker
            </h1>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow-md"
                />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Plus className="h-4 w-4 mr-2" /> Add New Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Time Entry</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Entry title"
                        value={newEntry.title || ""}
                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      />
                      <div className="flex gap-4">
                        <Input
                          type="time"
                          placeholder="Start time"
                          value={newEntry.startTime || ""}
                          onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                        />
                        <Input
                          type="time"
                          placeholder="End time"
                          value={newEntry.endTime || ""}
                          onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                        />
                      </div>
                      <Textarea
                        placeholder="Details"
                        value={newEntry.details || ""}
                        onChange={(e) => setNewEntry({ ...newEntry, details: e.target.value })}
                      />
                      <Button onClick={handleAddEntry} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        Add Entry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Preset Events</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {presetEntries.map((entry) => (
                      <DraggablePresetCard key={entry.id} entry={entry} onDrop={handlePresetDrop} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[600px]">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Schedule for {date?.toDateString()}
                </h2>
                <div className="space-y-2">
                  {timeSlots.map((time) => {
                    const entry = entriesForSelectedDate.find(e => e.startTime <= time && e.endTime > time)
                    return (
                      <TimeSlot key={time} time={time} entry={entry} onDrop={handlePresetDrop} />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
