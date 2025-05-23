import styled from "@emotion/styled"
import { cyberpunkTheme } from "@/styles/cyberpunk-theme"

// Base container with cyberpunk styling
export const CyberpunkContainer = styled.div`
  background-color: ${cyberpunkTheme.colors.background.dark};
  color: ${cyberpunkTheme.colors.text.primary};
  padding: 1.5rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent, 
      ${cyberpunkTheme.colors.glow.cyan}, 
      transparent
    );
    z-index: 1;
  }
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, 
      ${cyberpunkTheme.colors.glow.magenta}, 
      ${cyberpunkTheme.colors.glow.cyan}
    );
    z-index: 1;
  }
`

// Cyberpunk header
export const CyberpunkHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${cyberpunkTheme.colors.background.darker};
  border-bottom: 2px solid ${cyberpunkTheme.colors.border.cyan};
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, 
      ${cyberpunkTheme.colors.glow.cyan}, 
      transparent, 
      ${cyberpunkTheme.colors.glow.magenta}
    );
  }
`

// Cyberpunk heading
export const CyberpunkHeading = styled.h1`
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.display};
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
  text-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
  position: relative;
  
  &::before {
    content: attr(data-text);
    position: absolute;
    left: 2px;
    text-shadow: none;
    background: linear-gradient(45deg, 
      ${cyberpunkTheme.colors.text.magenta}, 
      ${cyberpunkTheme.colors.text.cyan}
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    z-index: -1;
    opacity: 0.6;
  }
`

// Cyberpunk subheading
export const CyberpunkSubheading = styled.h2`
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.display};
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 1rem 0;
  position: relative;
  display: inline-block;
  
  &::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, 
      ${cyberpunkTheme.colors.glow.cyan}, 
      transparent
    );
  }
`

// Cyberpunk paragraph
export const CyberpunkText = styled.p`
  color: ${cyberpunkTheme.colors.text.secondary};
  font-family: ${cyberpunkTheme.fonts.body};
  line-height: 1.6;
  margin-bottom: 1rem;
  
  strong {
    color: ${cyberpunkTheme.colors.text.cyan};
    font-weight: bold;
  }
`

// Cyberpunk button
export const CyberpunkButton = styled.button`
  background-color: transparent;
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.display};
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 15px ${cyberpunkTheme.colors.glow.cyan};
  }
  
  &:active {
    transform: translateY(2px);
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 255, 0.2),
      transparent
    );
    transition: all 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`

// Cyberpunk card
export const CyberpunkCard = styled.div`
  background-color: ${cyberpunkTheme.colors.background.darker};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, 
      ${cyberpunkTheme.colors.glow.cyan}, 
      ${cyberpunkTheme.colors.glow.magenta}
    );
  }
  
  &:hover {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
`

// Cyberpunk input
export const CyberpunkInput = styled.input`
  background-color: ${cyberpunkTheme.colors.background.darker};
  color: ${cyberpunkTheme.colors.text.primary};
  font-family: ${cyberpunkTheme.fonts.mono};
  padding: 0.75rem 1rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  width: 100%;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
    border-color: ${cyberpunkTheme.colors.border.cyan};
  }
  
  &::placeholder {
    color: ${cyberpunkTheme.colors.text.muted};
  }
`

// Cyberpunk select
export const CyberpunkSelect = styled.select`
  background-color: ${cyberpunkTheme.colors.background.darker};
  color: ${cyberpunkTheme.colors.text.primary};
  font-family: ${cyberpunkTheme.fonts.mono};
  padding: 0.75rem 1rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  width: 100%;
  margin-bottom: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300FFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem top 50%;
  background-size: 0.65rem auto;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
    border-color: ${cyberpunkTheme.colors.border.cyan};
  }
`

// Cyberpunk grid
export const CyberpunkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`

// Cyberpunk divider
export const CyberpunkDivider = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    ${cyberpunkTheme.colors.border.cyan}, 
    transparent
  );
  margin: 2rem 0;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: -3px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background-color: ${cyberpunkTheme.colors.glow.cyan};
    border-radius: 50%;
    box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
  }
