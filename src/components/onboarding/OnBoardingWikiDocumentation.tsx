import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { getWikiOnboardingSteps } from "./onboardingStepsWikiDocumentation";

const POPUP_WIDTH = 320;
const POPUP_HEIGHT = 140;

/**
 * Onboarding component
 *
 * Displays guided onboarding tooltips around selected UI elements.
 */
const OnboardingWikiDocumentation: React.FC = () => {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const ONBOARDING_KEY = "wikionboardingComplete";
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const { isAdmin, isDeveloper, isTester, isAccountant } = useUserRole();

  /**
   * Whether the current user has permission to view onboarding.
   */
  const isAllowed = isAdmin || isDeveloper || isTester || isAccountant;

  /**
   * The current set of onboarding steps, localized.
   */
  const onboardingSteps = getWikiOnboardingSteps();

  /**
   * Safely queries a DOM element by selector.
   *
   * @param selector - The CSS selector of the element to query.
   * @returns The matched DOM element or null.
   */
  const query = (selector?: string | null): Element | null => {
    if (!selector) return null;
    return document.querySelector(selector);
  };

  /**
   * Finds the next valid onboarding step starting from the given index.
   *
   * @param from - The index to start searching from.
   * @returns The index of the next valid step, or null if none found.
   */
  const findNextValid = (from = 0): number | null => {
    for (let i = from; i < onboardingSteps.length; i++) {
      if (query(onboardingSteps[i].selector)) return i;
    }
    return null;
  };

  /**
   * Finds the previous valid onboarding step starting from the given index.
   *
   * @param from - The index to start searching backward from.
   * @returns The index of the previous valid step, or null if none found.
   */
  const findPrevValid = (from: number): number | null => {
    for (let i = from; i >= 0; i--) {
      if (query(onboardingSteps[i].selector)) return i;
    }
    return null;
  };

  /**
   * On mount, checks if onboarding has already been completed and starts onboarding if allowed.
   */
  useEffect(() => {
    if (!isAllowed) return;
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      const first = findNextValid(0);
      setStepIndex(first);
    }
  }, []);

  /**
   * Updates the target element’s bounding rectangle when the step changes.
   */
  useEffect(() => {
    if (stepIndex === null) {
      setTargetRect(null);
      return;
    }

    const step = onboardingSteps[stepIndex];

    if (!step.selector) {
      // Step without selector: middle of screen
      setTargetRect(null);
      return;
    }

    const el = query(step.selector);
    if (!el) {
      const next = findNextValid(stepIndex + 1);
      setStepIndex(next);
      return;
    }

    const updateRect = () => {
      setTargetRect(el.getBoundingClientRect());
    };

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(el);

    updateRect();

    return () => {
      resizeObserver.disconnect();
    };
  }, [stepIndex]);

  /**
   * Keeps the popup aligned to the targetRect on window scroll or resize.
   */
  useEffect(() => {
    const update = () => {
      if (stepIndex === null) return;
      const step = onboardingSteps[stepIndex];
      const el = query(step.selector);
      if (!el) return;
      setTargetRect(el.getBoundingClientRect());
    };

    const onResize = () => {
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

  /**
   * Advances to the next valid onboarding step.
   */
  const handleNext = () => {
    if (stepIndex === null) return setStepIndex(null);
    const next = findNextValid(stepIndex + 1);
    setStepIndex(next);
  };

  /**
   * Goes back to the previous valid onboarding step.
   */
  const handlePrev = () => {
    if (stepIndex === null) return;
    const prev = findPrevValid(stepIndex - 1);
    setStepIndex(prev);
  };

  /**
   * Closes the onboarding popup and marks onboarding as completed in localStorage.
   */
  const handleClose = () => {
    setStepIndex(null);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  if (stepIndex === null) return null;

  const step = onboardingSteps[stepIndex];

  /**
   * Computes the popup position relative to the current targetRect.
   *
   * @returns An object containing `left` and `top` CSS pixel values.
   */
  const computePosition = () => {
    if (!targetRect) {
      return {
        left: Math.max((window.innerWidth - POPUP_WIDTH) / 2, 12),
        top: Math.max((window.innerHeight - POPUP_HEIGHT) / 2, 12)
      };
    }

    const pos = step.position ?? "bottom-center";
    const { top, left, width, height } = targetRect;
    const pageTop = top + window.scrollY;
    const pageLeft = left + window.scrollX;

    if (stepIndex === onboardingSteps.length - 1) {
      return {
        left: (window.innerWidth - POPUP_WIDTH) / 2,
        top: (window.innerHeight - POPUP_HEIGHT) / 2 + window.scrollY
      };
    }

    switch (pos) {
      case "center":
        return { left: pageLeft, top: pageTop - POPUP_HEIGHT - 12 };
      case "top-center":
        return {
          left: pageLeft + width / 2 - POPUP_WIDTH / 2,
          top: pageTop + 50 - POPUP_HEIGHT + 120
        };
      case "top-right":
        return {
          left: pageLeft + width - POPUP_WIDTH,
          top: pageTop - POPUP_HEIGHT - 12
        };
      case "bottom-left":
        return { left: pageLeft, top: pageTop + height + 12 };
      case "bottom-right":
        return {
          left: pageLeft + width - POPUP_WIDTH,
          top: pageTop + height + 12
        };
      case "bottom-center":
        return {
          left: pageLeft + width / 2 - POPUP_WIDTH / 2,
          top: pageTop + height + 24
        };
      case "top-left":
        return {
          left: pageLeft,
          top: pageTop - POPUP_HEIGHT - 12
        };
      default:
        return {
          left: pageLeft + width / 2 - POPUP_WIDTH / 2,
          top: pageTop + height + 12
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
            pointerEvents: "none"
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
          zIndex: 1400
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 2,
            backgroundColor: "background.paper",
            border: "2px solid",
            borderColor: "primary.main",
            boxShadow: (theme) => `0 8px 32px ${theme.palette.primary.main}66`
          }}
        >
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
            <Button
              size="small"
              onClick={handlePrev}
              disabled={findPrevValid(stepIndex - 1) === null}
            >
              {strings.onboarding.prev}
            </Button>

            <Typography variant="caption">
              {stepIndex + 1} / {onboardingSteps.length}
            </Typography>

            {stepIndex === onboardingSteps.length - 1 ? (
              <Button size="small" onClick={handleClose}>
                {strings.onboarding.close}
              </Button>
            ) : (
              <Button
                size="small"
                onClick={handleNext}
                disabled={findNextValid(stepIndex + 1) === null}
              >
                {strings.onboarding.next}
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default OnboardingWikiDocumentation;
