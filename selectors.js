import { useStore } from 'zustand'
import { vanillaStore } from './vanillaStore'

export const useBoundStore = (selector) => useStore(vanillaStore, selector)