`

// Cyberpunk badge
export const CyberpunkBadge = styled.span`
  display: inline-block;
  background-color: ${cyberpunkTheme.colors.background.darker};
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  margin-right: 0.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background-color: ${cyberpunkTheme.colors.glow.cyan};
  }
`

// Cyberpunk footer
export const CyberpunkFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${cyberpunkTheme.colors.background.darker};
  border-top: 1px solid ${cyberpunkTheme.colors.border.cyan};
  margin-top: 2rem;
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.875rem;
  color: ${cyberpunkTheme.colors.text.muted};
  
  a {
    color: ${cyberpunkTheme.colors.text.cyan};
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      color: ${cyberpunkTheme.colors.text.magenta};
      text-shadow: 0 0 5px ${cyberpunkTheme.colors.glow.magenta};
    }
  }
`

// Cyberpunk alert
export const CyberpunkAlert = styled.div`
  background-color: ${cyberpunkTheme.colors.background.darker};
  border-left: 4px solid ${cyberpunkTheme.colors.glow.cyan};
  padding: 1rem;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, 
      transparent, 
      rgba(0, 255, 255, 0.05), 
      transparent
    );
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`

// Cyberpunk code block
export const CyberpunkCode = styled.pre`
  background-color: ${cyberpunkTheme.colors.background.darker};
  color: ${cyberpunkTheme.colors.text.code};
  font-family: ${cyberpunkTheme.fonts.mono};
  padding: 1rem;
  border-left: 4px solid ${cyberpunkTheme.colors.border.magenta};
  overflow-x: auto;
  margin: 1rem 0;
  position: relative;
  
  &::before {
    content: "</>";
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: ${cyberpunkTheme.colors.text.muted};
    font-size: 0.75rem;
  }
  
  code {
    font-family: inherit;
  }
`

// Cyberpunk table
export const CyberpunkTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-family: ${cyberpunkTheme.fonts.mono};
  
  th {
    background-color: ${cyberpunkTheme.colors.background.darker};
    color: ${cyberpunkTheme.colors.text.cyan};
    text-align: left;
    padding: 0.75rem;
    border-bottom: 2px solid ${cyberpunkTheme.colors.border.cyan};
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  td {
    padding: 0.75rem;
    border-bottom: 1px solid ${cyberpunkTheme.colors.border.darker};
  }
  
  tr:hover td {
    background-color: rgba(0, 255, 255, 0.05);
  }
`

// Cyberpunk list
export const CyberpunkList = styled.ul`
  list-style: none;
  padding-left: 1rem;
  margin: 1rem 0;
  
  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    
    &::before {
      content: ">";
      position: absolute;
      left: 0;
      color: ${cyberpunkTheme.colors.text.cyan};
      font-family: ${cyberpunkTheme.fonts.mono};
    }
  }
`

// Cyberpunk link
export const CyberpunkLink = styled.a`
  color: ${cyberpunkTheme.colors.text.cyan};
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
  
  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: ${cyberpunkTheme.colors.glow.cyan};
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: ${cyberpunkTheme.colors.text.magenta};
    text-shadow: 0 0 5px ${cyberpunkTheme.colors.glow.magenta};
    
    &::after {
      transform: scaleX(1);
      transform-origin: left;
      background-color: ${cyberpunkTheme.colors.glow.magenta};
    }
  }
`

// Cyberpunk icon button
export const CyberpunkIconButton = styled.button`
  background-color: transparent;
  color: ${cyberpunkTheme.colors.text.cyan};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
  }
  
  &:active {
    transform: translateY(2px);
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 255, 0.2),
      transparent
    );
    transition: all 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`

// Cyberpunk progress bar
export const CyberpunkProgressContainer = styled.div`
  width: 100%;
  height: 1rem;
  background-color: ${cyberpunkTheme.colors.background.darker};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
`

export const CyberpunkProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  width: ${(props) => props.progress}%;
  background: linear-gradient(90deg, 
    ${cyberpunkTheme.colors.glow.cyan}, 
    ${cyberpunkTheme.colors.glow.magenta}
  );
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: progressShine 2s infinite linear;
  }
  
  @keyframes progressShine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`

