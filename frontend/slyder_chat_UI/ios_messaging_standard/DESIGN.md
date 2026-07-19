---
name: iOS Messaging Standard
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#3c4a3d'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#6c7b6b'
  outline-variant: '#bbcbb9'
  surface-tint: '#006d2f'
  primary: '#006d2f'
  on-primary: '#ffffff'
  primary-container: '#25d366'
  on-primary-container: '#005523'
  inverse-primary: '#3de273'
  secondary: '#1c695f'
  on-secondary: '#ffffff'
  secondary-container: '#a5ede0'
  on-secondary-container: '#226e63'
  tertiary: '#93492e'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffa07e'
  on-tertiary-container: '#78351b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#66ff8e'
  primary-fixed-dim: '#3de273'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005322'
  secondary-fixed: '#a8f0e3'
  secondary-fixed-dim: '#8cd4c7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#763319'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  large-title:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: 0.37px
  headline:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.41px
  body:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.41px
  subheadline:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.24px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0px
  label-bold:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: -0.08px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-edge: 16px
  gutter-list: 12px
  stack-compact: 4px
  stack-default: 8px
  inset-card: 12px
  header-height-expanded: 96px
  header-height-collapsed: 44px
---

## Brand & Style
The design system focuses on a high-fidelity recreation of the iOS 17 messaging experience. It prioritizes system-level familiarity, utilizing the HIG (Human Interface Guidelines) to ensure the interface feels native to the hardware. 

The aesthetic is **Corporate / Modern**, characterized by precision, subtle depth, and a highly structured information hierarchy. The emotional response is one of reliability, efficiency, and seamlessness. Interactions should feel instantaneous, with a layout that rewards muscle memory through standard iOS patterns: large collapsible headers, bottom navigation, and left-to-right swipe gestures.

## Colors
The palette is centered around the recognizable brand green, used sparingly for primary actions and status indicators. 

- **Functional Neutrals:** Use system-standard grays for secondary text and borders. In Light Mode, the `grouped_background` is essential for separating chat list sections.
- **Chat Specifics:** The chat environment uses a specific tinted wallpaper (`#EFE7DD` in light) to reduce eye strain.
- **Dark Mode:** Surfaces transition to pure black (`#000000`) for OLED efficiency, while containers use `surface_dark` to maintain depth hierarchy.
- **Destructive:** Standard iOS Red is used for "Delete" or "Clear Chat" actions.

## Typography
This design system utilizes **Inter** as a functional equivalent to SF Pro for cross-platform consistency while mimicking the tight tracking and optical sizing of the iOS system font.

- **Large Titles:** Reserved for the top of the main navigation views (Chats, Settings). These must transition to a centered `headline` size within the Navigation Bar upon scroll.
- **Body Text:** The 17pt size is the standard for chat bubbles and primary list labels.
- **Meta-data:** Use `caption` for timestamps and message status.
- **Hierarchy:** Use `subheadline` for the "last message" snippet in the chat list, restricted to two lines of text with truncation.

## Layout & Spacing
The layout follows a **Fixed Grid** logic with standardized side margins of 16px. 

- **List Rhythm:** Chat rows have a fixed height (approx 74px) with a 12px gutter between the avatar and the text stack.
- **Safe Areas:** Adhere strictly to the iOS Dynamic Island and bottom "home indicator" safe areas.
- **Separators:** In lists, separators are 0.5pt thin lines. They should be inset to align with the text, not the avatar (16px + avatar width + gutter).
- **Mobile/Tablet:** On larger screens (iPad), the system transitions to a split-view controller (Sidebar on the left, active chat on the right) rather than a fluid stretch.

## Elevation & Depth
The system uses **Tonal Layers** and **Backdrop Blurs** rather than traditional shadows to define depth.

- **Navigation Bars:** Utilize `systemBlur` (Ultra Thin Material) with a bottom separator. The background should be translucent, allowing content to peek through as it scrolls under.
- **Tab Bar:** Fixed at the bottom with a background blur and a subtle top border.
- **Modals:** Use the "Sheet" pattern where the background content scales down and dims, and the new surface slides in from the bottom with a 10px corner radius.
- **Chat Bubbles:** These are flat elements. Depth is communicated via the "tail" pointing toward the sender, not via shadows.

## Shapes
The design system adopts the iOS "Squircle" approach for all containers.

- **Avatars:** Strictly circular (50% radius) for personal chats; rounded squares for Communities or Groups.
- **Inputs:** Search bars use a pill shape (fully rounded ends).
- **Cards/Buttons:** Use `rounded-lg` (10px-12px) for grouped settings cards and action buttons. 
- **Chat Bubbles:** Use a 16px radius for the main body, with a custom "tail" path that merges seamlessly into the corner.

## Components

### Navigation & Search
- **Bottom Tab Bar:** 5-tab layout. Active state uses the Primary Green. Icons are SF Symbol 3 (or equivalent) in "Medium" weight.
- **Search Bar:** Centered in the header below the Large Title. Light grey background with a "Magnifying Glass" icon and "Search" placeholder.

### Messaging
- **Chat Bubbles:** 
  - *Outgoing:* Primary Green tint, right-aligned. 
  - *Incoming:* White/Dark Grey tint, left-aligned. 
  - *Tails:* Only appear on the final message of a consecutive stack from the same sender.
- **Unread Badge:** Solid Primary Green circle with white centered `caption-bold` text.

### Lists
- **Chat Row:** 
  - Left: 52px Avatar. 
  - Center: Stacked "Display Name" (Headline) and "Message Snippet" (Subheadline, Grey). 
  - Right: "Timestamp" (Caption, Grey) and optional "Unread Badge" or "Mute" icon.
- **Settings Rows:** Standard iOS grouped list style with Chevron-Right accessory.

### Inputs
- **Composer:** A growing text area within a white/dark-grey bar. Left side contains a "+" button for attachments; right side contains a "Camera" and "Microphone" (which swaps to a "Send" arrow upon typing).