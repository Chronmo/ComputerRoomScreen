/// <reference types="vite/client" />

declare module '*.dat?raw' {
  const value: string;
  export default value;
}