// Cyberpunk toggle
export const CyberpunkToggleContainer = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin: 1rem 0;
`

export const CyberpunkToggleInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: rgba(0, 255, 255, 0.2);
    
    &::before {
      transform: translateX(1.5rem);
      background-color: ${cyberpunkTheme.colors.glow.cyan};
      box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
    }
  }
  
  &:focus + span {
    box-shadow: 0 0 0 2px ${cyberpunkTheme.colors.glow.cyan};
  }
`

export const CyberpunkToggleSlider = styled.span`
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
  background-color: ${cyberpunkTheme.colors.background.darker};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  margin-right: 0.5rem;
  transition: all 0.3s ease;
  
  &::before {
    content: "";
    position: absolute;
    top: 0.125rem;
    left: 0.125rem;
    width: 1.125rem;
    height: 1.125rem;
    background-color: ${cyberpunkTheme.colors.text.muted};
    transition: all 0.3s ease;
  }
`

export const CyberpunkToggleLabel = styled.span`
  color: ${cyberpunkTheme.colors.text.primary};
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.875rem;
`

// Cyberpunk tooltip
export const CyberpunkTooltip = styled.div`
  position: relative;
  display: inline-block;
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem;
    background-color: ${cyberpunkTheme.colors.background.darker};
    color: ${cyberpunkTheme.colors.text.cyan};
    font-family: ${cyberpunkTheme.fonts.mono};
    font-size: 0.75rem;
    white-space: nowrap;
    border: 1px solid ${cyberpunkTheme.colors.border.cyan};
    z-index: 10;
    box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
  }
`

// Cyberpunk avatar
export const CyberpunkAvatar = styled.div<{ src: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 0;
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
  border: 2px solid ${cyberpunkTheme.colors.border.cyan};
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 1px solid ${cyberpunkTheme.colors.border.cyan};
    opacity: 0.5;
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(0, 255, 255, 0.1),
      transparent
    );
  }
`

// Cyberpunk loader
export const CyberpunkLoader = styled.div`
  display: inline-block;
  width: 2rem;
  height: 2rem;
  position: relative;
  
  &::before, &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    border-top-color: ${cyberpunkTheme.colors.glow.cyan};
    border-right-color: ${cyberpunkTheme.colors.glow.magenta};
    border-radius: 50%;
    animation: cyberpunkSpin 1.5s linear infinite;
  }
  
  &::after {
    animation-duration: 3s;
    border-top-color: ${cyberpunkTheme.colors.glow.magenta};
    border-right-color: ${cyberpunkTheme.colors.glow.cyan};
    width: 70%;
    height: 70%;
    top: 15%;
    left: 15%;
    animation-direction: reverse;
  }
  
  @keyframes cyberpunkSpin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

// Cyberpunk notification
export const CyberpunkNotification = styled.div`
  background-color: ${cyberpunkTheme.colors.background.darker};
  border-left: 4px solid ${cyberpunkTheme.colors.glow.cyan};
  padding: 1rem;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
  animation: notificationPulse 2s infinite;
  
  @keyframes notificationPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0, 255, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0, 255, 255, 0);
    }
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, 
      transparent, 
      rgba(0, 255, 255, 0.05), 
      transparent
    );
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`

// Cyberpunk tabs
export const CyberpunkTabsContainer = styled.div`
  margin: 1.5rem 0;
`

export const CyberpunkTabList = styled.div`
  display: flex;
  border-bottom: 1px solid ${cyberpunkTheme.colors.border.cyan};
`

export const CyberpunkTab = styled.button<{ active?: boolean }>`
  background-color: transparent;
  color: ${(props) => (props.active ? cyberpunkTheme.colors.text.cyan : cyberpunkTheme.colors.text.muted)};
  font-family: ${cyberpunkTheme.fonts.display};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.75rem 1.5rem;
  border: none;
  border-bottom: 2px solid ${(props) => (props.active ? cyberpunkTheme.colors.glow.cyan : "transparent")};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${cyberpunkTheme.colors.text.cyan};
    background-color: rgba(0, 255, 255, 0.05);
  }
  
  ${(props) =>
    props.active &&
    `
    &::after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${cyberpunkTheme.colors.glow.cyan};
      box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
    }
  `}
`

