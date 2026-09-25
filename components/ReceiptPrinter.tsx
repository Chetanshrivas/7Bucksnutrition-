"use client";

import Image from "next/image";
import {
  CheckCircleIcon,
  CircleNotchIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
} from "react";

/* =========================================================
   TYPES
========================================================= */

export type ReceiptPrinterStage =
  | "processing"
  | "printing"
  | "complete";

export type ReceiptFeedMotion =
  | "smooth"
  | "stepped";

export type ReceiptPrinterRootProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "children"
> & {
  animate?: boolean;
  children: ReactNode;
  feedMotion?: ReceiptFeedMotion;
  stage: ReceiptPrinterStage;
};

export type ReceiptPrinterMachineProps =
  ComponentPropsWithoutRef<"div">;

export type ReceiptPrinterHeaderProps =
  ComponentPropsWithoutRef<"div">;

export type ReceiptPrinterScreenProps =
  ComponentPropsWithoutRef<"div">;

export type ReceiptPrinterOutputProps =
  ComponentPropsWithoutRef<"div">;

export type ReceiptPrinterPaperProps =
  ComponentPropsWithoutRef<"article">;

export type ReceiptPrinterStatusProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> & {
  children?: ReactNode;
};

/* =========================================================
   CONTEXT
========================================================= */

type ReceiptPrinterContextValue = {
  animate: boolean;
  feedMotion: ReceiptFeedMotion;
  shouldMove: boolean;
  stage: ReceiptPrinterStage;
};

const ReceiptPrinterContext =
  createContext<ReceiptPrinterContextValue | null>(null);

/* =========================================================
   ANIMATION
========================================================= */

const easeOut = [0.23, 1, 0.32, 1] as const;
const easeInOut = [0.77, 0, 0.175, 1] as const;

const printingTransformKeyframes = [
  "translateY(calc(-100% + 2px))",
  "translateY(-91%)",
  "translateY(-91%)",
  "translateY(-81%)",
  "translateY(-81%)",
  "translateY(-70%)",
  "translateY(-70%)",
  "translateY(-58%)",
  "translateY(-58%)",
  "translateY(-45%)",
  "translateY(-45%)",
  "translateY(-32%)",
  "translateY(-32%)",
  "translateY(-20%)",
  "translateY(-20%)",
  "translateY(-10%)",
  "translateY(-10%)",
  "translateY(-3%)",
  "translateY(-3%)",
  "translateY(0%)",
];

const printingKeyframeTimes = [
  0,
  0.075,
  0.105,
  0.18,
  0.21,
  0.285,
  0.315,
  0.39,
  0.42,
  0.495,
  0.525,
  0.6,
  0.63,
  0.705,
  0.735,
  0.81,
  0.84,
  0.915,
  0.945,
  1,
];

/* =========================================================
   RECEIPT PAPER EDGE
========================================================= */

const receiptToothCount = 34;
const receiptToothDepth = 5;

const receiptToothPoints = Array.from(
  {
    length: receiptToothCount * 2,
  },
  (_, index) => {
    const x =
      100 -
      ((index + 1) * 100) /
        (receiptToothCount * 2);

    const y =
      index % 2 === 0
        ? "100%"
        : `calc(100% - ${receiptToothDepth}px)`;

    return `${x}% ${y}`;
  },
).join(", ");

const receiptClipPath = `polygon(
  0 0,
  100% 0,
  100% calc(100% - ${receiptToothDepth}px),
  ${receiptToothPoints}
)`;

/* =========================================================
   STATUS LABELS
========================================================= */

const statusLabels: Record<
  ReceiptPrinterStage,
  ReactNode
> = {
  processing: "Processing your order",
  printing: "Printing your receipt",
  complete: "Order complete",
};

/* =========================================================
   HOOK
========================================================= */

function useReceiptPrinter(component: string) {
  const context = useContext(
    ReceiptPrinterContext,
  );

  if (!context) {
    throw new Error(
      `${component} must be used inside ReceiptPrinter.Root.`,
    );
  }

  return context;
}

/* =========================================================
   ROOT
========================================================= */

function ReceiptPrinterRoot({
  "aria-label": ariaLabel = "Receipt printer",
  animate = true,
  children,
  className,
  feedMotion = "stepped",
  stage,
  ...props
}: ReceiptPrinterRootProps) {
  const shouldReduceMotion =
    useReducedMotion();

  const context: ReceiptPrinterContextValue = {
    animate,
    feedMotion,
    shouldMove:
      animate && !shouldReduceMotion,
    stage,
  };

  return (
    <ReceiptPrinterContext.Provider
      value={context}
    >
      <section
        aria-label={ariaLabel}
        data-stage={stage}
        className={[
          "relative isolate flex w-full",
          "flex-col items-center",
          className ?? "",
        ].join(" ")}
        {...props}
      >
        {children}
      </section>
    </ReceiptPrinterContext.Provider>
  );
}

