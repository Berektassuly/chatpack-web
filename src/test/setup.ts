import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock the WASM module
vi.mock('../wasm/chatpack_wasm.js', () => ({
  default: vi.fn(() => Promise.resolve()),
  convert: vi.fn((input) => input),
  version: vi.fn(() => '0.0.0-mock'),
}))
