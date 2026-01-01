// /app/components/ui/Tabs.tsx
"use client";

import * as React from "react";

// ============================================================================
// CONTEXT & MAIN TABS COMPONENT
// ============================================================================

// Tabs Context for state management
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  value: "",
  onValueChange: () => {},
});

// Main Tabs Component Props
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  defaultValue = "",
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={`w-full ${className || ""}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ============================================================================
// TABS LIST COMPONENT
// ============================================================================

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function TabsList({
  className,
  children,
  ...props
}: TabsListProps) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TABS TRIGGER COMPONENT
// ============================================================================

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => context.onValueChange(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium
        transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// TABS CONTENT COMPONENT
// ============================================================================

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const context = React.useContext(TabsContext);
  
  if (context.value !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      data-state={context.value === value ? "active" : "inactive"}
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-gray-950 focus-visible:ring-offset-2 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SIMPLE TABS (ALTERNATIVE IMPLEMENTATION)
// ============================================================================

interface SimpleTabsProps {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function SimpleTabs({
  tabs,
  activeTab,
  onTabChange,
  className
}: SimpleTabsProps) {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className || ""}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === tab.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-gray-200">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// CARD TABS (ALTERNATIVE IMPLEMENTATION)
// ============================================================================

interface CardTabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function CardTabs({
  tabs,
  activeTab,
  onTabChange,
  className
}: CardTabsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${className || ""}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex flex-col items-center justify-center p-4 rounded-lg border transition-all
            ${activeTab === tab.id
              ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }
          `}
        >
          {tab.icon && <div className="mb-2">{tab.icon}</div>}
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MINIMAL TABS (ALTERNATIVE IMPLEMENTATION - NO CONTEXT)
// ============================================================================

interface MinimalTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    count?: number;
    icon?: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "default" | "underline" | "pills";
  className?: string;
}

export function MinimalTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  className = "",
}: MinimalTabsProps) {
  const getVariantClasses = (isActive: boolean) => {
    switch (variant) {
      case "underline":
        return isActive
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300";
      case "pills":
        return isActive
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
      default:
        return isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50";
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case "underline":
        return "flex space-x-8 border-b";
      case "pills":
        return "flex space-x-2 p-1 bg-gray-100 rounded-lg";
      default:
        return "flex space-x-1 rounded-lg bg-gray-100 p-1";
    }
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${getVariantClasses(activeTab === tab.id)}
          `}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`
                ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full
                ${activeTab === tab.id
                  ? variant === "pills"
                    ? "bg-white/20"
                    : "bg-blue-100 text-blue-800"
                  : "bg-gray-200 text-gray-800"
                }
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Simple Tab Content Component for MinimalTabs
interface MinimalTabContentProps {
  tabId: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function MinimalTabContent({
  tabId,
  activeTab,
  children,
  className = "",
}: MinimalTabContentProps) {
  if (activeTab !== tabId) return null;

  return <div className={className}>{children}</div>;
}

// ============================================================================
// EXAMPLE USAGE COMPONENT (for reference/demo)
// ============================================================================

export function TabsExample() {
  const [activeTab, setActiveTab] = React.useState("overview");
  
  // Example usage of the main Tabs component
  const mainTabsExample = (
    <Tabs defaultValue="overview" onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="patients">Patients (3)</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Overview Content</h2>
          <p>This is the overview tab content.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="patients">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Patients Content</h2>
          <p>This is the patients tab content.</p>
        </div>
      </TabsContent>
      
      <TabsContent value="settings">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Settings Content</h2>
          <p>This is the settings tab content.</p>
        </div>
      </TabsContent>
    </Tabs>
  );

  // Example usage of SimpleTabs
  const simpleTabsData = [
    { id: "overview", label: "Overview", count: 0 },
    { id: "patients", label: "Patients", count: 3 },
    { id: "contact", label: "Contact" },
    { id: "settings", label: "Settings" },
  ];

  const simpleTabsExample = (
    <div>
      <SimpleTabs
        tabs={simpleTabsData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />
      {activeTab === "overview" && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Overview Content</h2>
          <p>This is the overview tab content.</p>
        </div>
      )}
      {activeTab === "patients" && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold">Patients Content</h2>
          <p>This is the patients tab content.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 p-4">
      <div>
        <h3 className="text-lg font-bold mb-2">Main Tabs Component</h3>
        {mainTabsExample}
      </div>
      
      <div>
        <h3 className="text-lg font-bold mb-2">SimpleTabs Component</h3>
        {simpleTabsExample}
      </div>
    </div>
  );
}

// ============================================================================
// DEFAULT EXPORT (if you want to export everything)
// ============================================================================

export default {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  SimpleTabs,
  CardTabs,
  MinimalTabs,
  MinimalTabContent,
  TabsExample,
};