export const CyberpunkTabPanel = styled.div`
  padding: 1.5rem 0;
`

// Cyberpunk accordion
export const CyberpunkAccordionItem = styled.div`
  margin-bottom: 0.5rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  background-color: ${cyberpunkTheme.colors.background.darker};
`

export const CyberpunkAccordionHeader = styled.button`
  width: 100%;
  text-align: left;
  background-color: transparent;
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.display};
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.05);
  }
  
  &::after {
    content: "+";
    font-size: 1.25rem;
    color: ${cyberpunkTheme.colors.text.cyan};
  }
  
  &[aria-expanded="true"]::after {
    content: "-";
  }
`

export const CyberpunkAccordionPanel = styled.div`
  padding: 0 1rem 1rem;
`

// Cyberpunk modal
export const CyberpunkModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

export const CyberpunkModalContent = styled.div`
  background-color: ${cyberpunkTheme.colors.background.dark};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  box-shadow: 0 0 20px ${cyberpunkTheme.colors.glow.cyan};
  max-width: 90%;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, 
      ${cyberpunkTheme.colors.glow.cyan}, 
      ${cyberpunkTheme.colors.glow.magenta}
    );
  }
`

export const CyberpunkModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${cyberpunkTheme.colors.border.cyan};
`

export const CyberpunkModalTitle = styled.h2`
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.display};
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
`

export const CyberpunkModalCloseButton = styled.button`
  background-color: transparent;
  color: ${cyberpunkTheme.colors.text.muted};
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${cyberpunkTheme.colors.text.cyan};
    text-shadow: 0 0 5px ${cyberpunkTheme.colors.glow.cyan};
  }
`

export const CyberpunkModalBody = styled.div`
  padding: 1.5rem;
`

export const CyberpunkModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid ${cyberpunkTheme.colors.border.cyan};
  gap: 0.5rem;
`

// Cyberpunk form
export const CyberpunkForm = styled.form`
  margin: 1.5rem 0;
`

export const CyberpunkFormGroup = styled.div`
  margin-bottom: 1.5rem;
`

export const CyberpunkLabel = styled.label`
  display: block;
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`

export const CyberpunkTextarea = styled.textarea`
  background-color: ${cyberpunkTheme.colors.background.darker};
  color: ${cyberpunkTheme.colors.text.primary};
  font-family: ${cyberpunkTheme.fonts.mono};
  padding: 0.75rem 1rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  width: 100%;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
    border-color: ${cyberpunkTheme.colors.border.cyan};
  }
  
  &::placeholder {
    color: ${cyberpunkTheme.colors.text.muted};
  }
`

export const CyberpunkCheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0.5rem;
`

export const CyberpunkCheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${cyberpunkTheme.colors.glow.cyan};
    border-color: ${cyberpunkTheme.colors.border.cyan};
    
    &::after {
      opacity: 1;
    }
  }
  
  &:focus + span {
    box-shadow: 0 0 0 2px ${cyberpunkTheme.colors.glow.cyan};
  }
`

export const CyberpunkCheckboxControl = styled.span`
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  background-color: ${cyberpunkTheme.colors.background.darker};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  
  &::after {
    content: "";
    position: absolute;
    top: 0.25rem;
    left: 0.4rem;
    width: 0.4rem;
    height: 0.6rem;
    border: solid ${cyberpunkTheme.colors.background.darker};
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
`

export const CyberpunkCheckboxLabel = styled.span`
  color: ${cyberpunkTheme.colors.text.primary};
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.875rem;
`

// Cyberpunk radio
export const CyberpunkRadioContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0.5rem;
`

export const CyberpunkRadioInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    border-color: ${cyberpunkTheme.colors.border.cyan};
    
    &::after {
      transform: scale(1);
    }
  }
  
  &:focus + span {
    box-shadow: 0 0 0 2px ${cyberpunkTheme.colors.glow.cyan};
  }
`

