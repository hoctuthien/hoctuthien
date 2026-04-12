import { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Checkbox,
  Radio,
  Switch,
} from "../shared/components/SelectionControls";
import React from "react";

const meta: Meta = {
  title: "Components/SelectionControls",
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const Showcase: StoryObj = {
  render: () => (
    <div className="p-8 bg-[#F4F7FB] min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header>
          <span className="text-xs font-bold tracking-widest text-primary uppercase">
            Design System / Guidelines
          </span>
          <h1 className="text-4xl font-black text-text-heading mt-2">
            Selection Controls
          </h1>
          <p className="text-text-body mt-4 max-w-2xl">
            A definitive guide to interactive states for radio buttons,
            checkboxes, and switches. Built for high-intent professional
            mentorship interfaces.
          </p>
        </header>

        <section className="bg-primary-light/30 rounded-2xl p-8 border border-primary-surface/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-heading">Radio box</h2>
              <p className="text-sm text-text-muted mt-1">
                Used for mutually exclusive choices in a set.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="bg-primary-light text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Foundation
              </span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ControlCard label="DEFAULT">
              <Radio label="DEFAULT" />
            </ControlCard>
            <ControlCard label="HOVER">
              <Radio label="HOVER" className="group-hover:border-primary" />
              <div className="text-[10px] mt-2 text-primary font-bold">
                (Simulation)
              </div>
            </ControlCard>
            <ControlCard label="CLICKED">
              <Radio label="CLICKED" checked onChange={() => {}} />
            </ControlCard>
            <ControlCard label="FOCUSED">
              <Radio
                label="FOCUSED"
                checked
                className="ring-4 ring-primary-surface border-primary"
              />
              <div className="text-[10px] mt-2 text-primary font-bold">
                (Simulation)
              </div>
            </ControlCard>
            <ControlCard label="DISABLED">
              <Radio label="DISABLED" disabled />
            </ControlCard>
          </div>
        </section>

        <section className="bg-primary-light/30 rounded-2xl p-8 border border-primary-surface/50">
          <h2 className="text-xl font-bold text-text-heading mb-1">Checkbox</h2>
          <p className="text-sm text-text-muted mb-6">
            Allows users to select one or more items.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ControlCard label="DEFAULT">
              <Checkbox label="DEFAULT" />
            </ControlCard>
            <ControlCard label="HOVER">
              <Checkbox label="HOVER" className="border-primary" />
              <div className="text-[10px] mt-2 text-primary font-bold">
                (Simulation)
              </div>
            </ControlCard>
            <ControlCard label="SELECTED">
              <Checkbox label="SELECTED" checked onChange={() => {}} />
            </ControlCard>
            <ControlCard label="PARTIAL">
              <Checkbox label="PARTIAL" indeterminate onChange={() => {}} />
            </ControlCard>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ControlCard label="FOCUSED">
              <Checkbox
                label="FOCUSED"
                checked
                className="ring-4 ring-primary-surface border-primary"
              />
              <div className="text-[10px] mt-2 text-primary font-bold">
                (Simulation)
              </div>
            </ControlCard>
            <ControlCard label="DISABLED">
              <Checkbox label="DISABLED" checked disabled />
            </ControlCard>
          </div>
        </section>

        <section className="bg-primary-light/30 rounded-2xl p-8 border border-primary-surface/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-text-heading">Switch</h2>
              <p className="text-sm text-text-muted mt-1 mb-8">
                Instant binary toggle.
              </p>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    Off / Default
                  </span>
                  <Switch />
                </div>
                <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    On / Hover
                  </span>
                  <Switch checked onChange={() => {}} />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Focused
                </span>
                <Switch checked className="ring-4 ring-primary-surface" />
              </div>
              <div className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm">
                <span className="text-[10px] font-bold text-text-disabled uppercase tracking-wider">
                  Disabled
                </span>
                <Switch disabled />
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-primary-light/30 rounded-2xl p-8 border border-primary-surface/50 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-bold text-text-heading mb-4">
              Design Philosophy
            </h3>
            <p className="text-sm text-text-body mb-6 leading-relaxed">
              Selection controls are more than just utility; they are the
              feedback loops of your interface. In the MentorConnect ecosystem,
              we prioritize <strong>Soft Affirmation</strong>. This means using
              larger hit zones and distinct focus rings to reduce user anxiety
              during decision-making.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-text-body">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  Radii are consistently XL (0.75rem) or Full to maintain brand
                  softness.
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-body">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  Borders are never pure black; they utilize outline-variant for
                  a sophisticated depth.
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-[#0D1A33] rounded-2xl aspect-[16/9] flex items-end p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />
            <div className="relative z-10">
              <p className="text-xl font-medium text-white italic">
                "Clarity is the first step toward mentorship success."
              </p>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-2">
                Selection Principle #04
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  ),
};

function ControlCard({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm group border border-transparent hover:border-primary/20 transition-all">
      {children}
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
}
