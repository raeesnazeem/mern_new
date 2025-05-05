import React, { useState } from "react"
import Button from '../common/Button'
import Input from '../common/Input'


import React from 'react'

const TemplateForm = ({ onSubmit }) => {

    const [formData, setFormData] = useState({
        name: '',
        sectionType: 'header',
        json: '{}',
        tags: []
    })

    const handleSubmit = () => {
        e.preventDefault()
        onSubmit(formData)
    }
  return (
    <form onSubmit={handleSubmit}>
    <Input
      label="Template Name"
      value={formData.name}
      onChange={(e) => setFormData({...formData, name: e.target.value})}
    />

    <select
        value={formData.sectionType}
        onChange={(e) => setFormData({...formData, sectionType: e.target.value})}
      >
        <option value="header">Header</option>
        <option value="about">About</option>
        <option value="cta">Call to Action</option>
        {/* Other section types */}
      </select>
      
      <textarea
        value={formData.json}
        onChange={(e) => setFormData({...formData, json: e.target.value})}
        placeholder="Paste Elementor JSON here"
      />
      
      <Button type="submit">Save Template</Button>
    </form>
  )
}

export default TemplateForm