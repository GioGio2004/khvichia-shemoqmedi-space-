/**
 * What the menu lists, in order. An entry with `sheet` is a button that
 * brings a full-screen sheet down from the menu (About: who he is; Contact:
 * how to reach him). The others are links to the element with that id on the
 * home page. Change, add or remove lines here and the menu follows.
 */
export const sections: { id: string; label: string; sheet?: 'about' | 'contact' }[] = [
  { id: 'about', label: 'About', sheet: 'about' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact', sheet: 'contact' },
]
