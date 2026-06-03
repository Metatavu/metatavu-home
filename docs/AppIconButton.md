# AppIconButton

A button that displays only an icon, used when space is limited or the action is universally understood. Always paired with a tooltip so the action is never ambiguous.

---

## Guidelines

### Do

- Always add a **tooltip** that clearly describes the action
- Use icons that are **immediately recognisable** and directly related to the action
- Use the small variant when placed inside **tables or dense layouts**

### Don't

- Use an icon button when a **text label would be clearer**
- Use icons **decoratively** — every icon must communicate an action
- Omit the tooltip — without it the button is inaccessible

---

## Usage

![Icon-only button](imgs/icon-button.png)

```tsx
<AppIconButton onClick={handlefilter} tooltip="Tooltip text">
  <FilterIcon />
</AppIconButton>
```


## Small Size

Use the small size when the button appears inside a **table row or compact container**.

![Small icon button in table](imgs/small-icon-button.png)

```tsx
<AppIconButton onClick={handledelete} tooltip="Tooltip text">
  <DeleteIcon />
</AppIconButton>
```