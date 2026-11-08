// Minimal typings for the parts of "page-flip" (StPageFlip, MIT, free) that this project uses.
declare module 'page-flip' {
  export interface FlipSettings {
    width: number;
    height: number;
    size: 'fixed' | 'stretch';
    usePortrait: boolean;
    showCover: boolean;
    startPage: number;
    drawShadow: boolean;
    maxShadowOpacity: number;
    flippingTime: number;
    showPageCorners: boolean;
    swipeDistance: number;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    mobileScrollSupport: boolean;
  }

  export class PageFlip {
    constructor(parent: HTMLElement, settings: Partial<FlipSettings>);
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void;
    on(event: 'flip' | 'changeOrientation' | 'changeState' | 'init' | 'update', cb: (e: { data: unknown }) => void): this;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    flip(page: number, corner?: 'top' | 'bottom'): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    destroy(): void;
  }
}
