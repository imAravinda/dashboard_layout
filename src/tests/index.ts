// Test index file - exports all test utilities and constants
export * from './test-utils'
export * from './setup'

// Re-export test utilities for easy importing
export { render, screen, fireEvent, waitFor, userEvent } from '@testing-library/react'
export { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
