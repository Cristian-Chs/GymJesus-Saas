declare module 'react' {
  export = React;
}

declare namespace React {
  export type ReactNode = any;
  export type ReactElement = any;
  export type SFC<P = {}> = any;
  export type FunctionComponent<P = {}> = any;
  export type FC<P = {}> = any;
  export type ComponentType<P = {}> = any;
  export type useState = any;
  export type useEffect = any;
  export type useAuth = any;
  export type FormEvent = any;
  export type ChangeEvent<T = any> = any;
  export const useState: any;
  export const useEffect: any;
  export const useMemo: any;
  export const useCallback: any;
  export const useRef: any;
  export const createContext: <T>(defaultValue: T) => any;
  export const useContext: <T>(context: any) => T;
  export const isValidElement: any;
  export const cloneElement: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface ElementAttributesProperty {
    props: {};
  }
}
