"use client"

import type React from "react"
import { useState } from "react"

interface TabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  )
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export default function MutablePlatform() {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const tabs = [
    { label: "Exchange", value: 0 },
    { label: "Games", value: 1 },
    { label: "Developer", value: 2 },
  ]

  return (
    <div>
      <div style={{ borderBottom: "1px solid #ccc" }}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={(event) => handleChange(event, tab.value)}
            {...a11yProps(index)}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              backgroundColor: value === tab.value ? "#eee" : "transparent",
              border: "none",
              outline: "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TabPanel value={value} index={0}>
        Exchange Content
      </TabPanel>
      <TabPanel value={value} index={1}>
        Games Content
      </TabPanel>
      <TabPanel value={value} index={2}>
        Developer Content
      </TabPanel>
    </div>
  )
}