/* =========================================================
   MACHINE
========================================================= */

function ReceiptPrinterMachine({
  children,
  className,
  ...props
}: ReceiptPrinterMachineProps) {
  return (
    <div
      className={[
        "relative isolate z-10 w-full max-w-md",
        "overflow-hidden rounded-[28px]",
        "border border-white/10",
        "bg-gradient-to-b",
        "from-[#343434]",
        "via-[#252525]",
        "to-[#171717]",
        "p-4 pb-8",
        "shadow-[0_30px_70px_rgba(0,0,0,0.28)]",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {/* subtle plastic highlight */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-x-5 top-0
          h-px
          bg-white/15
        "
      />

      {/* soft internal shine */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          rounded-[28px]
          bg-gradient-to-b
          from-white/[0.06]
          via-transparent
          to-black/10
        "
      />

      <div className="relative z-10">
        {children}
      </div>

      {/* printer slot */}
      <div
        aria-hidden="true"
        className="
          absolute
          bottom-3
          left-7
          right-7
          z-40
          h-3
          rounded-full
          border
          border-black/80
          bg-black
          shadow-[inset_0_2px_4px_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.5)]
        "
      />

      {/* slot highlight */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-[15px]
          left-9
          right-9
          z-50
          h-px
          bg-white/10
        "
      />
    </div>
  );
}

/* =========================================================
   HEADER
========================================================= */

function ReceiptPrinterHeader({
  children,
  className,
  ...props
}: ReceiptPrinterHeaderProps) {
  return (
    <div
      className={[
        "relative z-10",
        "flex h-14",
        "items-center justify-between",
        "px-1",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

/* =========================================================
   SCREEN
========================================================= */

function ReceiptPrinterScreen({
  children,
  className,
  ...props
}: ReceiptPrinterScreenProps) {
  return (
    <div
      className={[
        "relative z-10 isolate overflow-hidden",
        "rounded-[18px]",
        "border border-black/70",
        "bg-gradient-to-b",
        "from-[#090909]",
        "to-[#151515]",
        "p-4",
        "text-white",
        "shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {/* screen glass */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          rounded-[18px]
          bg-gradient-to-b
          from-white/[0.05]
          via-transparent
          to-transparent
        "
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS INDICATOR
========================================================= */

function StatusIndicator({
  animate,
  move,
  stage,
}: {
  animate: boolean;
  move: boolean;
  stage: ReceiptPrinterStage;
}) {
  const isComplete =
    stage === "complete";

  return (
    <span
      aria-hidden="true"
      className="
        relative
        grid size-6
        shrink-0
        place-items-center
      "
    >
      <AnimatePresence
        initial={false}
        mode="sync"
      >
        {isComplete ? (
          <motion.span
            key="complete"
            initial={{
              opacity: animate ? 0 : 1,
              scale: move ? 0.94 : 1,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: animate ? 0 : 1,
              scale: move ? 0.96 : 1,
            }}
            transition={{
              duration: animate ? 0.18 : 0,
              ease: easeOut,
            }}
            className="
              col-start-1
              row-start-1
              grid place-items-center
              text-emerald-400
            "
          >
            <CheckCircleIcon
              size={20}
              weight="fill"
            />
          </motion.span>
        ) : (
          <motion.span
            key="working"
            initial={{
              opacity: animate ? 0 : 1,
              scale: move ? 0.94 : 1,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: animate ? 0 : 1,
              scale: move ? 0.96 : 1,
            }}
            transition={{
              duration: animate ? 0.18 : 0,
              ease: easeOut,
            }}
            className="
              col-start-1
              row-start-1
              grid place-items-center
              text-white/55
            "
          >
            <CircleNotchIcon
              size={20}
              weight="bold"
              className={
                animate
                  ? "animate-spin motion-reduce:animate-none"
                  : ""
              }
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* =========================================================
   STATUS
========================================================= */

function ReceiptPrinterStatus({
  children,
  className,
  ...props
}: ReceiptPrinterStatusProps) {
  const {
    animate,
    shouldMove,
    stage,
  } = useReceiptPrinter(
    "ReceiptPrinter.Status",
  );

  return (
    <div
      className={[
        "flex min-w-0 items-center gap-2.5",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      <StatusIndicator
        animate={animate}
        move={shouldMove}
        stage={stage}
      />

      <div
        aria-live="polite"
        role="status"
        className="
          grid min-w-0
          flex-1
          items-center
        "
      >
        <AnimatePresence
          initial={false}
          mode="sync"
        >
          <motion.div
            key={stage}
            initial={{
              opacity: animate ? 0 : 1,
              y: shouldMove ? 4 : 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: animate ? 0 : 1,
              y: shouldMove ? -4 : 0,
            }}
            transition={{
              duration: animate ? 0.18 : 0,
              ease: easeOut,
            }}
            className="
              col-start-1
              row-start-1
              truncate
              text-xs
              font-medium
              text-white/70
            "
          >
            {children ??
              statusLabels[stage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =========================================================
   PAPER
========================================================= */

function ReceiptPrinterPaper({
  children,
  className,
  style,
  ...props
}: ReceiptPrinterPaperProps) {
  return (
    <article
      className={[
        "relative z-10",
        "w-full",
        "overflow-visible",
        "bg-[#fffdf8]",
        "px-7 pb-10 pt-8",
        "font-mono",
        "text-[#24211d]",
        "shadow-[0_18px_30px_rgba(0,0,0,0.16)]",
        className ?? "",
      ].join(" ")}
      style={{
        clipPath: receiptClipPath,
        ...style,
      }}
      {...props}
    >
      {/* subtle paper texture made entirely with CSS */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          opacity-[0.035]
          bg-[radial-gradient(circle_at_20%_20%,#000_0.7px,transparent_0.8px)]
          bg-[length:7px_7px]
        "
      />

      <div className="relative z-10">
        {/* LOGO */}
        <div className="mb-7 flex justify-center">
          <Image
            src="/logo/seven-bucks-logo.webp"
            alt="Seven Bucks Nutrition"
            width={150}
            height={70}
            priority
            className="
              h-auto
              max-h-16
              w-auto
              max-w-[150px]
              object-contain
            "
          />
        </div>

        {children}
      </div>
    </article>
  );
}

/* =========================================================
   OUTPUT
========================================================= */

function ReceiptPrinterOutput({
  children,
  className,
  ...props
}: ReceiptPrinterOutputProps) {
  const {
    animate,
    feedMotion,
    shouldMove,
    stage,
  } = useReceiptPrinter(
    "ReceiptPrinter.Output",
  );

  const isReceiptVisible =
    stage !== "processing";

  const shouldUseSteppedFeed =
    feedMotion === "stepped" &&
    stage === "printing" &&
    shouldMove;

  return (
    <div
      className={[
        "relative z-50",
        "-mt-3",
        "grid",
        "w-[calc(100%-2rem)]",
        "max-w-[380px]",
        "overflow-hidden",
        "px-4",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {/* paper coming out shadow */}
      {isReceiptVisible ? (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-5
            top-0
            z-30
            h-3
            rounded-full
            bg-black/40
            blur-[7px]
          "
        />
      ) : null}

      <motion.div
        initial={false}
        animate={{
          opacity: isReceiptVisible
            ? 1
            : 0,

          transform:
            stage === "printing" &&
            shouldMove
              ? shouldUseSteppedFeed
                ? printingTransformKeyframes
                : "translateY(0%)"
              : isReceiptVisible ||
                  !shouldMove
                ? "translateY(0%)"
                : "translateY(calc(-100% + 2px))",
        }}
        transition={{
          opacity: {
            duration: animate
              ? 0.16
              : 0,
            ease: easeOut,
          },

          transform: {
            duration: shouldMove
              ? 1.75
              : 0,

            ease:
              shouldUseSteppedFeed
                ? "linear"
                : easeInOut,

            times:
              shouldUseSteppedFeed
                ? printingKeyframeTimes
                : undefined,
          },
        }}
        aria-hidden={
          stage !== "complete"
        }
        className="
          relative isolate
          before:pointer-events-none
          before:absolute
          before:inset-x-3
          before:top-3
          before:bottom-4
          before:z-0
          before:rounded-sm
          before:shadow-[0_10px_28px_rgba(0,0,0,0.22)]
          before:content-['']
        "
      >
        {children}
      </motion.div>
    </div>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export const ReceiptPrinter = {
  Header: ReceiptPrinterHeader,
  Machine: ReceiptPrinterMachine,
  Output: ReceiptPrinterOutput,
  Paper: ReceiptPrinterPaper,
  Root: ReceiptPrinterRoot,
  Screen: ReceiptPrinterScreen,
  Status: ReceiptPrinterStatus,
};