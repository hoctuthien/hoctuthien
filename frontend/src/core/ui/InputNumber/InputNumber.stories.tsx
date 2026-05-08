import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { InputNumber, InputNumberBorderless } from "./InputNumber";



const meta = {
  title: "Core/UI/InputNumber",
  component: InputNumber,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Component InputNumber cho phép người dùng nhập giá trị số với nút tăng/giảm. Hỗ trợ prefix, suffix, min/max, step, và trạng thái disabled.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "number",
      description: "Giá trị hiện tại (controlled)",
    },
    defaultValue: {
      control: "number",
      description: "Giá trị mặc định (uncontrolled)",
    },
    min: {
      control: "number",
      description: "Giá trị tối thiểu",
    },
    max: {
      control: "number",
      description: "Giá trị tối đa",
    },
    step: {
      control: "number",
      description: "Bước nhảy mỗi lần tăng/giảm",
    },
    disabled: {
      control: "boolean",
      description: "Vô hiệu hóa",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
  },
  args: { onChange: fn() },
} as Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;



export const Default: Story = {
  args: {
    defaultValue: 120,
  },
};

export const WithMinMax: Story = {
  name: "Với Min / Max",
  args: {
    defaultValue: 5,
    min: 0,
    max: 10,
    step: 1,
  },
};

export const WithStep: Story = {
  name: "Với Step = 5",
  args: {
    defaultValue: 100,
    step: 5,
    min: 0,
    max: 200,
  },
};

export const Disabled: Story = {
  name: "Disabled",
  args: {
    defaultValue: 120,
    disabled: true,
  },
};

export const WithCurrencySuffix: Story = {
  name: "Currency Suffix (VND)",
  args: {
    defaultValue: 1500,
    suffix: (
      <span className="flex items-center gap-1">
        <span className="text-[10px] text-primary">◆</span>
        VND
      </span>
    ),
  },
};



export const CustomWidth: Story = {
  name: "Custom Width (w-80)",
  args: {
    defaultValue: 42,
    className: "w-80",
  },
};

export const Success: Story = {
  args: {
    label: "Items in Stock",
    defaultValue: 15,
    status: "success",
    helperText: "Inventory verified by warehouse system.",
  },
};

export const Warning: Story = {
  args: {
    label: "Low Inventory Alert",
    defaultValue: 3,
    status: "warning",
    helperText: "Order more items soon to prevent stockout.",
  },
};

export const ErrorState: Story = {
  args: {
    label: "Maximum Capacity",
    defaultValue: 120,
    status: "error",
    error: "Value exceeds the allowed safety limit for this container.",
  },
};



export const AllStates: Story = {
  name: "Tất cả trạng thái",
  render: () => (
    <div className="flex flex-col gap-8 p-6 bg-primary-fixed/30 rounded-xl">
      <h3 className="text-h3 font-bold text-primary-dark">Basic InputNumber</h3>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-bold text-text-body tracking-wider uppercase">
            Default State
          </span>
          <InputNumber defaultValue={120} />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-bold text-text-body tracking-wider uppercase">
            Disabled State
          </span>
          <InputNumber defaultValue={120} disabled />
        </div>
      </div>
    </div>
  ),
};



const borderlessMeta = {
  title: "Core/UI/InputNumber",
  component: InputNumberBorderless,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Phiên bản InputNumber không viền — dùng cho dashboard, bảng điều khiển tối giản.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Nhãn bên trái",
    },
    value: {
      control: "number",
      description: "Giá trị hiện tại (controlled)",
    },
    defaultValue: {
      control: "number",
      description: "Giá trị mặc định (uncontrolled)",
    },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    controlVariant: {
      control: "radio",
      options: ["circle", "arrow"],
      description: 'Kiểu nút: "circle" (⊖/⊕) hoặc "arrow" (ˇ/ˆ)',
    },
  },
  args: { onChange: fn() },
} as Meta<typeof InputNumberBorderless>;

export const Borderless_CircleIcons: Story = {
  name: "Borderless — Circle Icons",
  render: () => (
    <div className="w-[320px] bg-surface rounded-xl p-6 flex flex-col gap-0">
      <InputNumberBorderless
        label="Quantity"
        defaultValue={5}
        controlVariant="circle"
        min={0}
        max={99}
      />
      <InputNumberBorderless
        label="Participants"
        defaultValue={12}
        controlVariant="arrow"
        min={1}
        max={50}
      />
    </div>
  ),
};

export const Borderless_Disabled: Story = {
  name: "Borderless — Disabled",
  render: () => (
    <div className="w-[320px] bg-surface rounded-xl p-6">
      <InputNumberBorderless
        label="Seats"
        defaultValue={3}
        disabled
        controlVariant="circle"
      />
    </div>
  ),
};



export const PrefixSuffixDemo: Story = {
  name: "Prefix & Suffix Demo",
  render: () => (
    <div className="flex flex-col gap-8 p-8 bg-surface-variant rounded-xl w-[520px]">
      <h3 className="text-h3 font-bold text-text-heading">Prefix & Suffix</h3>


      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold text-text-body tracking-wider uppercase">
          Currency Suffix
        </span>
        <InputNumber
          defaultValue={1500}
          className="w-full"
          prefix={
            <span className="flex items-center justify-center w-8 h-8 rounded-sm bg-primary/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 20V4H4V20H2ZM7 20V4H11C12.3833 4 13.5625 4.4875 14.5375 5.4625C15.5125 6.4375 16 7.61667 16 9C16 10.3833 15.5125 11.5625 14.5375 12.5375C13.5625 13.5125 12.3833 14 11 14H9V20H7ZM18 20V4H20V20H18ZM9 12H11C11.8333 12 12.5417 11.7083 13.125 11.125C13.7083 10.5417 14 9.83333 14 9C14 8.16667 13.7083 7.45833 13.125 6.875C12.5417 6.29167 11.8333 6 11 6H9V12Z" fill="#005BBF"/>
              </svg>
            </span>
          }
          suffix={
            <span className="flex items-center gap-1 text-body font-bold text-primary">
              <span className="text-[10px]">◆</span>
              VND
            </span>
          }
        />
      </div>


    </div>
  ),
};
