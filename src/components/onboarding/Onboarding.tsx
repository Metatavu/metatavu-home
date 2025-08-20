import React, { useEffect, useRef, useState } from "react";
import { Box, Paper, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { onboardingSteps } from "./onboardingSteps";

const POPUP_WIDTH = 320;
const POPUP_HEIGHT = 140;

/**
 * Onboarding component
 *
 * Displays guided onboarding tooltips around selected UI elements.
 */
const Onboarding: React.FC = () => {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  /**
   * Safely query a DOM element by selector.
   *
   * @param selector - CSS selector string
   * @returns Element or null if not found
   */
  const query = (selector?: string | null): Element | null => {
    if (!selector) return null;
    return document.querySelector(selector);
  };

  /**
   * Find the next valid onboarding step starting from a given index.
   *
   * @param from - Index to start searching from
   * @returns Index of valid step or null
   */
  const findNextValid = (from = 0): number | null => {
    for (let i = from; i < onboardingSteps.length; i++) {
      if (query(onboardingSteps[i].selector)) return i;
    }
    return null;
  };

  /**
   * Find the previous valid onboarding step starting from a given index.
   *
   * @param from - Index to start searching backwards from
   * @returns Index of valid step or null
   */
  const findPrevValid = (from: number): number | null => {
    for (let i = from; i >= 0; i--) {
      if (query(onboardingSteps[i].selector)) return i;
    }
    return null;
  };

  // Initialize onboarding at the first valid step after mount
  useEffect(() => {
    const first = findNextValid(0);
    setStepIndex(first);
  }, []);

  // Update the targetRect whenever the current step changes
  useEffect(() => {
    if (stepIndex === null) {
      setTargetRect(null);
      return;
    }
    const step = onboardingSteps[stepIndex];
    const el = query(step.selector);
    if (!el) {
      // if element disappeared, skip forward to next available step
      const next = findNextValid(stepIndex + 1);
      setStepIndex(next);
      return;
    }
    setTargetRect(el.getBoundingClientRect());
  }, [stepIndex]);

  // Keep the popup aligned to targetRect on scroll/resize
  useEffect(() => {
    const update = () => {
      if (stepIndex === null) return;
      const step = onboardingSteps[stepIndex];
      const el = query(step.selector);
      if (!el) return;
      setTargetRect(el.getBoundingClientRect());
    };

    const onResize = () => {
      // throttle updates with requestAnimationFrame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stepIndex]);

  // Navigation helpers
  const handleNext = () => {
    if (stepIndex === null) return setStepIndex(null);
    const next = findNextValid(stepIndex + 1);
    setStepIndex(next);
  };

  const handlePrev = () => {
    if (stepIndex === null) return;
    const prev = findPrevValid(stepIndex - 1);
    setStepIndex(prev);
  };

  const handleClose = () => setStepIndex(null);

  if (stepIndex === null) return null;

  const step = onboardingSteps[stepIndex];

  /**
   * Compute popup position relative to targetRect.
   *
   * @returns CSS coordinates { left, top }
   */
  const computePosition = () => {
    if (!targetRect) {
      // fallback: center of screen
      return {
        left: Math.max((window.innerWidth - POPUP_WIDTH) / 2, 12),
        top: Math.max((window.innerHeight - POPUP_HEIGHT) / 2, 12),
      };
    }

    const pos = step.position ?? "bottom-center";
    const { top, left, width, height } = targetRect;
    const pageTop = top + window.scrollY;
    const pageLeft = left + window.scrollX;

    if (stepIndex === onboardingSteps.length - 1) {
      return {
        left: (window.innerWidth - POPUP_WIDTH) / 2,
        top: (window.innerHeight - POPUP_HEIGHT) / 2 + window.scrollY,
      };
    }

    switch (pos) {
      case "center":
        return { left: pageLeft, top: pageTop - POPUP_HEIGHT - 12 };
      case "top-center":
        return {
          left: pageLeft + width / 2 - POPUP_WIDTH / 2,
          top: pageTop + 50 - POPUP_HEIGHT + 120,
        };
      case "top-right":
        return {
          left: pageLeft + width - POPUP_WIDTH,
          top: pageTop - POPUP_HEIGHT - 12,
        };
      case "bottom-left":
        return { left: pageLeft, top: pageTop + height + 12 };
      case "bottom-right":
        return {
          left: pageLeft + width - POPUP_WIDTH,
          top: pageTop + height + 12,
        };
      default:
        return {
          left: pageLeft + width / 2 - POPUP_WIDTH / 2,
          top: pageTop + height + 12,
        };
    }
  };

  const { left, top } = computePosition();

  return (
    <>
      {/* highlight box */}
      {targetRect && (
        <Box
          sx={{
            position: "absolute",
            left: targetRect.left + window.scrollX - 6,
            top: targetRect.top + window.scrollY - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: 2,
            border: "2px solid",
            borderColor: "primary.main",
            boxShadow: (theme) => `0 6px 18px ${theme.palette.primary.main}33`,
            zIndex: 1300,
            pointerEvents: "none",
          }}
        />
      )}

      {/* popup card */}
      <Box
        sx={{
          position: "absolute",
          left,
          top,
          width: POPUP_WIDTH,
          zIndex: 1400,
        }}
      >
        <Paper elevation={6} sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">{step.title}</Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {step.content}
          </Typography>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Button size="small" onClick={handlePrev} disabled={findPrevValid(stepIndex - 1) === null}>
              Previous
            </Button>

            <Typography variant="caption">
              {stepIndex + 1} / {onboardingSteps.length}
            </Typography>

            <Button size="small" onClick={handleNext} disabled={findNextValid(stepIndex + 1) === null}>
              Next
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Onboarding;
