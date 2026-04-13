import type { Meta, StoryObj } from "@storybook/react"
import * as React from "react"
import { type DateRange } from "react-day-picker"
import { Calendar } from "./Calendar"

const meta: Meta<typeof Calendar> = {
  title: "Shared/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
      <div className="p-10 bg-[#F7F9FF] rounded-3xl">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow"
        />
        {date && (
          <p className="mt-4 text-center text-sm font-medium text-slate-500">
            Selected: {date.toLocaleDateString()}
          </p>
        )}
      </div>
    )
  },
}

export const Range: Story = {
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(),
      to: new Date(new Date().setDate(new Date().getDate() + 5)),
    })

    return (
      <div className="p-10 bg-[#F7F9FF] rounded-3xl">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          className="rounded-md border shadow"
        />
      </div>
    )
  },
}

export const Multiple: Story = {
  render: () => {
    const [dates, setDates] = React.useState<Date[] | undefined>([new Date()])

    return (
      <div className="p-10 bg-[#F7F9FF] rounded-3xl">
        <Calendar
          mode="multiple"
          selected={dates}
          onSelect={setDates}
          className="rounded-md border shadow"
        />
      </div>
    )
  },
}

export const SchedulingGuideline: Story = {
  render: () => {
    return (
      <div className="relative flex flex-col gap-12 p-16 bg-[#F7F9FF] min-h-screen font-sans">
        <div className="max-w-4xl mx-auto w-full">
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Scheduling Guidelines</h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              Design standards for the Curator calendar ecosystem. Prioritizing
              clarity, high-contrast interaction states, and editorial white space.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#005BBF]">Mini Calendar View</h2>
              <Calendar mode="single" selected={new Date()} className="w-fit" />
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-[#005BBF]">Selection States</h2>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <span className="font-bold text-slate-700">Available Date</span>
                    <span className="size-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-900 font-bold text-xs text-[#005BBF]">12</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#005BBF] rounded-2xl shadow-lg ring-4 ring-blue-100">
                    <span className="font-bold text-white">Selected Date</span>
                    <span className="size-8 flex items-center justify-center bg-white rounded-lg text-[#005BBF] font-bold text-xs">05</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-100 rounded-2xl opacity-60">
                    <span className="font-bold text-slate-400">Disabled / Past</span>
                    <span className="size-8 flex items-center justify-center bg-slate-200 rounded-lg text-slate-400 font-bold text-xs">28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
}
