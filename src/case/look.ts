/**
 * How each case study looks. All four pages are made of the same parts
 * (Case.tsx); this file says which variant of each part a project gets, so
 * every page has its own feel without having its own code.
 *
 *   hero       the ground of the top of the page: "paper" (white) or "ink" (charcoal with grain)
 *   stage      a slab of charcoal behind the lower half of the hero picture, or none
 *   bleed      true = pictures run from edge to edge of the screen
 *   reading    "split": the opening sentence on the left and the rest beside it (editorial);
 *              "stack": one under the other
 *   challenge  the ground of the challenge statement
 *   built      "rows": the contributions as numbered rows; "cells": as a grid of cells
 *   pictures   the ground of the picture sequence
 *   pair       the project it is one half of ("two deliverables, one client"): the slug of the other half,
 *              what this one and the other one are, and whether the block sits near the top or by the status
 *   roles      the contributions that are the product's roles, by their titles in work.ts, from the widest
 *              access to the narrowest. They are drawn as one connected diagram and left out of the list
 *              under it, so nothing is said twice. Their words stay in work.ts.
 *
 * A project that is not listed gets the plain look.
 */

export type Ground = 'paper' | 'ink' | 'accent'

export type Look = {
  hero: 'paper' | 'ink'
  stage: 'none' | 'ink'
  bleed: boolean
  reading: 'split' | 'stack'
  challenge: Ground
  built: 'rows' | 'cells'
  pictures: 'paper' | 'ink'
  pair?: { with: string; here: string; there: string; place: 'top' | 'status' }
  roles?: string[]
}

const plain: Look = { hero: 'paper', stage: 'none', bleed: false, reading: 'stack', challenge: 'paper', built: 'rows', pictures: 'paper' }

const looks: Record<string, Look> = {
  // Editorial and community: paper, a wide two-column reading layout, pictures in a clean grid.
  shemoqmedi: { ...plain, reading: 'split', challenge: 'ink' },

  // Atmospheric and led by its pictures: charcoal with grain, pictures as large as the screen, few words.
  'kencho-room': {
    ...plain,
    hero: 'ink',
    bleed: true,
    pictures: 'ink',
    pair: { with: 'kencho-group', here: 'Showroom', there: 'Brand site', place: 'status' },
  },

  // A client and brand story, visibly the other half of Kencho Room: its picture stands on the showroom's charcoal.
  'kencho-group': {
    ...plain,
    stage: 'ink',
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
