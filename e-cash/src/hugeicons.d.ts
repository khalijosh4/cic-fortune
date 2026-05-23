type IconSvgObject = readonly (readonly [string, { readonly [key: string]: string | number }])[]

declare module "@hugeicons/core-free-icons/dist/esm/*" {
  const icon: IconSvgObject
  export default icon
}
