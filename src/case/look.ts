/**
 * How each case study looks. All four pages are made of the same parts
 * (Case.tsx); this file says which variant of each part a project gets, so
 * every page has its own feel without having its own code.
 *
 *   hero       the ground of the top of the page: "paper" (white) or "ink" (charcoal with grain)
 *   reading    "split": the opening sentence on the left and the rest beside it (editorial);
 *              "stack": one under the other
 *   challenge  the ground of the challenge statement
 *   built      "rows": the contributions as numbered rows; "cells": as a grid of cells
 *   builtOn    the ground of "what I built"
 *   pair       the project it is one half of ("two deliverables, one client"): the slug of the other half,
 *              what this one and the other one are, and whether the block sits near the top or by the status
 *   roles      the contributions that are the product's roles, by their titles in cases.ts, from the widest
 *              access to the narrowest. They are drawn as one connected diagram and left out of the list
 *              under it, so nothing is said twice. Their words stay in cases.ts.
 *
 * A project that is not listed gets the plain look.
 */

export type Ground = 'paper' | 'ink' | 'accent'

export type Look = {
  hero: 'paper' | 'ink'
  reading: 'split' | 'stack'
  challenge: Ground
  built: 'rows' | 'cells'
  builtOn: 'paper' | 'ink'
  pair?: { with: string; here: string; there: string; place: 'top' | 'status' }
  roles?: string[]
}

const plain: Look = { hero: 'paper', reading: 'stack', challenge: 'paper', built: 'rows', builtOn: 'paper' }

const looks: Record<string, Look> = {
  // Editorial and community: paper, and a wide two-column reading layout.
  shemoqmedi: { ...plain, reading: 'split', challenge: 'ink' },

  // Atmospheric: charcoal with grain at the top and under what was built, few words.
  'kencho-room': {
    ...plain,
    hero: 'ink',
    builtOn: 'ink',
    pair: { with: 'kencho-group', here: 'Showroom', there: 'Brand site', place: 'status' },
  },

  // A client and brand story, visibly the other half of Kencho Room: the pair block sits near the top.
  'kencho-group': {
    ...plain,
    pair: { with: 'kencho-room', here: 'Brand site', there: 'Showroom', place: 'top' },
  },

  // A product: paper, one band of orange under the challenge, a diagram of its roles and its other parts as a grid.
  kalami: {
    ...plain,
    challenge: 'accent',
    built: 'cells',
    roles: ['Administration', 'Lecturers', 'Students'],
  },
}

export const lookFor = (slug: string): Look => looks[slug] ?? plain

/** The attributes of a section standing on that ground. Charcoal is also marked dark, so the monogram and the menu tab turn light over it. */
export const ground = (tone: Ground) => ({ 'data-ground': tone, 'data-theme': tone === 'ink' ? 'dark' : undefined })
