"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "./lib/utils";

type StepperOrientation = "horizontal" | "vertical";
type StepState = "active" | "completed" | "inactive" | "loading";

type StepIndicators = {
  active?: ReactNode;
  completed?: ReactNode;
  inactive?: ReactNode;
  loading?: ReactNode;
};

type StepperContextValue = {
  activeStep: number;
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: (currentIndex: number) => void;
  focusPrevious: (currentIndex: number) => void;
  indicators: StepIndicators;
  orientation: StepperOrientation;
  registerTrigger: (node: HTMLButtonElement | null) => () => void;
  setActiveStep: (step: number) => void;
  triggerNodes: HTMLButtonElement[];
};

type StepItemContextValue = {
  isDisabled: boolean;
  isLoading: boolean;
  state: StepState;
  step: number;
};

const StepperContext = createContext<StepperContextValue | undefined>(
  undefined,
);
const StepItemContext = createContext<StepItemContextValue | undefined>(
  undefined,
);

export function useStepper() {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error("useStepper must be used within a Stepper");
  }

  return context;
}

export function useStepItem() {
  const context = useContext(StepItemContext);

  if (!context) {
    throw new Error("useStepItem must be used within a StepperItem");
  }

  return context;
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  indicators?: StepIndicators;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  value?: number;
}

export function Stepper({
  children,
  className,
  defaultValue = 1,
  indicators = {},
  onValueChange,
  orientation = "horizontal",
  value,
  ...props
}: StepperProps) {
  const [activeStep, setActiveStep] = useState(defaultValue);
  const [triggerNodes, setTriggerNodes] = useState<HTMLButtonElement[]>([]);

  const registerTrigger = useCallback((node: HTMLButtonElement | null) => {
    if (!node) return () => undefined;

    setTriggerNodes((current) =>
      current.includes(node) ? current : [...current, node],
    );

    return () => {
      setTriggerNodes((current) => current.filter((item) => item !== node));
    };
  }, []);

  const handleSetActiveStep = useCallback(
    (step: number) => {
      if (value === undefined) setActiveStep(step);
      onValueChange?.(step);
    },
    [onValueChange, value],
  );

  const currentStep = value ?? activeStep;
  const focusTrigger = useCallback(
    (index: number) => {
      triggerNodes[index]?.focus();
    },
    [triggerNodes],
  );
  const focusNext = useCallback(
    (currentIndex: number) => {
      if (triggerNodes.length === 0) return;
      focusTrigger((currentIndex + 1) % triggerNodes.length);
    },
    [focusTrigger, triggerNodes.length],
  );
  const focusPrevious = useCallback(
    (currentIndex: number) => {
      if (triggerNodes.length === 0) return;
      focusTrigger(
        (currentIndex - 1 + triggerNodes.length) % triggerNodes.length,
      );
    },
    [focusTrigger, triggerNodes.length],
  );
  const focusFirst = useCallback(() => focusTrigger(0), [focusTrigger]);
  const focusLast = useCallback(
    () => focusTrigger(triggerNodes.length - 1),
    [focusTrigger, triggerNodes.length],
  );

  const contextValue = useMemo<StepperContextValue>(
    () => ({
      activeStep: currentStep,
      focusFirst,
      focusLast,
      focusNext,
      focusPrevious,
      indicators,
      orientation,
      registerTrigger,
      setActiveStep: handleSetActiveStep,
      triggerNodes,
    }),
    [
      currentStep,
      focusFirst,
      focusLast,
      focusNext,
      focusPrevious,
      handleSetActiveStep,
      indicators,
      orientation,
      registerTrigger,
      triggerNodes,
    ],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        aria-orientation={orientation}
        className={cn("w-full", className)}
        data-orientation={orientation}
        data-slot="stepper"
        role="tablist"
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  step: number;
}

export function StepperItem({
  children,
  className,
  completed = false,
  disabled = false,
  loading = false,
  step,
  ...props
}: StepperItemProps) {
  const { activeStep } = useStepper();
  const state: StepState =
    completed || step < activeStep
      ? "completed"
      : activeStep === step
        ? "active"
        : "inactive";
  const isLoading = loading && step === activeStep;

  return (
    <StepItemContext.Provider
      value={{
        isDisabled: disabled,
        isLoading,
        state,
        step,
      }}
    >
      <div
        className={cn(
          "group/step flex items-center justify-center not-last:flex-1 group-data-[orientation=horizontal]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:flex-col",
          className,
        )}
        data-loading={isLoading || undefined}
        data-slot="stepper-item"
        data-state={state}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  );
}

export type StepperTriggerProps = useRender.ComponentProps<"button">;

export function StepperTrigger({
  children,
  className,
  render,
  tabIndex,
  ...props
}: StepperTriggerProps) {
  const {
    activeStep,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    registerTrigger,
    setActiveStep,
    triggerNodes,
  } = useStepper();
  const { isDisabled, isLoading, step } = useStepItem();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isSelected = activeStep === step;

  useEffect(() => registerTrigger(buttonRef.current), [registerTrigger]);

  const triggerIndex = useMemo(
    () => triggerNodes.findIndex((node) => node === buttonRef.current),
    [triggerNodes],
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        if (triggerIndex !== -1) focusNext(triggerIndex);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        if (triggerIndex !== -1) focusPrevious(triggerIndex);
        break;
      case "Home":
        event.preventDefault();
        focusFirst();
        break;
      case "End":
        event.preventDefault();
        focusLast();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        setActiveStep(step);
        break;
    }
  }

  return useRender({
    defaultTagName: "button",
    ref: buttonRef,
    render,
    props: mergeProps<"button">(
      {
        "aria-controls": `stepper-panel-${step}`,
        "aria-selected": isSelected,
        children,
        className: cn(
          "inline-flex cursor-pointer items-center gap-2.5 rounded-full outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 dark:focus-visible:ring-blue-400",
          className,
        ),
        "aria-busy": isLoading,
        disabled: isDisabled,
        id: `stepper-tab-${step}`,
        onClick: () => setActiveStep(step),
        onKeyDown: handleKeyDown,
        role: "tab",
        tabIndex: typeof tabIndex === "number" ? tabIndex : isSelected ? 0 : -1,
      },
      props,
    ),
  });
}

