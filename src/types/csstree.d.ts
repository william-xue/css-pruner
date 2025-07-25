declare module 'csstree' {
  export interface CSSTreeNode {
    type: string;
    [key: string]: any;
  }

  export interface AST {
    type: string;
    children: any;
  }

  export function parse(css: string, options?: any): AST;
  export function walk(ast: AST, callback: (node: any, item?: any, list?: any) => void): void;
  export function generate(ast: AST): string;
}