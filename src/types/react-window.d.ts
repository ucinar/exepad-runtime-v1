// Type declarations for react-window
declare module 'react-window' {
  import { ComponentType, CSSProperties, ReactElement } from 'react';

  export interface ListChildComponentProps<T = any> {
    data: T;
    index: number;
    style: CSSProperties;
    isScrolling?: boolean;
  }

  export interface FixedSizeListProps<T = any> {
    children: ComponentType<ListChildComponentProps<T>>;
    className?: string;
    direction?: 'ltr' | 'rtl' | 'horizontal' | 'vertical';
    height: number | string;
    initialScrollOffset?: number;
    innerRef?: React.Ref<any>;
    innerElementType?: string | ComponentType;
    itemCount: number;
    itemData?: T;
    itemKey?: (index: number, data: T) => any;
    itemSize: number;
    onItemsRendered?: (props: {
      overscanStartIndex: number;
      overscanStopIndex: number;
      visibleStartIndex: number;
      visibleStopIndex: number;
    }) => void;
    onScroll?: (props: {
      scrollDirection: 'forward' | 'backward';
      scrollOffset: number;
      scrollUpdateWasRequested: boolean;
    }) => void;
    outerRef?: React.Ref<any>;
    outerElementType?: string | ComponentType;
    overscanCount?: number;
    style?: CSSProperties;
    useIsScrolling?: boolean;
    width: number | string;
  }

  export const FixedSizeList: ComponentType<FixedSizeListProps>;
}
