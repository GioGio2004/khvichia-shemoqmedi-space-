import type { Picture } from './work'

/**
 * The picture files of the case-study pages. They live in
 * src/assets/work/<slug>/ and are named <name>-<width>.<format>:
 *
 *   a desktop picture   <name>-1440.avif, <name>-1440.webp, <name>-2880.avif
 *   a phone picture     <name>-780.avif,  <name>-780.webp,  <name>-1170.avif
 *
 * A picture is asked for by the slug of its project and its name (the names
 * are listed in work.ts). If one of its three files is not there, asking for
 * it stops with an error that names the file: the build fails, and no page
 * ever goes out with a broken picture.
 */
const files = import.meta.glob<string>('../assets/work/*/*.{avif,webp}', { eager: true, query: '?url', import: 'default' })

/** The two widths each kind of picture is saved in: the plain one and the sharp one. */
const WIDTHS = { desktop: [1440, 2880], mobile: [780, 1170] } as const

export type PictureFiles = {
  /** For the AVIF source: both widths. */
  avif: string
  /** For the WebP source: the plain width. */
  webp: string
  /** The plain WebP file, for the img itself. */
  src: string
}

function file(slug: string, name: string, width: number, format: 'avif' | 'webp') {
  const path = `../assets/work/${slug}/${name}-${width}.${format}`
  const url = files[path]
  if (!url) {
    throw new Error(
      `The picture "${name}" of ${slug} is not complete: src/assets/work/${slug}/${name}-${width}.${format} is missing. ` +
        'Add the file, or take the picture out of work.ts.',
    )
  }
  return url
}

/** The addresses of one picture, ready for a <picture> element. */
export function pictureFiles(slug: string, picture: Pick<Picture, 'name' | 'kind'>): PictureFiles {
  const [plain, sharp] = WIDTHS[picture.kind]
  const webp = file(slug, picture.name, plain, 'webp')
  return {
    avif: `${file(slug, picture.name, plain, 'avif')} ${plain}w, ${file(slug, picture.name, sharp, 'avif')} ${sharp}w`,
    webp: `${webp} ${plain}w`,
    src: webp,
  }
}