export function StepperIndicator({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { indicators } = useStepper();
  const { isLoading, state } = useStepItem();
  const indicator =
    (isLoading && indicators.loading) ||
    (state === "completed" && indicators.completed) ||
    (state === "active" && indicators.active) ||
    (state === "inactive" && indicators.inactive);

  return (
    <div
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs text-slate-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=completed]:bg-blue-600 data-[state=completed]:text-white dark:bg-slate-800 dark:text-slate-300 dark:data-[state=active]:bg-blue-500 dark:data-[state=completed]:bg-blue-500",
        className,
      )}
      data-slot="stepper-indicator"
      data-state={state}
      {...props}
    >
      {indicator || children}
    </div>
  );
}

export function StepperSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { state } = useStepItem();

  return (
    <div
      className={cn(
        "m-0.5 rounded-sm bg-slate-200 group-data-[orientation=horizontal]/stepper-nav:h-0.5 group-data-[orientation=horizontal]/stepper-nav:flex-1 group-data-[orientation=vertical]/stepper-nav:h-12 group-data-[orientation=vertical]/stepper-nav:w-0.5 dark:bg-slate-800",
        className,
      )}
      data-slot="stepper-separator"
      data-state={state}
      {...props}
    />
  );
}

export function StepperTitle({
  children,
  className,
  ...props
}: React.ComponentProps<"h3">) {
  const { state } = useStepItem();

  return (
    <h3
      className={cn("text-sm font-medium leading-none", className)}
      data-slot="stepper-title"
      data-state={state}
      {...props}
    >
      {children}
    </h3>
  );
}

export function StepperDescription({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { state } = useStepItem();

  return (
    <div
      className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
      data-slot="stepper-description"
      data-state={state}
      {...props}
    >
      {children}
    </div>
  );
}

export function StepperNav({
  children,
  className,
  ...props
}: React.ComponentProps<"nav">) {
  const { activeStep, orientation } = useStepper();

  return (
    <nav
      className={cn(
        "group/stepper-nav inline-flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
        className,
      )}
      data-orientation={orientation}
      data-slot="stepper-nav"
      data-state={activeStep}
      {...props}
    >
      {children}
    </nav>
  );
}

export function StepperPanel({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { activeStep } = useStepper();

  return (
    <div
      className={cn("w-full", className)}
      data-slot="stepper-panel"
      data-state={activeStep}
      {...props}
    >
      {children}
    </div>
  );
}

export interface StepperContentProps extends React.ComponentProps<"div"> {
  forceMount?: boolean;
  value: number;
}

export function StepperContent({
  children,
  className,
  forceMount,
  value,
  ...props
}: StepperContentProps) {
  const { activeStep } = useStepper();
  const isActive = value === activeStep;

  if (!forceMount && !isActive) return null;

  return (
    <div
      aria-labelledby={`stepper-tab-${value}`}
      className={cn("w-full", className, !isActive && forceMount && "hidden")}
      data-slot="stepper-content"
      data-state={activeStep}
      hidden={!isActive && forceMount}
      id={`stepper-panel-${value}`}
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  );
}
