import { useState, useCallback } from 'react'
import type { EncounterDx } from './types'
import { INITIAL_DIAGNOSES } from './mock-data'

let nextId = 100

interface ToastState {
  visible: boolean
  message: string
}

export function useEncounterState() {
  const [diagnoses, setDiagnoses] = useState<EncounterDx[]>(INITIAL_DIAGNOSES)
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' })

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 3000)
  }, [])

  const addDiagnosis = useCallback((description: string, icdCode: string, addToProblems = false) => {
    const newDx: EncounterDx = {
      id: `dx-${nextId++}`,
      description,
      icdCode,
      addedToProblems: addToProblems,
    }
    setDiagnoses(prev => [...prev, newDx])

    if (addToProblems) {
      showToast('Added to Chart + Problems List')
    }
  }, [showToast])

  const removeDiagnosis = useCallback((id: string) => {
    setDiagnoses(prev => prev.filter(d => d.id !== id))
  }, [])

  const addToProblems = useCallback((id: string) => {
    setDiagnoses(prev => prev.map(d =>
      d.id === id ? { ...d, addedToProblems: true } : d
    ))
    showToast('Added to Problems List')
  }, [showToast])

  const dismissToast = useCallback(() => {
    setToast({ visible: false, message: '' })
  }, [])

  return {
    diagnoses,
    toast,
    addDiagnosis,
    removeDiagnosis,
    addToProblems,
    dismissToast,
  }
}
