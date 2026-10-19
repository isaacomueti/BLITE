/** Generated SVG artwork shared with the website (see ../../../assets/js/art.js). */
declare const BliteArt: {
  /** Top-down dish or equipment illustration on a transparent background. */
  dish(kind: string, seed?: string): string;
  scene(kind: string, seed?: string, bg?: [string, string]): string;
  photo(label: string, seed?: string): string;
  garnish: Record<'chilli' | 'leaf' | 'pepper' | 'grain', string>;
};
export default BliteArt;