export const CyberpunkRadioControl = styled.span`
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  background-color: ${cyberpunkTheme.colors.background.darker};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  border-radius: 50%;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  
  &::after {
    content: "";
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: ${cyberpunkTheme.colors.glow.cyan};
    transform: scale(0);
    transition: transform 0.3s ease;
  }
`

export const CyberpunkRadioLabel = styled.span`
  color: ${cyberpunkTheme.colors.text.primary};
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.875rem;
`

// Cyberpunk range slider
export const CyberpunkRangeContainer = styled.div`
  width: 100%;
  margin: 1rem 0;
`

export const CyberpunkRangeInput = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: ${cyberpunkTheme.colors.background.darker};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    background-color: ${cyberpunkTheme.colors.glow.cyan};
    border: 1px solid ${cyberpunkTheme.colors.border.cyan};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 1.25rem;
    height: 1.25rem;
    background-color: ${cyberpunkTheme.colors.glow.cyan};
    border: 1px solid ${cyberpunkTheme.colors.border.cyan};
    cursor: pointer;
  }
  
  &:focus {
    box-shadow: 0 0 0 2px ${cyberpunkTheme.colors.glow.cyan};
  }
`

// Cyberpunk file input
export const CyberpunkFileInputContainer = styled.div`
  margin: 1rem 0;
`

export const CyberpunkFileInputLabel = styled.label`
  display: inline-block;
  background-color: transparent;
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.display};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 15px ${cyberpunkTheme.colors.glow.cyan};
  }
`

export const CyberpunkFileInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

export const CyberpunkFileInputText = styled.span`
  display: block;
  margin-top: 0.5rem;
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.75rem;
  color: ${cyberpunkTheme.colors.text.muted};
`

// Cyberpunk pagination
export const CyberpunkPaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`

export const CyberpunkPaginationButton = styled.button<{ active?: boolean }>`
  background-color: ${(props) => (props.active ? "rgba(0, 255, 255, 0.2)" : "transparent")};
  color: ${(props) => (props.active ? cyberpunkTheme.colors.text.cyan : cyberpunkTheme.colors.text.muted)};
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.875rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props) => (props.active ? cyberpunkTheme.colors.border.cyan : cyberpunkTheme.colors.border.darker)};
  margin: 0 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
    color: ${cyberpunkTheme.colors.text.cyan};
    border-color: ${cyberpunkTheme.colors.border.cyan};
  }
  
  ${(props) =>
    props.active &&
    `
    box-shadow: 0 0 10px ${cyberpunkTheme.colors.glow.cyan};
  `}
`

// Cyberpunk chip
export const CyberpunkChip = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${cyberpunkTheme.colors.background.darker};
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`

export const CyberpunkChipDelete = styled.button`
  background-color: transparent;
  color: ${cyberpunkTheme.colors.text.muted};
  border: none;
  font-size: 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${cyberpunkTheme.colors.text.cyan};
  }
`

// Cyberpunk menu
export const CyberpunkMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`

export const CyberpunkMenuButton = styled.button`
  background-color: transparent;
  color: ${cyberpunkTheme.colors.text.cyan};
  font-family: ${cyberpunkTheme.fonts.display};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
    box-shadow: 0 0 15px ${cyberpunkTheme.colors.glow.cyan};
  }
  
  &:active {
    transform: translateY(2px);
  }
`

export const CyberpunkMenuContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  min-width: 200px;
  background-color: ${cyberpunkTheme.colors.background.darker};
  border: 1px solid ${cyberpunkTheme.colors.border.cyan};
  box-shadow: 0 0 15px ${cyberpunkTheme.colors.glow.cyan};
  display: none;
  
  ${CyberpunkMenuContainer}:hover & {
    display: block;
  }
`

export const CyberpunkMenuItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background-color: transparent;
  color: ${cyberpunkTheme.colors.text.primary};
  font-family: ${cyberpunkTheme.fonts.mono};
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 1px solid ${cyberpunkTheme.colors.border.darker};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 255, 255, 0.1);
    color: ${cyberpunkTheme.colors.text.cyan};
  }
  
  &:last-child {
    border-bottom: none;
  }
`
